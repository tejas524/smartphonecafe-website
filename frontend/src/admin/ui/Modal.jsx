import { useEffect } from "react";
import Icon from "../../components/Icon.jsx";
import { Spinner } from "./states.jsx";

/**
 * Accessible modal / side-drawer. On desktop it centers; the same markup reads
 * as a full-height right drawer on wider forms via `wide`. Escape closes it,
 * body scroll is locked while open, and a backdrop click closes it.
 */
export function Modal({ open, onClose, title, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[var(--radius-lg)] bg-paper-soft shadow-[var(--shadow-deep)] sm:rounded-[var(--radius-lg)] ${
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-4">
          <h2 className="font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-paper-mute hover:text-ink-700"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2.5 border-t border-line bg-white px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Delete/confirm dialog that names the item and disables while working. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  itemName,
  confirmLabel = "Delete",
  busy = false,
  destructive = true,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-[var(--radius-md)] border border-line-strong bg-white px-4 py-2 text-[0.875rem] font-semibold text-ink-700 transition-colors hover:bg-paper-mute disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-[0.875rem] font-semibold text-white transition-colors disabled:opacity-60 ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-accent-600 hover:bg-accent-700"
            }`}
          >
            {busy ? <Spinner size={16} /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[0.9375rem] leading-relaxed text-ink-700">
        {message || "This action cannot be undone."}
        {itemName ? (
          <>
            {" "}
            <span className="font-semibold text-ink-950">{itemName}</span> will be removed.
          </>
        ) : null}
      </p>
    </Modal>
  );
}
