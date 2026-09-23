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
 * A real photograph of the store fills the frame edge-to-edge, under a dark
 * gradient tuned for legibility. On top: a high-contrast headline, a short
 * supporting line, a primary + secondary CTA, and a live "open now / hours"
 * trust row. The headline follows the reference's direction while the
 * supporting copy reuses the shop's own Google-listing wording, so nothing is
 * invented.
 *
 * Photo: `store photo from inside.jpg` (source 4000x2250) — the sharpest frame
 * supplied and the one whose in-store display signage is legible.
 */

const HERO_PHOTO = photos.interior;

export default function Hero() {
  const { business, home } = useSiteData();
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

      {/* Gradient overlay for readability (kept out of the a11y tree). A strong,
          sophisticated dark wash — heavier on the left where the copy sits, but
          the photograph stays visible on the right (never fully black). */}
      <div
        aria-hidden="true"
        className="hero-overlay absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgb(6 8 12 / 0.95) 0%, rgb(6 8 12 / 0.82) 44%, rgb(6 8 12 / 0.58) 72%, rgb(6 8 12 / 0.40) 100%)",
        }}
      />
      {/* Top + bottom vignette for depth and a clean edge into the white section below */}
      <div
        aria-hidden="true"
        className="hero-overlay absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgb(6 8 12 / 0.45) 0%, rgb(6 8 12 / 0.10) 30%, rgb(6 8 12 / 0.14) 64%, rgb(6 8 12 / 0.58) 100%)",
        }}
      />

      <div className="shell flex min-h-[30rem] flex-col justify-center py-16 sm:min-h-[34rem] lg:min-h-[38rem] lg:py-24">
        <div className="max-w-xl">
          <p className="hero-rise eyebrow text-accent-300" style={{ animationDelay: "180ms" }}>
            {hero.eyebrow || "Smartphones · Repairs · Accessories"}
          </p>

          <h1
            id="hero-heading"
            className="hero-rise mt-5 max-w-[16ch] text-[2rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-white sm:text-[2.5rem] lg:text-[3rem]"
            style={{ animationDelay: "280ms" }}
          >
            {hero.heading || "Your trusted mobile destination in Talegaon Dabhade"}
          </h1>

          <p
            className="hero-rise mt-5 max-w-lg text-[1rem] leading-relaxed text-white/75 sm:text-[1.0625rem]"
            style={{ animationDelay: "400ms" }}
          >
            {hero.body ||
              hero.subheading ||
              "The latest smartphones, reliable accessories and quick repairs — all under one roof on Talegaon Station Road."}
          </p>

          <div
            className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ animationDelay: "520ms" }}
          >
            <Button
              to={hero.cta_url || "/smartphones"}
              variant="primary"
              size="lg"
              icon="smartphone"
            >
              {hero.cta_label || "Explore Smartphones"}
            </Button>
            <Button
              href={waLink(waMessages.general())}
              external
              variant="wa"
              size="lg"
              icon="whatsapp"
            >
              WhatsApp Us
            </Button>
          </div>

          {/* Trust / location row */}
          <div
            className="hero-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.8125rem] text-white/70"
            style={{ animationDelay: "640ms" }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isOpen === false ? "bg-white/40" : "bg-wa-500"
                }`}
                style={isOpen !== false ? { boxShadow: "0 0 0 4px rgb(37 211 102 / 0.22)" } : undefined}
              />
              {isOpen === false ? "Currently closed" : "Open now"} · {business.hours.label}
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="mapPin" size={15} className="text-white/50" />
              Talegaon Station Road
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="clock" size={15} className="text-white/50" />
              Open all 7 days
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
