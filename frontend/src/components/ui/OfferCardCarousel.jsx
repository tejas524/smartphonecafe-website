import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Icon from "../Icon.jsx";
import Reveal from "./Reveal.jsx";
import ResponsiveImage from "./ResponsiveImage.jsx";

/**
 * OfferCardCarousel — the Offers section's image-only banner rail.
 *
 * Built directly on `embla-carousel-react` (the same engine shadcn's Carousel
 * wraps). This project is plain JSX with its own Tailwind-v4 UI kit — no shadcn,
 * no `cn`, no TypeScript — so the component is authored on Embla itself rather
 * than as a ported shadcn `.tsx` primitive. No carousel dependency was added.
 *
 * DATA: the existing MySQL → /bootstrap → useSiteData().offers array, already
 * filtered to `is_active = 1` and ordered by `display_order` server-side. There
 * is no second offers source, no hardcoded record and no invented price,
 * discount or copy. `alt` comes from the row's own subtitle/title.
 *
 * ARTWORK: the owner's banners are authored as wide 8:3 artwork (2048×768), NOT
 * 16:9. The card frame therefore derives its ratio from the image itself
 * (`aspect-ratio: auto 8 / 3` — 8:3 is used only to reserve space before the
 * file loads, then the real intrinsic ratio takes over). The banner is never
 * cropped, stretched or object-cover'd, and there is no letterboxing, so the
 * whole artwork stays visible at its true proportions whatever ratio the CMS
 * supplies. `max-h` + `object-contain` are a distortion-proof backstop for an
 * unusually tall upload.
 *
 * CARDS: image only — no title, category, discount repeat, icon, overlay CTA,
 * description or metadata, and the banner is not a link. Its own artwork already
 * carries the offer copy. The single call to action (WhatsApp) sits outside.
 *
 * BEHAVIOUR: a draggable rail. The active banner is centered with the next and
 * previous ones peeking at the edges (align: "center"). Three or more offers
 * loop so the centered banner always has a neighbour on both sides; two offers
 * do not loop, so the same banner can never appear twice on screen. No autoplay,
 * no Coverflow, no 3D rotation, no scaling, no parallax.
 *
 * EDGE CASES: 0 offers → the section hides itself upstream in OffersSection;
 * 1 offer → one centered card, no rail and no controls; 2 offers → a normal
 * draggable rail; controls render only when Embla reports more than one snap,
 * so they never appear when there is nothing to scroll.
 *
 * @typedef {Object} OfferCarouselItem
 * @property {string|number} id
 * @property {string|null} image  Root-relative artwork URL (8:3 banner).
 * @property {string} [alt]       Description taken from the offer row.
 * @property {string} [title]     Used only when the row has no artwork.
 */

/** The owner's banners are 8:3 (2048×768); this only reserves space pre-load. */
const ARTWORK_ASPECT = "auto 8 / 3";

/**
 * Mirrors the reduced-motion hook used elsewhere in the app (e.g.
 * RepairsCarousel): under reduced motion Embla's scroll duration is zeroed so
 * drags and arrow taps snap instantly. The entrance animation is handled by
 * <Reveal>, which honours the same query.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * The image-only card. The artwork IS the card: a white, softly shadowed,
 * rounded frame whose height follows the image, so nothing is cropped or
 * squashed. When a row has no artwork yet, its title is shown in the same frame
 * so the layout never collapses.
 */
function OfferCard({ item }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)] ring-1 ring-ink-950/[0.06]">
      {item.image ? (
        <ResponsiveImage
          src={item.image}
          sizes="(min-width: 1024px) 70vw, 90vw"
          alt={item.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ aspectRatio: ARTWORK_ASPECT }}
          className="block max-h-[32rem] w-full select-none bg-white object-contain"
        />
      ) : (
        <div
          style={{ aspectRatio: ARTWORK_ASPECT }}
          className="flex w-full items-center justify-center px-6 text-center"
        >
          <span className="font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink-800 sm:text-[1.25rem]">
            {item.title}
          </span>
        </div>
      )}
    </div>
  );
}

export default function OfferCardCarousel({ offers = [], ariaLabel = "Store offers" }) {
  const reduce = usePrefersReducedMotion();

  // Rebuilt only when the offers array itself changes, so Embla is never handed
  // a fresh array on an unrelated re-render.
  const items = useMemo(
    () =>
      offers.map((o) => ({
        id: o.id,
        image: o.src || null,
        alt: o.alt || o.title || "Current offer",
        title: o.title || "",
      })),
    [offers],
  );
  const count = items.length;

  // Looping needs enough slides to cover the rail. With two, looping would show
  // the same banner on both edges at once, so only 3+ loop.
  const canLoop = count >= 3;

  // Embla options MUST be referentially stable: embla-carousel-react calls
  // reInit() (which resets scroll position) whenever the object identity
  // changes, so an inline literal would snap the rail back on every state
  // update. Memoize on the two values that actually matter.
  const options = useMemo(
    () => ({
      align: "center",
      loop: canLoop,
      // Loop mode ignores containScroll; without it, trimming keeps the rail
      // from resting on empty space at either end.
      containScroll: canLoop ? false : "trimSnaps",
      slidesToScroll: 1,
      duration: reduce ? 0 : 24,
    }),
    [canLoop, reduce],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [snaps, setSnaps] = useState([]);
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // One handler for everything Embla reports back: snap positions (how many
  // dots to draw) and whether either arrow can move.
  const sync = useCallback((api) => {
    if (!api) return;
    setSnaps(api.scrollSnapList());
    setSelected(api.selectedScrollSnap());
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return undefined;
    sync(emblaApi);
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi, sync]);

  // Arrow keys move the rail for keyboard users; the dots and arrows are real
  // buttons, so they are reachable by Tab as well.
  const onKeyDown = useCallback(
    (e) => {
      if (!emblaApi || count < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        emblaApi.scrollTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        emblaApi.scrollTo(count - 1);
      }
    },
    [emblaApi, count],
  );

  if (!count) return null;

  // 1 offer → a single centered card. No rail, no drag, no controls.
  if (count === 1) {
    return (
      <Reveal className="w-full">
        <div className="mx-auto w-full max-w-4xl">
          <OfferCard item={items[0]} />
        </div>
      </Reveal>
    );
  }

  // Nothing to scroll (e.g. every banner already fits) → no controls at all.
  const showControls = snaps.length > 1;

  return (
    <Reveal className="w-full">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
      >
        {/* On phones the viewport breaks out of the shell's 1.25rem gutter so a
            ~88vw banner can still show its neighbour peeking; from `sm` up the
            rail sits back inside the content column. The negative margin is
            exactly the shell padding, so it can never cause page overflow.
            A left/right mask fades the peeking neighbours into the background
            instead of a hard `overflow-hidden` cut, so the centered main offer
            reads as the focus. `--fade` (the fade width per edge) stays narrow
            on phones — where only a sliver peeks — and widens from `sm` up. */}
        <div
          ref={emblaRef}
          className="-mx-5 overflow-hidden [--fade:10%] sm:mx-0 sm:[--fade:20%]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 var(--fade), #000 calc(100% - var(--fade)), transparent)",
            maskImage:
              "linear-gradient(to right, transparent, #000 var(--fade), #000 calc(100% - var(--fade)), transparent)",
          }}
        >
          <div className="flex items-start">
            {items.map((item, i) => (
              <div
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                // Symmetric inline padding = the card gutter, so a centered
                // slide is optically centered too (unlike shadcn's -ml/pl trick,
                // which offsets the centered card by half a gutter). 91% of the
                // full-bleed phone rail lands the banner at ~88vw with the
                // neighbours still peeking past both edges.
                className="min-w-0 shrink-0 grow-0 basis-[91%] px-1.5 sm:basis-[64%] sm:px-2.5"
              >
                <OfferCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls — centered under the rail: ← • • • → on wider screens, dots
            alone on phones (swipe is the primary interaction there). */}
        {showControls && (
          <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6 sm:gap-5">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Previous offer"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-700 shadow-[var(--shadow-card)] transition-colors duration-200 hover:border-line-strong hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-700 sm:inline-flex"
            >
              <Icon name="chevronLeft" size={20} />
            </button>

            <div className="flex items-center">
              {snaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to offer ${i + 1} of ${snaps.length}`}
                  aria-current={i === selected}
                  className="group flex h-8 items-center px-1.5"
                >
                  <span
                    className={`block h-2 rounded-full transition-[width,background-color] duration-300 ease-out ${
                      i === selected
                        ? "w-6 bg-accent-600"
                        : "w-2 bg-line-strong group-hover:bg-ink-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Next offer"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-700 shadow-[var(--shadow-card)] transition-colors duration-200 hover:border-line-strong hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-700 sm:inline-flex"
            >
              <Icon name="chevronRight" size={20} />
            </button>
          </div>
        )}
      </div>
    </Reveal>
  );
}
