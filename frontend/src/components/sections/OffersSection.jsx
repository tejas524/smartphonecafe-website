import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Offers — a single large promotional-banner carousel.
 *
 * One approved offer artwork is shown at a time, filling a wide container and
 * dominating the section. The artwork keeps its own aspect ratio (object-fit:
 * contain on a neutral field, never cropped or stretched). Tapping the current
 * slide opens that offer's WhatsApp CTA so terms are confirmed with the store.
 *
 * It is a native scroll-snap carousel (one slide per view): swipe on touch,
 * previous/next arrows and pagination dots on top. A slow, subtle autoplay
 * advances slides but pauses on hover/focus, stops for good once the operator
 * interacts, and is disabled entirely under prefers-reduced-motion.
 *
 * Data stays API-driven: MySQL -> API -> useSiteData() -> here. Nothing about
 * the four offers is hardcoded.
 */
const AUTOPLAY_MS = 6500;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function OffersSection() {
  const { offers, home } = useSiteData();
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const interacted = useRef(false);
  const [paused, setPaused] = useState(false);

  const count = offers.length;

  const scrollToIndex = useCallback((i, smooth = true) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({
      left: i * el.clientWidth,
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
    });
  }, []);

  // Track the active slide from the scroll position.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      setIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);

  const go = useCallback(
    (dir) => {
      interacted.current = true;
      const el = trackRef.current;
      if (!el) return;
      const next = Math.min(count - 1, Math.max(0, index + dir));
      scrollToIndex(next);
    },
    [count, index, scrollToIndex]
  );

  const jump = useCallback(
    (i) => {
      interacted.current = true;
      scrollToIndex(i);
    },
    [scrollToIndex]
  );

  // Subtle autoplay: wraps once per cycle, pauses on hover/focus, and halts for
  // good after any manual interaction; never runs under reduced motion.
  useEffect(() => {
    if (count <= 1 || paused || prefersReducedMotion()) return undefined;
    const id = setInterval(() => {
      if (interacted.current) return;
      const el = trackRef.current;
      if (!el) return;
      const cur = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      const next = cur >= count - 1 ? 0 : cur + 1;
      scrollToIndex(next);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused, scrollToIndex]);

  if (!count) return null;
  const content = home.offers || {};

  return (
    <section
      className="bg-paper-soft"
      id="offers"
      aria-labelledby="offers-heading"
      style={{ scrollMarginTop: "5.5rem" }}
    >
      <div className="shell py-12 lg:py-16">
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionHeading
              eyebrow={content.eyebrow || "Offers"}
              id="offers-heading"
              title={content.heading || "Deals for you"}
              size="sm"
            />
            <Reveal
              as="p"
              delay={120}
              className="mt-1.5 max-w-xl text-[0.875rem] leading-relaxed text-ink-500"
            >
              {content.subheading ||
                "Tap an offer to ask us on WhatsApp what's available today."}
            </Reveal>
          </div>

          <Reveal delay={120}>
            <Link
              to="/offers"
              className="group/link inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-accent-600 transition-colors hover:text-accent-700"
            >
              See all offers
              <Icon
                name="arrowRight"
                size={15}
                className="transition-transform duration-200 group-hover/link:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>

        {/* Carousel */}
        <Reveal delay={120} className="mt-6">
          <div
            className="relative mx-auto w-full max-w-5xl"
            role="region"
            aria-roledescription="carousel"
            aria-label="Store offers"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <ul
              ref={trackRef}
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)]"
            >
              {offers.map((offer, i) => {
                const href = offer.href || waLink(waMessages.offers());
                return (
                  <li
                    key={offer.id}
                    className="w-full shrink-0 snap-center"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${count}: ${offer.title}`}
                    aria-hidden={i !== index}
                  >
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${offer.title} — enquire on WhatsApp`}
                      tabIndex={i === index ? 0 : -1}
                      className="block w-full"
                    >
                      {offer.src ? (
                        <img
                          src={offer.src}
                          alt={offer.alt || offer.title}
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          /* Intrinsic ratio drives the height: full available
                             width, proportional height, never stretched, cropped
                             or letterboxed — so there is no empty space around it. */
                          className="block h-auto w-full"
                        />
                      ) : (
                        <span className="flex aspect-[8/3] w-full items-center justify-center bg-paper-mute px-6 text-center font-display text-[1.25rem] font-bold tracking-[-0.02em] text-ink-900">
                          {offer.title}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Arrows (only when more than one slide) */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={index === 0}
                  aria-label="Previous offer"
                  className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink-800 shadow-[var(--shadow-card)] backdrop-blur-sm transition-colors hover:border-line-strong hover:text-ink-950 disabled:pointer-events-none disabled:opacity-0 sm:inline-flex"
                >
                  <Icon name="chevronLeft" size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  disabled={index === count - 1}
                  aria-label="Next offer"
                  className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink-800 shadow-[var(--shadow-card)] backdrop-blur-sm transition-colors hover:border-line-strong hover:text-ink-950 disabled:pointer-events-none disabled:opacity-0 sm:inline-flex"
                >
                  <Icon name="chevronRight" size={22} />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {count > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {offers.map((offer, i) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`Go to offer ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-7 bg-accent-600"
                      : "w-2.5 bg-line-strong hover:bg-ink-300"
                  }`}
                />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
