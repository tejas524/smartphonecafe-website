import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { offerBanners } from "../../data/offers.js";
import { waLink } from "../../utils/whatsapp.js";

/**
 * Offers — owner-supplied promotional banners, shown AS-IS.
 *
 * One image = one offer (per the brief). The banners carry their own artwork
 * and calls to action, so nothing is overlaid on them; tapping a banner opens a
 * WhatsApp enquiry so the customer confirms the current terms with the store.
 * No price, discount or expiry is asserted in code — the honest disclaimer
 * under the grid makes clear the terms live in store.
 */
export default function OffersSection() {
  return (
    <section className="bg-paper-soft" aria-labelledby="offers-heading">
      <div className="shell py-16 lg:py-24">
        <SectionHeading
          eyebrow="Special deals"
          id="offers-heading"
          title="Current offers"
          lead="Promotions running at the store. Deals, pricing and eligibility are confirmed in store — tap any offer to ask us on WhatsApp what is available right now."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {offerBanners.map((offer, i) => (
            <Reveal key={offer.id} delay={i * 70}>
              <a
                href={waLink(offer.ctaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${offer.alt} — enquire on WhatsApp`}
                className="group/offer relative block overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <img
                  src={offer.src}
                  width={offer.width}
                  height={offer.height}
                  alt={offer.alt}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="block h-auto w-full"
                  style={{ aspectRatio: `${offer.width} / ${offer.height}` }}
                />
                {/* Small affordance that the banner is tappable */}
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/85 px-3 py-1.5 text-[0.75rem] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/offer:opacity-100">
                  <Icon name="whatsapp" size={13} className="text-wa-500" />
                  Enquire
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-6 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-400">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-ink-300" />
            <span>
              Offer artwork is provided by the store. Discounts, prices and
              eligibility shown on the banners are confirmed in store and may
              change — please check current terms with us before visiting.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
