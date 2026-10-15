import Reveal from "../ui/Reveal.jsx";
import Icon from "../Icon.jsx";
import OfferCardCarousel from "../ui/OfferCardCarousel.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Offers — a centered section header, an image-only banner carousel
 * (OfferCardCarousel) and one WhatsApp enquiry below it.
 *
 * Everything stays API-driven: MySQL → /bootstrap → useSiteData() → here. The
 * offers array is already filtered to `is_active = 1` and ordered by
 * `display_order` on the server, so it is passed straight through — no second
 * offers system, no hardcoded record, and no invented price, discount or copy.
 * The eyebrow, heading and intro are CMS-editable with the copy below as the
 * fallback, exactly as the other sections do it.
 *
 * The banner artwork is the whole card: no title, category, discount repeat,
 * icon, overlay CTA or metadata is layered on top of it, and the card is not a
 * link — the banners carry their own calls to action. The section's single call
 * to action is the WhatsApp button under the rail. With no active offers the
 * whole section hides itself rather than rendering an empty frame.
 */
export default function OffersSection() {
  const { offers, home } = useSiteData();

  if (!offers.length) return null;
  const content = home.offers || {};

  return (
    <section
      className="bg-paper-soft"
      id="offers"
      aria-labelledby="offers-heading"
      style={{ scrollMarginTop: "5.5rem" }}
    >
      <div className="shell py-8 sm:py-12 lg:py-16">
        {/* Centered header — tighter rhythm on phones, roomier from `sm` up. */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* The .eyebrow token is 11px; the utilities layer wins over it so
              the kicker sits at 12px on phones as specified. */}
          <Reveal as="p" className="eyebrow text-[0.75rem] text-accent-600">
            {content.eyebrow || "Offers"}
          </Reveal>

          <Reveal
            as="h2"
            id="offers-heading"
            delay={60}
            className="mt-2.5 text-[1.6875rem] text-ink-950 sm:mt-3.5 sm:text-[2.375rem] lg:text-[2.75rem]"
          >
            {content.heading || "Deals for you"}
          </Reveal>

          <Reveal
            as="p"
            delay={120}
            className="mt-2.5 max-w-xl text-[0.875rem] leading-relaxed text-ink-600 sm:mt-4 sm:text-[1.0625rem]"
          >
            {content.subheading ||
              "The latest deals running in store — message us on WhatsApp to confirm any offer."}
          </Reveal>
        </div>

        {/* Image-only banner rail. Drag / swipe / arrows / dots all drive the
            same Embla instance; its entrance animation lives in the component. */}
        <div className="mt-5 sm:mt-8">
          <OfferCardCarousel offers={offers} ariaLabel="Store offers" />
        </div>

        {/* The section's one call to action, deliberately outside the cards.
            Height and radius are set here rather than via <Button size="lg">
            because that size is 44px on phones, and this CTA is specified at
            48–52px; the colours and type come from the same `wa` Button tokens. */}
        <Reveal delay={120} className="mt-5 flex justify-center sm:mt-8">
          <a
            href={waLink(waMessages.offers())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full max-w-md items-center justify-center gap-2.5 rounded-full bg-wa-600 px-6 font-display text-[0.9375rem] font-semibold tracking-[-0.01em] text-white shadow-[0_1px_2px_rgb(18_140_63/0.2),0_10px_24px_-12px_rgb(18_140_63/0.6)] transition-colors duration-200 hover:bg-wa-700 active:bg-wa-700 sm:h-[3.25rem] sm:w-auto sm:text-base"
          >
            <Icon name="whatsapp" size={19} className="shrink-0" />
            Enquire on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
