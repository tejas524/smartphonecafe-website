import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Offers — the approved promotional artwork as the visual focus.
 *
 * Offers are CMS-driven (the `offers` table). Each card is a SQUARE container
 * holding the offer artwork via object-fit: contain on a clean neutral
 * background — the full artwork stays visible (never cropped or stretched) and
 * the image dominates the section. If an offer has no artwork yet, its title is
 * shown as a clean text fallback so the card is never broken. Four banners or
 * fewer sit in one linear row; more than four activate the shared CardCarousel.
 * Each card opens the offer's CTA (a WhatsApp enquiry) so terms are confirmed
 * with the store. Inactive offers are filtered out by the API.
 */
function OfferCard(offer) {
  const href = offer.href || waLink(waMessages.general());
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${offer.alt || offer.title} — enquire on WhatsApp`}
      className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-line bg-white p-1 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
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
        <span className="px-4 text-center font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink-900">
          {offer.title}
        </span>
      )}
    </a>
  );
}

export default function OffersSection() {
  const { offers } = useSiteData();
  if (!offers.length) return null;

  return (
    <section
      className="bg-paper-soft"
      id="offers"
      aria-labelledby="offers-heading"
      style={{ scrollMarginTop: "5.5rem" }}
    >
      <div className="shell py-10 lg:py-14">
        <SectionHeading
          eyebrow="Offers"
          id="offers-heading"
          title="Deals for you"
          size="sm"
        />
        <Reveal
          as="p"
          delay={120}
          className="mt-1.5 max-w-xl text-[0.875rem] leading-relaxed text-ink-500"
        >
          Tap an offer to ask us on WhatsApp what's available today.
        </Reveal>

        <Reveal className="mt-5">
          <CardCarousel
            items={offers}
            ariaLabel="offer"
            gapClass="gap-4"
            cardBasis="basis-[80%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]"
            renderItem={(offer) => <OfferCard key={offer.id} {...offer} />}
          />
        </Reveal>
      </div>
    </section>
  );
}
