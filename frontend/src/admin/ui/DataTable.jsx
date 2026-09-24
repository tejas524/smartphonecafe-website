import Icon from "../../components/Icon.jsx";
import { Spinner } from "./states.jsx";

function Toggle({ on, onClick, busy, labelOn = "Visible", labelOff = "Hidden" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? labelOn : labelOff}
      onClick={onClick}
      disabled={busy}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-accent-600" : "bg-ink-200"
      } disabled:opacity-50`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[1.125rem]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function RowActions({ row, index, total, reorder, onEdit, onDelete, busy }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {reorder?.enabled ? (
        <>
          <button
            type="button"
            onClick={() => reorder.onMove(row, -1)}
            disabled={busy || index === 0}
            aria-label="Move up"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-paper-mute hover:text-ink-700 disabled:opacity-30"
          >
            <Icon name="chevronDown" size={16} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => reorder.onMove(row, 1)}
            disabled={busy || index === total - 1}
            aria-label="Move down"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-paper-mute hover:text-ink-700 disabled:opacity-30"
          >
            <Icon name="chevronDown" size={16} />
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => onEdit(row)}
        disabled={busy}
        aria-label="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-accent-50 hover:text-accent-700 disabled:opacity-40"
      >
        <Icon name="pencil" size={16} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(row)}
        disabled={busy}
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}

/**
 * Presentational list. Desktop renders a table; below `sm` each record becomes
 * a card so nothing overflows horizontally. All data + handlers are supplied by
 * the parent ResourcePage.
 */
export default function DataTable({
  schema,
  rows,
  columns,
  imageOf,
  titleOf,
  onEdit,
  onDelete,
  onToggle,
  reorder,
  busyId,
}) {
  const hasToggle = Boolean(schema.toggle);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-paper-soft text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
              <th className="px-4 py-3">{schema.label}</th>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3">
                  {c.label}
                </th>
              ))}
              {hasToggle ? <th className="px-4 py-3">Status</th> : null}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const busy = busyId === row.id;
              const img = imageOf?.(row);
              return (
                <tr key={row.id} className={`border-b border-line last:border-0 ${busy ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {schema.image ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-paper-mute">
                          {img ? (
                            <img src={img} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Icon name="image" size={16} className="text-ink-300" />
                          )}
                        </div>
                      ) : null}
                      <span className="font-semibold text-ink-900">{titleOf(row)}</span>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-[0.875rem] text-ink-600">
                      {c.render(row)}
                    </td>
                  ))}
                  {hasToggle ? (
                    <td className="px-4 py-3">
                      <Toggle
                        on={Boolean(row[schema.toggle])}
                        busy={busy}
                        onClick={() => onToggle(row)}
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <RowActions
                      row={row}
                      index={i}
                      total={rows.length}
                      reorder={reorder}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      busy={busy}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {rows.map((row, i) => {
          const busy = busyId === row.id;
          const img = imageOf?.(row);
          return (
            <li
              key={row.id}
              className={`rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)] ${
                busy ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {schema.image ? (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-paper-mute">
                    {img ? (
                      <img src={img} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <Icon name="image" size={18} className="text-ink-300" />
                    )}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{titleOf(row)}</p>
                  <dl className="mt-1 flex flex-col gap-0.5">
                    {columns.map((c) => (
                      <div key={c.key} className="flex gap-2 text-[0.8125rem]">
                        <dt className="text-ink-400">{c.label}:</dt>
                        <dd className="min-w-0 truncate text-ink-700">{c.render(row)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {hasToggle ? (
                  <Toggle on={Boolean(row[schema.toggle])} busy={busy} onClick={() => onToggle(row)} />
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-end border-t border-line pt-2">
                <RowActions
                  row={row}
                  index={i}
                  total={rows.length}
                  reorder={reorder}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  busy={busy}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
