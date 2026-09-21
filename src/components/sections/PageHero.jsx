import Reveal from "../ui/Reveal.jsx";

/**
 * Compact editorial page header used by every inner page.
 * Keeps a consistent rhythm without repeating the homepage's dark hero.
 */
export default function PageHero({ eyebrow, title, lead, children, aside }) {
  return (
    <section className="relative border-b border-line bg-paper-soft">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(8 9 12 / 0.028) 1px, transparent 1px), linear-gradient(to bottom, rgb(8 9 12 / 0.028) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="shell relative py-12 sm:py-14 lg:py-[4.5rem]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            {eyebrow && (
              <Reveal as="p" className="eyebrow text-accent-600">
                {eyebrow}
              </Reveal>
            )}

            <Reveal
              as="h1"
              delay={60}
              className="mt-4 text-[2rem] leading-[1.08] sm:text-[2.5rem] lg:text-[3rem]"
            >
              {title}
            </Reveal>

            {lead && (
              <Reveal
                as="p"
                delay={120}
                className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-600 sm:text-[1.125rem]"
              >
                {lead}
              </Reveal>
            )}

            {children && (
              <Reveal delay={180} className="mt-8">
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