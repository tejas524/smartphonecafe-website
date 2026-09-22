import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { offerBanners } from "../../data/offers.js";
import { waLink } from "../../utils/whatsapp.js";

/**
 * Offers — owner-supplied promotional banners in a responsive carousel.
 *
 * One image = one offer (per the brief): banners are shown whole, never
 * cropped, stretched or redesigned. The artwork carries its own calls to
 * action; tapping a banner opens a WhatsApp enquiry so the customer confirms
 * the current terms with the store. Nothing is overlaid and no figure is
 * asserted in code.
 *
 * Layout: mobile/tablet show one slide; from lg the active slide is centred
 * with a partial peek of the adjacent slides. Controls: previous/next, dots,
 * and a slow auto-advance that pauses on hover/focus and respects
 * prefers-reduced-motion.
 */
export default function OffersSection() {
  const slides = offerBanners;
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const viewportRef = useRef(null);
  const touchX = useRef(null);

  // Track the lg breakpoint so the transform can centre the active slide with
  // a peek on desktop while staying full-width on mobile/tablet.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback(
    (next) => setIndex(((next % count) + count) % count),
    [count]
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Slow auto-advance, paused on hover/focus and when reduced motion is set.
  useEffect(() => {
    if (paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(id);
  }, [paused, count]);

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  return (
    <section className="bg-paper-soft" id="offers" aria-labelledby="offers-heading" style={{ scrollMarginTop: "5.5rem" }}>
      <div className="shell py-14 lg:py-20">
        <SectionHeading
          eyebrow="Special deals"
          id="offers-heading"
          title="Current offers"
          lead="Promotions running at the store. Deals and pricing are confirmed in store — tap an offer to ask us on WhatsApp what is available right now."
        />

        <Reveal className="mt-9">
          <div
            className="group/car relative mx-auto max-w-4xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label="Current offers"
          >
            {/* Viewport */}
            <div
              ref={viewportRef}
              className="overflow-hidden rounded-[var(--radius-lg)]"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/*
                Track. On lg the active slide is centred with a peek of the
                neighbours: each slide is 82% wide and the track is shifted by
                index*82% then nudged back 9% so the active slide sits centred.
              */}
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: isDesktop
                    ? `translateX(calc(-1 * ${index} * 82% + 9%))`
                    : `translateX(calc(-1 * ${index} * 100%))`,
                }}
              >
                {slides.map((offer, i) => (
                  <div
                    key={offer.id}
                    className="w-full shrink-0 px-0 lg:w-[82%] lg:px-2.5"
                    aria-hidden={i !== index}
                  >
                    <a
                      href={waLink(offer.ctaMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={i === index ? 0 : -1}
                      aria-label={`${offer.alt} — enquire on WhatsApp`}
                      className={`group/offer relative block overflow-hidden rounded-[var(--radius-md)] border border-line bg-white shadow-[var(--shadow-card)] transition-[opacity,transform] duration-500 ${
                        i === index ? "lg:opacity-100" : "lg:opacity-55"
                      }`}
                    >
                      <img
                        src={offer.src}
                        width={offer.width}
                        height={offer.height}
                        alt={offer.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="block h-auto w-full"
                        style={{ aspectRatio: `${offer.width} / ${offer.height}` }}
                      />
                      <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/85 px-3 py-1.5 text-[0.75rem] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/offer:opacity-100">
                        <Icon name="whatsapp" size={13} className="text-wa-500" />
                        Enquire
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / next controls */}
            <button
              type="button"
              onClick={prev}
              aria-label="Previous offer"
              className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink-800 shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-white hover:text-ink-950 lg:left-3"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next offer"
              className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink-800 shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-white hover:text-ink-950 lg:right-3"
            >
              <Icon name="chevronRight" size={20} />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {slides.map((offer, i) => (
              <button
                key={offer.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to offer ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-accent-600"
                    : "w-2 bg-line-strong hover:bg-ink-300"
                }`}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-6 flex items-start justify-center gap-2 text-center text-[0.8125rem] leading-relaxed text-ink-400">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-ink-300" />
            <span>
              Offer artwork is provided by the store. Discounts, prices and
              eligibility are confirmed in store and may change — please check
              current terms with us before visiting.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
