import Icon from "../../components/Icon.jsx";

/** Inline spinner used inside buttons and small areas. */
export function Spinner({ size = 18, className = "" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-line bg-white px-6 py-16 text-ink-500">
      <span className="text-accent-600">
        <Spinner size={26} />
      </span>
      <p className="text-[0.9375rem]">{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", body, icon = "info", action }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-4 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
        {title}
      </p>
      {body ? <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", body, onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-red-500/25 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Icon name="alert" size={22} />
      </span>
      <p className="mt-4 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
        {title}
      </p>
      {body ? <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">{body}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong bg-white px-4 py-2 text-[0.875rem] font-semibold text-ink-800 transition-colors hover:bg-paper-mute"
        >
          <Icon name="refresh" size={16} />
          Retry
        </button>
      ) : null}
    </div>
  );
}
