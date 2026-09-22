import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import { offerBanners } from "../../data/offers.js";
import { waLink } from "../../utils/whatsapp.js";

/**
 * Offers — the approved promotional artwork as the visual focus.
 *
 * Each card is a SQUARE container holding the complete landscape artwork via
 * object-fit: contain on a clean neutral background — the full artwork stays
 * visible (never cropped or stretched) and the image dominates the section. No
 * per-card title/description is duplicated. Four banners or fewer sit in one
 * linear row; more than four would activate the shared CardCarousel. The whole
 * card opens a WhatsApp enquiry so terms are confirmed with the store.
 */
function OfferCard(offer) {
  return (
    <a
      href={waLink(offer.ctaMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${offer.alt} — enquire on WhatsApp`}
      className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-line bg-white p-1.5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
    >
      <img
        src={offer.src}
        width={offer.width}
        height={offer.height}
        alt={offer.alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full object-contain"
      />
    </a>
  );
}

export default function OffersSection() {
  return (
    <section
      className="bg-paper-soft"
      id="offers"
      aria-labelledby="offers-heading"
      style={{ scrollMarginTop: "5.5rem" }}
    >
      <div className="shell py-12 lg:py-16">
        <SectionHeading
          eyebrow="Offers"
          id="offers-heading"
          title="Deals for you"
          lead="Tap an offer to ask us on WhatsApp what's available today."
        />

        <Reveal className="mt-6">
          <CardCarousel
            items={offerBanners}
            ariaLabel="offer"
            gapClass="gap-5"
            cardBasis="basis-[78%] sm:basis-[calc(50%-0.625rem)] lg:basis-[calc(25%-0.9375rem)]"
            renderItem={(offer) => <OfferCard key={offer.id} {...offer} />}
          />
        </Reveal>
      </div>
    </section>
  );
}
