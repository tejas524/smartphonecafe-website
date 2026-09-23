import PageHero from "../components/sections/PageHero.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Offers page — the approved promotional artwork shown at full size.
 *
 * Every offer is CMS-driven (the `offers` table). The artwork is shown whole
 * (object-contain, never cropped); tapping a card opens the offer's WhatsApp
 * CTA so the customer confirms the current terms with the store. No discount
 * figure, price or expiry is invented anywhere.
 */
function OfferCard({ offer, index }) {
  const href = offer.href || waLink(waMessages.offers());
  return (
    <Reveal delay={Math.min(index, 4) * 70} className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${offer.title} — enquire on WhatsApp`}
          className="flex aspect-square items-center justify-center overflow-hidden bg-paper-mute p-2"
        >
          {offer.src ? (
            <img
              src={offer.src}
              alt={offer.alt || offer.title}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-contain"
            />
          ) : (
            <span className="px-6 text-center font-display text-[1.25rem] font-bold tracking-[-0.02em] text-ink-900">
              {offer.title}
            </span>
          )}
        </a>

        <div className="flex flex-1 flex-col p-6">
          <h2 className="font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink-950">
            {offer.title}
          </h2>
          {offer.subtitle ? (
            <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-600">
              {offer.subtitle}
            </p>
          ) : (
            <div className="flex-1" />
          )}
          <div className="mt-5">
            <Button href={href} external variant="wa" size="md" icon="whatsapp">
              {offer.ctaLabel || "Ask on WhatsApp"}
            </Button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function OffersEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-paper-soft px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-accent-600 shadow-[var(--shadow-card)]">
        <Icon name="tag" size={22} />
      </span>
      <h2 className="mt-5 font-display text-[1.25rem] font-bold tracking-[-0.02em] text-ink-950">
        Ask about current deals
      </h2>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        The store runs deals on phones, accessories and exchange from time to
        time. Message us and we'll tell you what's running right now.
      </p>
      <div className="mt-6">
        <Button
          href={waLink(waMessages.offers())}
          external
          variant="wa"
          size="lg"
          icon="whatsapp"
        >
          Ask on WhatsApp
        </Button>
      </div>
    </div>
  );
}

export default function Offers() {
  const { offers } = useSiteData();

  usePageMeta({
    title: "Offers",
    description:
      "Current offers at SmartphoneCafe, Talegaon Dabhade — deals on accessories, featured smartphones, cover + tempered glass combos and phone exchange. Message us on WhatsApp to confirm the latest terms.",
    path: "/offers",
  });

  return (
    <>
      <PageHero
        eyebrow="Offers"
        title="Deals worth a message before you visit."
        lead="These are the offers the store runs from time to time. Terms change, so tap any offer to confirm what's available today on WhatsApp — we never publish a figure we can't keep accurate."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button
            href={waLink(waMessages.offers())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            Ask about offers
          </Button>
        </div>
      </PageHero>

      <section className="bg-white" aria-labelledby="offers-list-heading">
        <div className="shell py-14 lg:py-20">
          <h2 id="offers-list-heading" className="sr-only">
            Current offers
          </h2>
          {offers.length ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((offer, i) => (
                <li key={offer.id} className="flex">
                  <OfferCard offer={offer} index={i} />
                </li>
              ))}
            </ul>
          ) : (
            <OffersEmptyState />
          )}

          <p className="mt-8 max-w-3xl text-[0.8125rem] leading-relaxed text-ink-400">
            Offer artwork is supplied by the store. Availability, eligibility and
            final value are confirmed in store or on WhatsApp — nothing here is a
            guaranteed price or a running online promotion.
          </p>
        </div>
      </section>

      <LocationSection />

      <CtaBand
        eyebrow="Something catch your eye?"
        title="Message us and we'll confirm the current terms."
        body="Tell us which offer you're interested in and we'll tell you what's available today, and what it involves."
        message={waMessages.offers()}
      />
    </>
  );
}
