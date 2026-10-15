import Reveal from "./Reveal.jsx";

/**
 * Standard section header: eyebrow → title → lead.
 * `tone="light"` inverts the palette for use on ink surfaces.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "dark",
  as: Heading = "h2",
  size = "md",
  className = "",
  id,
  children,
}) {
  const isLight = tone === "light";
  const alignCls =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  const titleSize =
    size === "lg"
      ? "text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem]"
      : size === "sm"
        ? "text-[1.375rem] sm:text-[1.625rem]"
        : "text-[1.5rem] sm:text-[2.125rem] lg:text-[2.5rem]";

  return (
    <div
      className={`flex max-w-3xl flex-col ${alignCls} ${className}`}
    >
      {eyebrow && (
        <Reveal
          as="p"
          className={`eyebrow mb-3.5 ${isLight ? "text-accent-400" : "text-accent-600"}`}
        >
          {eyebrow}
        </Reveal>
      )}

      <Reveal
        as={Heading}
        id={id}
        delay={60}
        className={`${titleSize} ${isLight ? "text-white" : "text-ink-950"}`}
      >
        {title}
      </Reveal>

      {lead && (
        <Reveal
          as="p"
          delay={120}
          className={`mt-4 text-[1rem] leading-relaxed sm:text-[1.125rem] ${
            isLight ? "text-ink-300" : "text-ink-600"
          } ${align === "center" ? "max-w-2xl" : ""}`}
        >
          {lead}
        </Reveal>
      )}

      {children && (
        <Reveal delay={180} className="mt-7">
          {children}
        </Reveal>
      )}
    </div>
  );
}