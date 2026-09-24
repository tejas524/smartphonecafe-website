import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Button from "../ui/Button.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { smartphoneModelsNote } from "../../data/products.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Latest smartphones — a premium product catalogue.
 *
 * Cards are built entirely from CMS data (MySQL -> API -> useSiteData()); no
 * model, price, spec or stock value is invented. Price and availability render
 * ONLY when the record actually carries them, and are hidden cleanly otherwise.
 * On wide screens up to five cards sit in one balanced row; at narrower widths
 * the shared scroll-snap carousel activates (swipe + arrows + dots). When the
 * catalogue is empty (its intentional state until the shop is stocked) a clear
 * "tell us what you're looking for" panel is shown instead.
 */

/** Indian-format price, only when a positive amount exists. */
function formatPrice(amount, currency = "INR") {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function PhoneCard(model) {
  const name = [model.brand, model.model].filter(Boolean).join(" ").trim();
  const price = formatPrice(model.price_amount, model.price_currency);
  const inStock = model.stock_status === "in_stock";
  const enquiry = waLink(waMessages.availability(name));

  return (
    <article className="group/card flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]">
      {/* Product image — consistent area across cards; artwork never distorted. */}
      <div
        className="flex items-center justify-center overflow-hidden bg-paper-mute p-4"
        style={{ aspectRatio: "4 / 5" }}
      >
        {model.image ? (
          <img
            src={model.image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink-300"
          >
            {model.brand}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {model.brand ? (
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-400">
            {model.brand}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
          {model.model}
        </h3>

        {/* Price + availability render only when present */}
        {(price || inStock) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {price ? (
              <span className="font-display text-[1.0625rem] font-extrabold tracking-[-0.02em] text-ink-950 tabular-nums">
                {price}
              </span>
            ) : null}
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-wa-600/25 bg-wa-500/10 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-wa-700">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-wa-500" />
                Available
              </span>
            ) : null}
          </div>
        )}

        <div className="mt-auto pt-5">
          <Button
            href={enquiry}
            external
            variant="wa"
            size="md"
            icon="whatsapp"
            full
            aria-label={`Check availability of the ${name} on WhatsApp`}
          >
            Check availability
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Polished empty state shown when the catalogue has no active products yet. */
function PhonesEmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-paper-soft px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-accent-600 shadow-[var(--shadow-card)]">
        <Icon name="smartphone" size={22} />
      </span>
      <h3 className="mt-5 font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink-950">
        Tell us what you're looking for
      </h3>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        We stock a changing range of handsets across every budget. Message us
        the model or budget you have in mind and we'll tell you what's available
        in store today.
      </p>
      <div className="mt-6">
        <Button
          href={waLink(waMessages.smartphones())}
          external
          variant="wa"
          size="lg"
          icon="whatsapp"
        >
          Ask about a phone
        </Button>
      </div>
    </div>
  );
}

export default function LatestSmartphones() {
  const { smartphones } = useSiteData();
  const hasPhones = smartphones.length > 0;

  return (
    <section className="bg-white" aria-labelledby="latest-heading">
      <div className="shell py-16 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Latest smartphones"
            id="latest-heading"
            title="Popular right now"
            lead="A few of the models people come in asking about. Tell us your budget and we'll help you pick — and confirm what's available today."
          />
          <Reveal delay={140} className="shrink-0">
            <Button
              href={waLink(waMessages.smartphones())}
              external
              variant="wa"
              size="lg"
              icon="whatsapp"
            >
              Check availability
            </Button>
          </Reveal>
        </div>

        {hasPhones ? (
          <>
            <Reveal className="mt-10">
              <CardCarousel
                items={smartphones}
                ariaLabel="smartphone"
                cardBasis="basis-[82%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)] xl:basis-[calc(20%-0.8rem)]"
                renderItem={(model) => <PhoneCard key={model.slug || model.id} {...model} />}
              />
            </Reveal>

            {smartphoneModelsNote ? (
              <Reveal delay={160}>
                <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-400">
                  {smartphoneModelsNote}
                </p>
              </Reveal>
            ) : null}
          </>
        ) : (
          <Reveal>
            <PhonesEmptyState />
          </Reveal>
        )}
      </div>
    </section>
  );
}
