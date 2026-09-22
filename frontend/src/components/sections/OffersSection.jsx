import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import { offers } from "../../data/offers.js";
import { waLink } from "../../utils/whatsapp.js";

/**
 * Offers — editorial, text-only cards (no artwork).
 *
 * Four offers or fewer sit in one linear row; more than four would activate the
 * shared CardCarousel automatically. No discount, price or expiry is stated —
 * each card routes to a WhatsApp enquiry so the current terms are confirmed
 * with the store.
 */
function OfferCard(offer) {
  return (
    <a
      href={waLink(offer.ctaMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className="group/offer flex h-full w-full flex-col justify-between rounded-[var(--radius-md)] border border-line bg-white p-6 transition-colors duration-300 hover:border-ink-300"
    >
      <div>
        <p className="eyebrow text-accent-600">{offer.eyebrow}</p>
        <h3 className="mt-3 font-display text-[1.1875rem] font-bold leading-snug tracking-[-0.02em] text-ink-950">
          {offer.title}
        </h3>
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-600">
          {offer.body}
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-accent-600">
        {offer.ctaLabel}
        <Icon
          name="arrowRight"
          size={15}
          className="transition-transform duration-200 group-hover/offer:translate-x-0.5"
        />
      </span>
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
      <div className="shell py-16 lg:py-24">
        <SectionHeading
          eyebrow="Special deals"
          id="offers-heading"
          title="Current offers"
          lead="Promotions running at the store right now. Deals and pricing are confirmed in store — tap an offer to ask us on WhatsApp what is available today."
        />

        <Reveal className="mt-10">
          <CardCarousel
            items={offers}
            ariaLabel="offer"
            renderItem={(offer) => <OfferCard key={offer.id} {...offer} />}
          />
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-400">
            Discounts, prices and eligibility are confirmed in store and may
            change — please check current terms with us before visiting.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
