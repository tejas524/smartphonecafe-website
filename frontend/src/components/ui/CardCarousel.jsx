import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../Icon.jsx";
import Reveal from "./Reveal.jsx";

/**
 * CardCarousel — a shared skeleton for the Offers and Smartphones rows.
 *
 * Behaviour (driven purely by whether the content overflows its track):
 *   - Desktop shows up to four cards. If there are four or fewer, they fill the
 *     row and there is nothing to scroll, so NO controls appear.
 *   - With more than four, the row overflows and horizontal scroll-snap plus
 *     previous/next controls and progress dots become active.
 *   - Mobile/tablet always show one to two cards with the same swipe/scroll.
 *
 * It is a native scroll-snap carousel (no transform maths), so it is robust
 * across breakpoints, keyboard- and touch-friendly, and never causes page
 * overflow because the track itself is the only horizontally-scrolling element.
 *
 * `items` is the data array; `renderItem(item, index)` returns the card.
 */
export default function CardCarousel({
  items,
  renderItem,
  ariaLabel,
  cardBasis = "basis-[86%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]",
  gapClass = "gap-4",
}) {
  const trackRef = useRef(null);
  const [scrollable, setScrollable] = useState(false);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth > 8;
    setScrollable(overflow);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const groups = Math.max(1, Math.ceil(el.scrollWidth / Math.max(1, el.clientWidth)));
    setPages(groups);
    setPage(maxScroll > 0 ? Math.round(el.scrollLeft / maxScroll * (groups - 1)) : 0);
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const groups = Math.max(1, Math.ceil(el.scrollWidth / Math.max(1, el.clientWidth)));
      setPage(maxScroll > 0 ? Math.round(el.scrollLeft / maxScroll * (groups - 1)) : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [measure, items.length]);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const goToPage = (p) => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: p / Math.max(1, pages - 1) * maxScroll, behavior: "smooth" });
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className="relative"
    >
      {/* Track */}
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={`${ariaLabel} cards`}
        className={`no-scrollbar -mx-1 flex snap-x snap-mandatory ${gapClass} overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-1`}
      >
        {items.map((item, i) => (
          <li
            key={item.id ?? i}
            className={`flex shrink-0 snap-start ${cardBasis}`}
          >
            <Reveal delay={Math.min(i, 4) * 80} className="flex h-full w-full">
              {renderItem(item, i)}
            </Reveal>
          </li>
        ))}
      </ul>

      {/* Controls — only when the row actually overflows */}
      {scrollable && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center">
            {Array.from({ length: pages }).map((_, p) => (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-label={`Go to slide group ${p + 1}`}
                aria-current={p === page}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full"
              ><span aria-hidden="true" className={`h-2 rounded-full transition-[width,background-color] duration-300 ${p === page ? "w-6 bg-accent-600" : "w-2 bg-ink-300"}`} /></button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              aria-label={`Previous ${ariaLabel}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-700 transition-colors hover:border-line-strong hover:text-ink-950"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              aria-label={`Next ${ariaLabel}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-700 transition-colors hover:border-line-strong hover:text-ink-950"
            >
              <Icon name="chevronRight" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
