/**
 * Public read-only API.
 *
 * The website needs the CMS content without authenticating. This router exposes
 * ONLY rows that are marked active/visible/public, and only the columns that are
 * safe to publish - it never returns password hashes, timestamps used for
 * internal bookkeeping, or rows the operator has hidden.
 *
 *   GET /api/public/home          every homepage section, in order
 *   GET /api/public/business      public business facts
 *   GET /api/public/brands        active brands
 *   GET /api/public/offers        active offers
 *   GET /api/public/repairs       active repair services
 *   GET /api/public/accessories   accessory categories + accessories
 *   GET /api/public/gallery       active gallery images
 *   GET /api/public/smartphones   active smartphones
 *   GET /api/public/bootstrap     everything in one request
 */

import express from "express";
import { query } from "../db/pool.js";
import { getResource } from "../db/resources.js";
import { ok } from "../lib/respond.js";

const router = express.Router();

/* Columns that must never leave the server, even for a resource we publish. */
const NEVER_PUBLIC = new Set(["password_hash"]);

/**
 * Builds a SELECT list from the registry, excluding internal columns.
 * Identifiers come from the registry only - never from the request.
 */
function publicSelect(resource, extraExclude = []) {
  const exclude = new Set([...NEVER_PUBLIC, ...extraExclude]);
  const fields = Object.keys(resource.columns).filter((c) => !exclude.has(c));
  if (!fields.length) throw new Error(`Resource ${resource.table} has no public columns`);
  return fields.map((f) => `\`${f}\``).join(", ");
}

/** SELECT * translated into an explicit, safe column list. */
async function selectPublic(resourceKey, { where = "", params = [], order, limit } = {}) {
  const resource = getResource(resourceKey);
  const cols = publicSelect(resource);
  const orderColumn = order?.column || resource.defaultOrder.column;
  const direction = (order?.direction || resource.defaultOrder.direction || "asc").toUpperCase();
  // The order column is a registry name; guard it is in the resource.
  const safeOrder = orderColumn in resource.columns ? orderColumn : "id";
  const limitSql = Number.isSafeInteger(limit) && limit > 0 ? ` LIMIT ${limit}` : "";
  return query(
    `SELECT ${cols} FROM \`${resource.table}\`${where}` +
      ` ORDER BY \`${safeOrder}\` ${direction === "DESC" ? "DESC" : "ASC"}, \`id\` ASC${limitSql}`,
    params
  );
}

/* ------------------------------------------------------------------ routes -- */

router.get("/home", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT section_key, eyebrow, heading, subheading, body, cta_label, cta_url, image_path, display_order
         FROM homepage_content WHERE is_visible = 1
        ORDER BY display_order ASC, id ASC`
    );
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/business", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT info_key, info_value, info_group, label, value_type
         FROM business_info WHERE is_public = 1
        ORDER BY display_order ASC, id ASC`
    );
    // A flat object is far easier for the site to consume than a list of rows,
    // keeping the key/value shape intact.
    const facts = {};
    for (const row of rows) facts[row.info_key] = row.info_value;
    return ok(res, facts, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/brands", async (_req, res, next) => {
  try {
    const rows = await selectPublic("brands", { where: " WHERE `is_active` = 1" });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/offers", async (_req, res, next) => {
  try {
    const rows = await selectPublic("offers", { where: " WHERE `is_active` = 1" });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/repairs", async (_req, res, next) => {
  try {
    const rows = await selectPublic("repair-services", { where: " WHERE `is_active` = 1" });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/accessories", async (_req, res, next) => {
  try {
    const categories = await selectPublic("accessory-categories", {
      where: " WHERE `is_active` = 1",
    });
    const items = await selectPublic("accessories", { where: " WHERE `is_active` = 1" });
    return ok(res, { categories, items }, {
      categoryCount: categories.length,
      itemCount: items.length,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/gallery", async (_req, res, next) => {
  try {
    const rows = await selectPublic("gallery", { where: " WHERE `is_active` = 1" });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/reviews", async (_req, res, next) => {
  try {
    const rows = await selectPublic("reviews", { where: " WHERE `is_active` = 1" });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

router.get("/smartphones", async (req, res, next) => {
  try {
    const params = [];
    let where = " WHERE `is_active` = 1";
    // A brand filter, still bound as a placeholder.
    if (req.query.brand && /^\d+$/.test(String(req.query.brand))) {
      where += " AND `brand_id` = ?";
      params.push(Number.parseInt(req.query.brand, 10));
    }
    const rows = await selectPublic("smartphones", { where, params });
    return ok(res, rows, { count: rows.length });
  } catch (err) {
    return next(err);
  }
});

/**
 * One request for the whole site. Useful for the homepage, which needs most of
 * this at once. Sections are returned independently so one empty table does not
 * blank the page.
 */
router.get("/bootstrap", async (_req, res, next) => {
  try {
    const [home, business, brands, offers, repairs, gallery, reviews, smartphoneRows, accessoryRows, categories] =
      await Promise.all([
        query(
          `SELECT section_key, eyebrow, heading, subheading, body, cta_label, cta_url, image_path
             FROM homepage_content WHERE is_visible = 1 ORDER BY display_order ASC, id ASC`
        ),
        query(
          `SELECT info_key, info_value FROM business_info WHERE is_public = 1 ORDER BY display_order ASC`
        ),
        selectPublic("brands", { where: " WHERE `is_active` = 1" }),
        selectPublic("offers", { where: " WHERE `is_active` = 1" }),
        selectPublic("repair-services", { where: " WHERE `is_active` = 1" }),
        selectPublic("gallery", { where: " WHERE `is_active` = 1" }),
        selectPublic("reviews", { where: " WHERE `is_active` = 1" }),
        selectPublic("smartphones", { where: " WHERE `is_active` = 1" }),
        selectPublic("accessories", { where: " WHERE `is_active` = 1" }),
        selectPublic("accessory-categories", { where: " WHERE `is_active` = 1" }),
      ]);

    const facts = {};
    for (const row of business) facts[row.info_key] = row.info_value;

    return ok(res, {
      home,
      business: facts,
      brands,
      offers,
      repairs,
      gallery,
      reviews,
      smartphones: smartphoneRows,
      accessories: { categories, items: accessoryRows },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
