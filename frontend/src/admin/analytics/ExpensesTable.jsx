import Icon from "../../components/Icon.jsx";
import { inr, formatDate } from "./format.js";

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

/** Expenses list: desktop table + mobile cards, matching the transactions view. */
export default function ExpensesTable({ rows, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] lg:block">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper-soft text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 text-[0.875rem]">
                <td className="whitespace-nowrap px-4 py-3 text-ink-700">{formatDate(row.expense_date)}</td>
                <td className="px-4 py-3 font-medium text-ink-900">{row.category}</td>
                <td className="px-4 py-3 text-ink-600">{row.description || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-ink-900">{inr(row.amount)}</td>
                <td className="px-4 py-3"><Actions row={row} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 lg:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[0.9375rem] font-bold tracking-[-0.01em] text-ink-950">
                  {row.category}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-500">{formatDate(row.expense_date)}</p>
                {row.description ? <p className="mt-1 text-[0.8125rem] text-ink-600">{row.description}</p> : null}
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-ink-900">{inr(row.amount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-end border-t border-line pt-2">
              <Actions row={row} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
