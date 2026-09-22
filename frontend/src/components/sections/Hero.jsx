import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Reveal from "../ui/Reveal.jsx";
import Photo from "../ui/Photo.jsx";
import { business } from "../../data/site.js";
import { photos } from "../../data/photos.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";
import { getStoreStatus } from "../../utils/hours.js";

/**
 * Homepage hero — editorial split layout.
 *
 * Left:  clean type on plain paper. One headline, one short paragraph, two
 *        actions, one line of location/hours.
 * Right: a real photograph of the store, shown at full strength with NO dark
 *        scrim and no UI laid over it. The photography is the authenticity;
 *        covering it with a glass card would only hide the one asset that
 *        proves this is a real shop on a real street.
 *
 * The photograph is `store photo from inside.jpg` (source 4000x2250) — the
 * sharpest and most detailed frame in the supplied set, and the one whose
 * in-store display signage is legible enough to confirm it shows genuine
 * retail displays rather than a staged interior.
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
    <section className="bg-white" aria-labelledby="hero-heading">
      <div className="shell pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* ------------------------------------------------------- copy */}
          <div className="min-w-0">
            <Reveal
              as="p"
              className="eyebrow text-ink-400"
            >
              Smartphones · Repairs · Accessories
            </Reveal>

            <Reveal
              as="h1"
              id="hero-heading"
              delay={70}
              className="mt-5 max-w-[21ch] text-[2.125rem] leading-[1.06] tracking-[-0.03em] sm:text-[2.625rem] lg:text-[2.5rem] xl:text-[3.25rem]"
            >
              Your next phone. Your local repair shop.
            </Reveal>

            <Reveal
              as="p"
              delay={130}
              className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-ink-600"
            >
              {business.name} sits on Talegaon Station Road. Come in to compare
              handsets, pick up the essentials, or have a fault looked at the
              counter.
            </Reveal>

            <Reveal delay={190} className="mt-9 flex flex-wrap items-center gap-3">
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
            </Reveal>

            {/* Location + hours: small, single line, no card. */}
            <Reveal
              delay={250}
              className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[0.8125rem] text-ink-500"
            >
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isOpen === false ? "bg-ink-300" : "bg-wa-500"
                  }`}
                />
                Talegaon Dabhade
              </span>
              <span aria-hidden="true" className="text-ink-300">
                ·
              </span>
              <span>Open 10 AM – 9:30 PM</span>
              <span aria-hidden="true" className="text-ink-300">
                ·
              </span>
              <span>All 7 days</span>
            </Reveal>
          </div>

          {/* -------------------------------------------------- photograph */}
          <Reveal delay={120} className="min-w-0">
            <figure className="m-0">
              <Photo
                photo={HERO_PHOTO}
                priority
                aspect="3 / 2"
                sizes="(min-width: 1024px) 48vw, 100vw"
                rounded="rounded-[var(--radius-xl)]"
                className="bg-paper-mute"
              />
              <figcaption className="mt-3 text-[0.75rem] text-ink-400">
                {HERO_PHOTO.caption} — {business.address.short}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}