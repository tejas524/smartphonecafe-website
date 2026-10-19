import Reveal from "../ui/Reveal.jsx";

/**
 * Inner-page header — a compact, premium retail masthead.
 *
 * A near-white surface with a faint grid and a soft cobalt glow sets every
 * inner page apart from the homepage's dark photographic hero while keeping
 * one consistent rhythm. An accent rule leads the eyebrow so the header reads
 * as branded rather than generic.
 */
export default function PageHero({ eyebrow, title, lead, children, aside, compact = false }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper-soft">
      {/* Faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(8 9 12 / 0.028) 1px, transparent 1px), linear-gradient(to bottom, rgb(8 9 12 / 0.028) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Soft cobalt glow, upper-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(47 107 255 / 0.14) 0%, transparent 70%)",
        }}
      />

      <div className={`shell relative ${compact ? "py-7 sm:py-10 lg:py-12" : "py-9 sm:py-14 lg:py-[4.5rem]"}`}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            {eyebrow && (
              <Reveal className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-accent-500"
                />
                <span className="eyebrow text-accent-600">{eyebrow}</span>
              </Reveal>
            )}

            <Reveal
              as="h1"
              delay={60}
              className="mt-4 text-[clamp(1.75rem,5vw,2rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-ink-950 sm:text-[2.5rem] lg:text-[3rem]"
            >
              {title}
            </Reveal>

            {lead && (
              <Reveal
                as="p"
                delay={120}
                className="mt-3 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-600 sm:mt-5 sm:text-[1.0625rem]"
              >
                {lead}
              </Reveal>
            )}

            {children && (
              <Reveal delay={180} className={compact ? "mt-5" : "mt-6 sm:mt-8"}>
                {children}
              </Reveal>
            )}
          </div>

          {aside && (
            <Reveal delay={240} className="lg:col-span-5">
              {aside}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
