import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { photos } from "../../data/photos.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";
import { getStoreStatus } from "../../utils/hours.js";

/**
 * Homepage hero — large, image-led, full-width.
 *
 * A real photograph of the store fills the frame edge-to-edge under a dark,
 * legibility-tuned gradient. On top sit a high-contrast headline, a short
 * supporting line (both editable from the CMS `hero` row), two CTAs, a live
 * open/closed indicator and a Google-rating trust chip. The load animation is
 * a SEPARATE system from the scroll reveals (see index.css .hero-*): it runs
 * once on first paint and honours prefers-reduced-motion.
 */
const HERO_PHOTO = photos.interior;

export default function Hero() {
  const { business, home, reviewsSummary } = useSiteData();
  const hero = home.hero || {};
  const [status, setStatus] = useState({ known: false });

  useEffect(() => {
    const update = () => setStatus(getStoreStatus());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const isOpen = status.known ? status.isOpen : null;

  return (
    <section
      className="relative isolate overflow-hidden bg-ink-950"
      aria-labelledby="hero-heading"
    >
      {/* Background photograph */}
      <img
        src={HERO_PHOTO.src}
        srcSet={HERO_PHOTO.srcset}
        sizes="(min-width: 1024px) 55vw, 100vw"
        width={HERO_PHOTO.width}
        height={HERO_PHOTO.height}
        alt={HERO_PHOTO.alt}
        fetchpriority="high"
        decoding="sync"
        className="hero-img absolute inset-0 -z-10 h-full w-full object-cover lg:left-auto lg:w-[55%] lg:object-[60%_center]"
      />

      {/* Legibility gradient — heavier on the left where the copy sits */}
      <div
        aria-hidden="true"
        className="hero-overlay hero-shade absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="hero-overlay absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgb(6 8 12 / 0.45) 0%, rgb(6 8 12 / 0.10) 30%, rgb(6 8 12 / 0.14) 64%, rgb(6 8 12 / 0.62) 100%)",
        }}
      />

      <div className="shell relative flex flex-col justify-center py-9 sm:min-h-[34rem] sm:py-14 lg:min-h-[38rem] lg:py-20">
        <div className="max-w-2xl lg:max-w-[54%] lg:pr-12">
          {/* Rating chip */}
          {reviewsSummary?.rating ? (
            <a
              href={reviewsSummary.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              style={{ animationDelay: "120ms" }}
            >
              <span aria-hidden="true" style={{ color: "#fbbc04" }}>
                ★★★★★
              </span>
              <span className="tabular-nums">{reviewsSummary.rating.toFixed(1)}</span>
              <span className="text-white/70">
                · {reviewsSummary.reviewCount} Google reviews
              </span>
            </a>
          ) : (
            <p
              className="hero-rise eyebrow text-accent-300"
              style={{ animationDelay: "120ms" }}
            >
              {hero.eyebrow || "Smartphones · Repairs · Accessories"}
            </p>
          )}

          <h1
            id="hero-heading"
            className="hero-rise mt-5 max-w-[19ch] text-[clamp(1.875rem,7.8vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.75rem] lg:text-[clamp(2.75rem,3.7vw,3.5rem)]"
            style={{ animationDelay: "240ms" }}
          >
            {hero.heading || "Your trusted mobile destination in Talegaon Dabhade"}
          </h1>

          <p
            className="hero-rise mt-4 max-w-[48ch] text-[0.9375rem] leading-[1.65] text-white/80 sm:mt-5 sm:text-[1.0625rem]"
            style={{ animationDelay: "360ms" }}
          >
            {hero.body ||
              hero.subheading ||
              "The latest smartphones, reliable accessories and quick repairs — all under one roof on Talegaon Station Road."}
          </p>

          <div
            className="hero-rise mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ animationDelay: "480ms" }}
          >
            <Button
              href={waLink(waMessages.general())}
              external
              variant="wa"
              size="lg"
              icon="whatsapp"
              className="w-full sm:w-auto"
            >
              WhatsApp Us
            </Button>
            <Button
              to={hero.cta_url || "/smartphones"}
              variant="onDark"
              size="lg"
              icon="smartphone"
              className="w-full sm:w-auto"
            >
              {hero.cta_label || "Explore Smartphones"}
            </Button>
          </div>

          {/* Trust / location row */}
          <div
            className="hero-rise mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/15 pt-5 text-[0.75rem] text-white/80 sm:mt-8 sm:text-[0.8125rem]"
            style={{ animationDelay: "600ms" }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isOpen === false ? "bg-white/40" : "bg-wa-500"
                }`}
                style={
                  isOpen !== false
                    ? { boxShadow: "0 0 0 4px rgb(37 211 102 / 0.22)" }
                    : undefined
                }
              />
              {status.known ? (isOpen ? "Open now" : "Currently closed") : "Open daily"} · {business.hours.label}
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="mapPin" size={15} className="text-white/50" />
              Talegaon Station Road
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="wrench" size={15} className="text-white/50" />
              Repairs checked at the counter
            </span>
          </div>
        </div>
        <a href={business.google.shortUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-8 right-10 hidden max-w-[22rem] items-center gap-4 rounded-2xl border border-white/20 bg-ink-950/85 p-5 text-white backdrop-blur-md transition-colors hover:bg-ink-950 lg:flex">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon name="mapPin" size={21} /></span>
          <span><span className="block text-[0.9375rem] font-semibold">Come by the store</span><span className="mt-1 block text-[0.8125rem] leading-relaxed text-white/80">Talegaon Station Road · Get directions</span></span>
          <Icon name="arrowUpRight" size={18} className="shrink-0" />
        </a>
      </div>
    </section>
  );
}
