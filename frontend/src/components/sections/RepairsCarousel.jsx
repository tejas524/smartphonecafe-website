import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "../ui/SectionHeading.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * RepairsCarousel — the homepage Repairs showcase.
 *
 * An interactive, premium preview of the store's repair services: a selector
 * (a vertical list on desktop, a horizontal touch strip on mobile) drives a
 * large active image with the service name, description and a WhatsApp enquiry
 * CTA. Autoplay advances the selection every few seconds, pauses on hover /
 * focus, restarts its timer after any manual selection, and is disabled under
 * prefers-reduced-motion.
 *
 * Everything is CMS-driven: MySQL -> API -> useSiteData().repairs (already
 * active-only and ordered by display_order). If a service has no photo, the
 * existing icon fallback fills the image area so the layout never breaks. The
 * `/repairs` page remains the full catalog; this is a showcase.
 */
const AUTOPLAY_MS = 3800;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** One selector row (desktop vertical list). */
function SelectorRow({ repair, index, isActive, onSelect, btnRef, onKeyDown }) {
  return (
    <button
      ref={btnRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(index)}
      onKeyDown={onKeyDown}
      className={`group/sel flex w-full items-center gap-3.5 rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-[background,border-color,box-shadow] duration-300 ${
        isActive
          ? "border-accent-300 bg-white shadow-[var(--shadow-card)]"
          : "border-transparent bg-transparent hover:bg-white/60"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-300 ${
          isActive ? "bg-accent-600 text-white" : "bg-paper-mute text-ink-500 group-hover/sel:text-accent-600"
        }`}
      >
        <Icon name={repair.icon || "wrench"} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-display text-[0.9375rem] font-bold tracking-[-0.015em] transition-colors duration-300 ${
            isActive ? "text-ink-950" : "text-ink-700"
          }`}
        >
          {repair.title}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
          isActive ? "scale-100 bg-accent-600" : "scale-0 bg-transparent"
        }`}
      />
    </button>
  );
}

export default function RepairsCarousel() {
  const { repairs, home } = useSiteData();
  const reduced = usePrefersReducedMotion();

  const items = repairs || [];
  const count = items.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const desktopBtns = useRef([]);
  const mobileBtns = useRef([]);
  const chipStripRef = useRef(null);

  const select = useCallback(
    (i) => {
      if (count === 0) return;
      setActive(((i % count) + count) % count);
    },
    [count]
  );

  // Autoplay: a timer that restarts whenever `active` changes (so a manual pick
  // resets the countdown), pauses on hover/focus, and never runs under reduced
  // motion or with a single slide.
  useEffect(() => {
    if (reduced || paused || count <= 1) return undefined;
    const id = setTimeout(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused, reduced, count]);

  // Keep the active mobile chip scrolled into view within its own strip.
  useEffect(() => {
    const btn = mobileBtns.current[active];
    const strip = chipStripRef.current;
    if (btn && strip) {
      const left = btn.offsetLeft - strip.offsetWidth / 2 + btn.offsetWidth / 2;
      strip.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
    }
  }, [active, reduced]);

  const makeKeyDown = useCallback(
    (refArr, orientation) => (e) => {
      const nextKeys = orientation === "vertical" ? ["ArrowDown"] : ["ArrowRight"];
      const prevKeys = orientation === "vertical" ? ["ArrowUp"] : ["ArrowLeft"];
      let target = null;
      if (nextKeys.includes(e.key)) target = (active + 1) % count;
      else if (prevKeys.includes(e.key)) target = (active - 1 + count) % count;
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = count - 1;
      if (target === null) return;
      e.preventDefault();
      select(target);
      refArr.current[target]?.focus();
    },
    [active, count, select]
  );

  const content = home.repairs || {};
  const activeRepair = items[active];

  if (!count) {
    return (
      <section
        id="repairs"
        className="border-y border-line bg-paper-soft"
        aria-labelledby="repairs-heading"
        style={{ scrollMarginTop: "5.5rem" }}
      >
        <div className="shell py-12 lg:py-24">
          <SectionHeading
            eyebrow={content.eyebrow || "Repairs"}
            id="repairs-heading"
            title={content.heading || "Mobile repair services"}
            lead={
              content.subheading ||
              "Bring the phone in and the fault is checked at the counter before anything goes ahead."
            }
          />
          <div className="mt-8 flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600 shadow-[var(--shadow-card)]">
              <Icon name="wrench" size={22} />
            </span>
            <h3 className="mt-5 font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink-950">
              Tell us what's wrong with your phone.
            </h3>
            <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
              Message us the problem and we'll tell you whether it can be fixed and what it involves.
            </p>
            <div className="mt-6">
              <Button href={waLink(waMessages.repairs())} external variant="wa" size="lg" icon="whatsapp">
                WhatsApp your problem
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const motion = !reduced;
  const captionKey = `${active}`;

  /* Large image / caption panel, shared by both layouts. */
  const showcase = (
    <div className="flex flex-col">
      {/* Image area — fixed 4:3, crossfaded, never distorted */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-mute shadow-[var(--shadow-card)]">
        {items.map((r, i) => (
          <div
            key={r.id}
            aria-hidden={i !== active}
            className={`absolute inset-0 ${motion ? "transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""} ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            {r.image ? (
              <img
                src={r.image}
                alt={r.title}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-paper-mute to-white text-accent-600">
                <Icon name={r.icon || "wrench"} size={56} />
                <span className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  SmartphoneCafe repairs
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption — announced politely; fades/rises in on change */}
      <div className="mt-5" aria-live="polite">
        <div key={captionKey} className={motion ? "rc-fade-in" : ""}>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-accent-600">
            {`Repair ${active + 1} of ${count}`}
          </p>
          <h3 className="mt-1.5 font-display text-[1.25rem] font-bold tracking-[-0.02em] text-ink-950 sm:text-[1.5rem]">
            {activeRepair.title}
          </h3>
          {activeRepair.blurb ? (
            <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-ink-600">
              {activeRepair.blurb}
            </p>
          ) : null}
          <div className="mt-5">
            <Button
              href={waLink(waMessages.repairService(activeRepair.title))}
              external
              variant="wa"
              size="md"
              icon="whatsapp"
              className="w-full sm:w-auto"
            >
              {`Ask about ${activeRepair.title.length > 22 ? "this repair" : activeRepair.title.toLowerCase()} on WhatsApp`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="repairs"
      className="border-y border-line bg-paper-soft"
      aria-labelledby="repairs-heading"
      style={{ scrollMarginTop: "5.5rem" }}
    >
      <div className="shell py-12 lg:py-24">
        <SectionHeading
          eyebrow={content.eyebrow || "Repairs"}
          id="repairs-heading"
          title={content.heading || "Mobile repair services"}
          lead={
            content.subheading ||
            "Common repairs we handle in store. Pick a service to see it, then message us on WhatsApp to get it sorted."
          }
        />

        <div
          className="mt-8 lg:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {/* Mobile: horizontal chip selector inside its own scroll container */}
          <div className="lg:hidden">
            <div
              ref={chipStripRef}
              role="tablist"
              aria-label="Repair services"
              aria-orientation="horizontal"
              className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              {items.map((r, i) => (
                <button
                  key={r.id}
                  ref={(el) => (mobileBtns.current[i] = el)}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={makeKeyDown(mobileBtns, "horizontal")}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8125rem] font-semibold transition-colors duration-200 ${
                    i === active
                      ? "border-accent-300 bg-white text-ink-950 shadow-[var(--shadow-card)]"
                      : "border-line bg-white/50 text-ink-600"
                  }`}
                >
                  <Icon
                    name={r.icon || "wrench"}
                    size={15}
                    className={i === active ? "text-accent-600" : "text-ink-400"}
                  />
                  <span className="whitespace-nowrap">{r.title}</span>
                </button>
              ))}
            </div>

            <Reveal className="mt-5">{showcase}</Reveal>
          </div>

          {/* Desktop: vertical selector + large showcase */}
          <div className="hidden gap-8 lg:grid lg:grid-cols-12 lg:gap-10">
            <div
              role="tablist"
              aria-label="Repair services"
              aria-orientation="vertical"
              className="flex flex-col gap-1.5 lg:col-span-5"
            >
              {items.map((r, i) => (
                <SelectorRow
                  key={r.id}
                  repair={r}
                  index={i}
                  isActive={i === active}
                  onSelect={select}
                  btnRef={(el) => (desktopBtns.current[i] = el)}
                  onKeyDown={makeKeyDown(desktopBtns, "vertical")}
                />
              ))}
            </div>

            <div className="lg:col-span-7">{showcase}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
