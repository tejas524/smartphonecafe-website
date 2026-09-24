/** Consistent admin page header: title, optional blurb, right-aligned action. */
export default function PageHeader({ title, blurb, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[1.5rem] font-extrabold tracking-[-0.025em] text-ink-950 sm:text-[1.75rem]">
          {title}
        </h1>
        {blurb ? <p className="mt-1 text-[0.9375rem] text-ink-500">{blurb}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
