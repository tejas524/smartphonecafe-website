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
        sizes="100vw"
        width={HERO_PHOTO.width}
        height={HERO_PHOTO.height}
        alt={HERO_PHOTO.alt}
        fetchpriority="high"
        decoding="sync"
        className="hero-img absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Legibility gradient — heavier on the left where the copy sits */}
      <div
        aria-hidden="true"
        className="hero-overlay absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgb(6 8 12 / 0.95) 0%, rgb(6 8 12 / 0.82) 44%, rgb(6 8 12 / 0.58) 72%, rgb(6 8 12 / 0.40) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="hero-overlay absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgb(6 8 12 / 0.45) 0%, rgb(6 8 12 / 0.10) 30%, rgb(6 8 12 / 0.14) 64%, rgb(6 8 12 / 0.62) 100%)",
        }}
      />

      <div className="shell flex min-h-[26rem] flex-col justify-center py-14 sm:min-h-[36rem] lg:min-h-[42rem] lg:py-28">
        <div className="max-w-2xl">
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
            className="hero-rise mt-5 max-w-[18ch] text-[2.125rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.75rem] lg:text-[3.5rem]"
            style={{ animationDelay: "240ms" }}
          >
            {hero.heading || "Your trusted mobile destination in Talegaon Dabhade"}
          </h1>

          <p
            className="hero-rise mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/78 sm:text-[1.125rem]"
            style={{ animationDelay: "360ms" }}
          >
            {hero.body ||
              hero.subheading ||
              "The latest smartphones, reliable accessories and quick repairs — all under one roof on Talegaon Station Road."}
          </p>

          <div
            className="hero-rise mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ animationDelay: "480ms" }}
          >
            <Button
              to={hero.cta_url || "/smartphones"}
              variant="accent"
              size="lg"
              icon="smartphone"
              className="w-full sm:w-auto"
            >
              {hero.cta_label || "Explore Smartphones"}
            </Button>
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
          </div>

          {/* Trust / location row */}
          <div
            className="hero-rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.8125rem] text-white/70 lg:mt-10"
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
              {isOpen === false ? "Currently closed" : "Open now"} · {business.hours.label}
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
      </div>
    </section>
  );
}
