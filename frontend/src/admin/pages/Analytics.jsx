import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../../components/Icon.jsx";
import { analyticsApi } from "../../lib/api.js";
import { useAdminAuth } from "../AdminAuth.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { Modal, ConfirmDialog } from "../ui/Modal.jsx";
import { LoadingState, EmptyState, ErrorState } from "../ui/states.jsx";
import KpiCards from "../analytics/KpiCards.jsx";
import TrendChart from "../analytics/TrendChart.jsx";
import CategoryChart from "../analytics/CategoryChart.jsx";
import TransactionsTable from "../analytics/TransactionsTable.jsx";
import ExpensesTable from "../analytics/ExpensesTable.jsx";
import SaleForm from "../analytics/SaleForm.jsx";
import ExpenseForm from "../analytics/ExpenseForm.jsx";
import { MONTHS, SALE_TYPES } from "../analytics/format.js";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i); // current-4 .. current+1

const selectCls =
  "rounded-[var(--radius-md)] border border-line bg-white px-3 py-2 text-[0.875rem] font-medium text-ink-900 outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-100";

function SectionCard({ title, subtitle, right, children }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[0.8125rem] text-ink-500">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function Analytics() {
  const { expire } = useAdminAuth();

  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);

  const [overview, setOverview] = useState(null);
  const [salesRows, setSalesRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [saleModal, setSaleModal] = useState(null); // { record } | { }
  const [expenseModal, setExpenseModal] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind:'sale'|'expense', row }
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [ov, salesPayload, expPayload] = await Promise.all([
        analyticsApi.overview(month, year),
        analyticsApi.sales(month, year),
        analyticsApi.expenses(month, year),
      ]);
      setOverview(ov);
      setSalesRows(salesPayload?.data || []);
      setExpenseRows(expPayload?.data || []);
      setStatus("ready");
    } catch (err) {
      if (err?.status === 401) {
        expire();
        return;
      }
      setStatus("error");
    }
  }, [month, year, expire]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSales = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return salesRows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (needle) {
        const hay = `${r.product_service_name || ""} ${r.payment_method || ""} ${r.notes || ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [salesRows, q, typeFilter]);

  const summary = overview?.summary;
  const periodLabel = overview?.period?.label || `${MONTHS[month - 1]} ${year}`;
  const hasSales = (summary?.salesCount || 0) > 0;
  const hasExpenses = (summary?.expenseCount || 0) > 0;
  const hasCategories = (overview?.categories?.length || 0) > 0;

  const afterWrite = () => {
    setSaleModal(null);
    setExpenseModal(null);
    load();
  };

  const doDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.kind === "sale") await analyticsApi.deleteSale(confirm.row.id);
      else await analyticsApi.deleteExpense(confirm.row.id);
      setConfirm(null);
      load();
    } catch (err) {
      if (err?.status === 401) {
        expire();
        return;
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Business Analytics"
        blurb="Actual sales and expenses you record — revenue, cost and profit for the month you choose."
      />

      {/* Controls toolbar: period selectors + add actions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="an-month">Month</label>
          <select
            id="an-month"
            className={selectCls}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="an-year">Year</label>
          <select
            id="an-year"
            className={selectCls}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSaleModal({})}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-600 px-4 py-2 text-[0.875rem] font-semibold text-white transition-colors hover:bg-accent-700 sm:flex-none"
          >
            <Icon name="plus" size={16} /> Add Sale
          </button>
          <button
            type="button"
            onClick={() => setExpenseModal({})}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-white px-4 py-2 text-[0.875rem] font-semibold text-ink-800 transition-colors hover:bg-paper-mute sm:flex-none"
          >
            <Icon name="receipt" size={16} /> Add Expense
          </button>
        </div>
      </div>

      {status === "error" ? (
        <ErrorState body="Could not load analytics for this period." onRetry={load} />
      ) : status === "loading" ? (
        <LoadingState label="Loading analytics…" />
      ) : (
        <div className="flex flex-col gap-5">
          <KpiCards summary={summary} />

          {/* Charts: main trend + supporting category breakdown */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SectionCard
                title="Revenue, cost & gross profit"
                subtitle={`Daily trend — ${periodLabel}`}
              >
                {hasSales ? (
                  <TrendChart data={overview.trend} />
                ) : (
                  <EmptyState
                    icon="chart"
                    title="No sales this month"
                    body={`Record a sale for ${periodLabel} and the daily trend will appear here.`}
                  />
                )}
              </SectionCard>
            </div>
            <div className="xl:col-span-1">
              <SectionCard title="Revenue by category" subtitle="Where the sales came from">
                {hasCategories ? (
                  <CategoryChart categories={overview.categories} />
                ) : (
                  <EmptyState icon="tag" title="No category data" body="Categories appear once you record sales." />
                )}
              </SectionCard>
            </div>
          </div>

          {/* Recent transactions */}
          <SectionCard
            title="Recent transactions"
            subtitle={`${filteredSales.length} of ${salesRows.length} sale${salesRows.length === 1 ? "" : "s"} — ${periodLabel}`}
            right={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                    <Icon name="search" size={15} />
                  </span>
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search product / payment…"
                    className="w-full rounded-[var(--radius-md)] border border-line bg-white py-2 pl-9 pr-3 text-[0.875rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 sm:w-56"
                  />
                </div>
                <select
                  className={selectCls}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter by type"
                >
                  <option value="all">All types</option>
                  {SALE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            }
          >
            {!hasSales ? (
              <EmptyState
                icon="banknote"
                title="No sales recorded"
                body={`Add your first sale for ${periodLabel} using the “Add Sale” button above.`}
              />
            ) : filteredSales.length === 0 ? (
              <EmptyState icon="search" title="No matching transactions" body="Try a different search term or type filter." />
            ) : (
              <TransactionsTable
                rows={filteredSales}
                onEdit={(row) => setSaleModal({ record: row })}
                onDelete={(row) => setConfirm({ kind: "sale", row })}
              />
            )}
          </SectionCard>

          {/* Expenses */}
          <SectionCard title="Expenses" subtitle={`${expenseRows.length} expense${expenseRows.length === 1 ? "" : "s"} — ${periodLabel}`}>
            {!hasExpenses ? (
              <EmptyState
                icon="receipt"
                title="No expenses recorded"
                body={`Add a business expense for ${periodLabel} using the “Add Expense” button above.`}
              />
            ) : (
              <ExpensesTable
                rows={expenseRows}
                onEdit={(row) => setExpenseModal({ record: row })}
                onDelete={(row) => setConfirm({ kind: "expense", row })}
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* Sale modal */}
      <Modal
        open={Boolean(saleModal)}
        onClose={() => setSaleModal(null)}
        title={saleModal?.record ? "Edit sale" : "Add sale"}
        wide
      >
        {saleModal ? (
          <SaleForm record={saleModal.record} onDone={afterWrite} onCancel={() => setSaleModal(null)} />
        ) : null}
      </Modal>

      {/* Expense modal */}
      <Modal
        open={Boolean(expenseModal)}
        onClose={() => setExpenseModal(null)}
        title={expenseModal?.record ? "Edit expense" : "Add expense"}
        wide
      >
        {expenseModal ? (
          <ExpenseForm record={expenseModal.record} onDone={afterWrite} onCancel={() => setExpenseModal(null)} />
        ) : null}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
        busy={deleting}
        title={confirm?.kind === "expense" ? "Delete expense?" : "Delete transaction?"}
        message="This permanently removes the record and updates the analytics."
        itemName={
          confirm?.kind === "expense"
            ? confirm?.row?.category
            : confirm?.row?.product_service_name
        }
      />
    </div>
  );
}
