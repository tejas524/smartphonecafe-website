import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import { business } from "../../data/site.js";
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
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Gradient overlay for text contrast (kept out of the a11y tree) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgb(6 7 10 / 0.92) 50%, rgb(6 7 10 / 0.78) 58%, rgb(6 7 10 / 0.45) 70%, rgb(6 7 10 / 0.25) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(0deg, rgb(6 7 10 / 0.65) 0%, rgb(6 7 10 / 0) 45%)",
        }}
      />

      <div className="shell flex min-h-[34rem] flex-col justify-center py-16 sm:min-h-[38rem] lg:min-h-[42rem] lg:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-accent-300">
            Smartphones · Repairs · Accessories
          </p>

          <h1
            id="hero-heading"
            className="mt-5 max-w-[18ch] text-[2.25rem] font-extrabold leading-[1.03] tracking-[-0.035em] text-white sm:text-[3rem] lg:text-[3.75rem]"
          >
            Your trusted mobile destination in Talegaon&nbsp;Dabhade
          </h1>

          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/80 sm:text-[1.1875rem]">
            The latest smartphones, reliable accessories and quick repairs — all
            under one roof on Talegaon Station Road.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button to="/smartphones" variant="primary" size="lg" icon="smartphone">
              Explore Smartphones
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
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.8125rem] text-white/70">
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
