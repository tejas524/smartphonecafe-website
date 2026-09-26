/**
 * Business Analytics — authenticated, read-only aggregation endpoints.
 *
 * Mounted at /api/admin/analytics BEHIND requireAuth (see app.js), so an
 * unauthenticated request never reaches these handlers.
 *
 * Everything is aggregated server-side with parameterised, date-bounded queries
 * that use the date indexes on `sales` / `expenses`. The whole transaction table
 * is never shipped to the client just to total it: only one month's rows (a
 * bounded set) are returned for the transaction tables, and the KPI/trend/
 * category numbers are computed in SQL.
 *
 * Money note: DECIMAL columns arrive as strings (pool has decimalNumbers:false),
 * and SUM(...) of a DECIMAL is also a string or NULL. Every total is coerced to
 * a rounded Number here so the JSON is clean and no binary-float drift creeps in
 * on the two-decimal values.
 *
 *   GET /api/admin/analytics/overview?month=&year=
 *   GET /api/admin/analytics/sales?month=&year=
 *   GET /api/admin/analytics/expenses?month=&year=
 */

import express from "express";
import { query } from "../db/pool.js";
import { ok } from "../lib/respond.js";
import { badRequest } from "../lib/errors.js";

const router = express.Router();

const SALE_TYPES = ["smartphone", "accessory", "repair", "other"];

/** Rounds to 2 decimals as a Number, treating null/undefined as 0. */
function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Parses ?month=&year= into a validated, current-by-default period. */
function resolvePeriod(qs) {
  const now = new Date();
  let month = now.getMonth() + 1; // 1..12
  let year = now.getFullYear();

  if (qs.month !== undefined && qs.month !== "") {
    if (!/^\d{1,2}$/.test(String(qs.month))) {
      throw badRequest('Query parameter "month" must be a whole number 1–12.');
    }
    month = Number.parseInt(qs.month, 10);
    if (month < 1 || month > 12) {
      throw badRequest('Query parameter "month" must be between 1 and 12.');
    }
  }
  if (qs.year !== undefined && qs.year !== "") {
    if (!/^\d{4}$/.test(String(qs.year))) {
      throw badRequest('Query parameter "year" must be a 4-digit year.');
    }
    year = Number.parseInt(qs.year, 10);
    if (year < 2000 || year > 2100) {
      throw badRequest('Query parameter "year" must be between 2000 and 2100.');
    }
  }

  const pad = (n) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${pad(nextMonth)}-01`; // exclusive upper bound
  const daysInMonth = new Date(year, month, 0).getDate();

  const label = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return { month, year, start, end, daysInMonth, label };
}

/* ------------------------------------------------------------- overview -- */

router.get("/overview", async (req, res, next) => {
  try {
    const period = resolvePeriod(req.query);
    const range = [period.start, period.end];

    const [salesTotalsRows, expenseTotalRows, byDayRows, byTypeRows] = await Promise.all([
      query(
        `SELECT
           COUNT(*)                              AS count,
           SUM(\`selling_price\` * \`quantity\`) AS revenue,
           SUM(\`cost_price\` * \`quantity\`)    AS cost
         FROM \`sales\`
         WHERE \`transaction_date\` >= ? AND \`transaction_date\` < ?`,
        range
      ),
      query(
        `SELECT COUNT(*) AS count, SUM(\`amount\`) AS total
           FROM \`expenses\`
          WHERE \`expense_date\` >= ? AND \`expense_date\` < ?`,
        range
      ),
      query(
        `SELECT
           \`transaction_date\`                  AS d,
           SUM(\`selling_price\` * \`quantity\`) AS revenue,
           SUM(\`cost_price\` * \`quantity\`)    AS cost
         FROM \`sales\`
         WHERE \`transaction_date\` >= ? AND \`transaction_date\` < ?
         GROUP BY \`transaction_date\``,
        range
      ),
      query(
        `SELECT
           \`type\`                               AS type,
           COUNT(*)                               AS count,
           SUM(\`selling_price\` * \`quantity\`)  AS revenue,
           SUM(\`cost_price\` * \`quantity\`)     AS cost
         FROM \`sales\`
         WHERE \`transaction_date\` >= ? AND \`transaction_date\` < ?
         GROUP BY \`type\``,
        range
      ),
    ]);

    const revenue = money(salesTotalsRows[0]?.revenue);
    const cost = money(salesTotalsRows[0]?.cost);
    const grossProfit = money(revenue - cost);
    const expenses = money(expenseTotalRows[0]?.total);
    const netProfit = money(grossProfit - expenses);

    const summary = {
      revenue,
      cost,
      grossProfit,
      expenses,
      netProfit,
      salesCount: Number(salesTotalsRows[0]?.count || 0),
      expenseCount: Number(expenseTotalRows[0]?.count || 0),
    };

    // Trend: one point per calendar day of the month, zero-filled.
    const byDay = new Map();
    for (const row of byDayRows) {
      const day = Number(String(row.d).slice(8, 10));
      byDay.set(day, {
        revenue: money(row.revenue),
        cost: money(row.cost),
      });
    }
    const pad = (n) => String(n).padStart(2, "0");
    const trend = [];
    for (let day = 1; day <= period.daysInMonth; day += 1) {
      const hit = byDay.get(day) || { revenue: 0, cost: 0 };
      trend.push({
        day,
        date: `${period.year}-${pad(period.month)}-${pad(day)}`,
        revenue: hit.revenue,
        cost: hit.cost,
        grossProfit: money(hit.revenue - hit.cost),
      });
    }

    // Category breakdown, only for types that actually have data.
    const byType = new Map(
      byTypeRows.map((r) => [
        r.type,
        {
          type: r.type,
          count: Number(r.count || 0),
          revenue: money(r.revenue),
          cost: money(r.cost),
          profit: money(money(r.revenue) - money(r.cost)),
        },
      ])
    );
    const categories = SALE_TYPES.map((t) => byType.get(t)).filter(Boolean);

    return ok(res, { period: { month: period.month, year: period.year, label: period.label, daysInMonth: period.daysInMonth }, summary, trend, categories });
  } catch (err) {
    return next(err);
  }
});

/* ------------------------------------------- month-scoped transaction lists -- */

router.get("/sales", async (req, res, next) => {
  try {
    const period = resolvePeriod(req.query);
    const rows = await query(
      `SELECT \`id\`, \`transaction_date\`, \`type\`, \`product_service_name\`,
              \`quantity\`, \`selling_price\`, \`cost_price\`, \`payment_method\`,
              \`notes\`, \`created_at\`
         FROM \`sales\`
        WHERE \`transaction_date\` >= ? AND \`transaction_date\` < ?
        ORDER BY \`transaction_date\` DESC, \`id\` DESC`,
      [period.start, period.end]
    );
    return ok(res, rows, { count: rows.length, month: period.month, year: period.year });
  } catch (err) {
    return next(err);
  }
});

router.get("/expenses", async (req, res, next) => {
  try {
    const period = resolvePeriod(req.query);
    const rows = await query(
      `SELECT \`id\`, \`expense_date\`, \`category\`, \`description\`, \`amount\`,
              \`notes\`, \`created_at\`
         FROM \`expenses\`
        WHERE \`expense_date\` >= ? AND \`expense_date\` < ?
        ORDER BY \`expense_date\` DESC, \`id\` DESC`,
      [period.start, period.end]
    );
    return ok(res, rows, { count: rows.length, month: period.month, year: period.year });
  } catch (err) {
    return next(err);
  }
});

export default router;
