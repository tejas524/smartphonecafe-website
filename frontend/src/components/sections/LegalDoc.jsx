import Icon from "../Icon.jsx";

/**
 * Shared presentational primitives for the Privacy Policy and Terms pages.
 * Kept deliberately simple: readable prose blocks on the standard page surface,
 * reusing the site's design tokens. No new colours or components are introduced.
 */

export function LegalSection({ id, heading, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-[1.25rem] font-bold tracking-[-0.01em] text-ink-950 sm:text-[1.375rem]">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ink-600">
        {children}
      </div>
    </section>
  );
}

/** A clearly-marked, owner-editable placeholder for details we must not invent. */
export function Placeholder({ children }) {
  return (
    <mark className="rounded bg-accent-50 px-1.5 py-0.5 font-medium text-accent-700 ring-1 ring-inset ring-accent-400/30">
      {children}
    </mark>
  );
}

/** A non-legal-advice notice, so factual description is never mistaken for counsel. */
export function LegalNotice({ children }) {
  return (
    <p className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-paper-soft px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-500">
      <Icon name="info" size={16} className="mt-0.5 shrink-0 text-ink-400" />
      <span>{children}</span>
    </p>
  );
}
