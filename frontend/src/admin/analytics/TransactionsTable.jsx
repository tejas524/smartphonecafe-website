import Icon from "../../components/Icon.jsx";
import { inr, formatDate, TYPE_LABEL, saleRevenue, saleCost, saleProfit } from "./format.js";

const TYPE_BADGE = {
  smartphone: "bg-accent-50 text-accent-700",
  accessory: "bg-accent-100 text-accent-700",
  repair: "bg-wa-500/10 text-wa-700",
  other: "bg-paper-mute text-ink-600",
};

function TypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${TYPE_BADGE[type] || TYPE_BADGE.other}`}>
      {TYPE_LABEL[type] || type}
    </span>
  );
}

function Profit({ row }) {
  const p = saleProfit(row);
  return <span className={p < 0 ? "font-semibold text-red-600" : "font-semibold text-wa-700"}>{inr(p)}</span>;
}

function Actions({ row, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(row)}
        aria-label="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-accent-50 hover:text-accent-700"
      >
        <Icon name="pencil" size={16} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(row)}
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}

/**
 * Recent transactions (sales). Desktop shows a scroll-safe table; below `lg`
 * each sale becomes a card so nothing overflows the viewport horizontally.
 */
export default function TransactionsTable({ rows, onEdit, onDelete }) {
  return (
    <>
      {/* Desktop / tablet table (horizontally scrollable if space is tight) */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] lg:block">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper-soft text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Product / service</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Profit</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 text-[0.875rem]">
                <td className="whitespace-nowrap px-4 py-3 text-ink-700">{formatDate(row.transaction_date)}</td>
                <td className="px-4 py-3"><TypeBadge type={row.type} /></td>
                <td className="px-4 py-3 font-medium text-ink-900">{row.product_service_name}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-700">{row.quantity}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-900">{inr(saleRevenue(row))}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-600">{inr(saleCost(row))}</td>
                <td className="px-4 py-3 text-right tabular-nums"><Profit row={row} /></td>
                <td className="px-4 py-3 capitalize text-ink-600">{row.payment_method || "—"}</td>
                <td className="px-4 py-3"><Actions row={row} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[0.9375rem] font-bold tracking-[-0.01em] text-ink-950">
                  {row.product_service_name}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-[0.8125rem] text-ink-500">
                  <TypeBadge type={row.type} />
                  <span>{formatDate(row.transaction_date)}</span>
                </p>
              </div>
              <Profit row={row} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[0.8125rem]">
              <div className="flex justify-between gap-2"><dt className="text-ink-500">Qty</dt><dd className="tabular-nums text-ink-800">{row.quantity}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-500">Payment</dt><dd className="capitalize text-ink-800">{row.payment_method || "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-500">Revenue</dt><dd className="tabular-nums text-ink-900">{inr(saleRevenue(row))}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-500">Cost</dt><dd className="tabular-nums text-ink-700">{inr(saleCost(row))}</dd></div>
            </dl>
            <div className="mt-3 flex items-center justify-end border-t border-line pt-2">
              <Actions row={row} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
