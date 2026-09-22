import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { offers } from "../../data/offers.js";

/**
 * "Current Offers" — the prototype's Special Deals block, done honestly.
 *
 * The prototype fills this section with mock figures ("₹499", "20% Off",
 * "Up to ₹10,000 Off"). None of that is reproduced. The shop publishes no
 * verifiable discount, price or expiry, so each card here is an evidence-backed
 * enquiry prompt (see data/offers.js) that routes to WhatsApp or a call, where
 * the customer confirms the current terms with the store directly.
 */
export default function OffersSection() {
  return (
    <section className="bg-white" aria-labelledby="offers-heading">
      <div className="shell py-16 lg:py-24">
        <SectionHeading
          eyebrow="Special deals"
          id="offers-heading"
          title="Current offers"
          lead="The shop runs deals in store and offers easy EMI options. Exact figures change often and are set at the counter — so message us for what is running today rather than trusting a number that could be out of date."
        />

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {offers.map((offer, i) => {
            const Tag = offer.ctaHref ? "a" : "div";
            const linkProps = offer.ctaHref
              ? {
                  href: offer.ctaHref,
                  ...(offer.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {}),
                }
              : {};

            return (
              <li key={offer.id} className="h-full">
                <Reveal delay={i * 70} className="h-full">
                  <Tag
                    {...linkProps}
                    className="group/offer flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-soft p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:bg-white hover:shadow-[var(--shadow-lift)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[13px] bg-ink-950 text-white">
                        <Icon name={offer.icon} size={21} />
                      </span>
                      <span className="rounded-full border border-line bg-white px-3 py-1 font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-500">
                        {offer.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-[1.1875rem] font-bold tracking-[-0.02em] text-ink-950">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-[0.8125rem] font-semibold text-accent-600">
                      {offer.subtitle}
                    </p>

                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-600">
                      {offer.body}
                    </p>

                    <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-snug text-ink-400">
                      <Icon
                        name="info"
                        size={13}
                        className="mt-0.5 shrink-0 text-ink-300"
                      />
                      <span>{offer.source}</span>
                    </p>

                    {offer.ctaHref && (
                      <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.875rem] font-semibold text-accent-600">
                        {offer.ctaLabel}
                        <Icon
                          name="arrowRight"
                          size={16}
                          className="transition-transform duration-200 group-hover/offer:translate-x-0.5"
                        />
                      </span>
                    )}
                  </Tag>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <Reveal delay={240}>
          <p className="mt-6 max-w-3xl text-[0.8125rem] leading-relaxed text-ink-400">
            No discount percentage, price or expiry date is shown because none is
            published — availability and terms are always confirmed in store or on
            WhatsApp.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
