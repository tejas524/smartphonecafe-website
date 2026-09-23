import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Button from "../ui/Button.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { smartphoneModelsNote } from "../../data/products.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Latest smartphones — text cards on the shared CardCarousel skeleton.
 *
 * No product images in this phase: each card reserves a clean, neutral area
 * where a real render will later drop in without changing the layout. No price,
 * spec, stock or discount is shown — only Brand → Model → Check availability.
 * With five models the row overflows on desktop, so the carousel activates
 * (four visible, one waiting); four or fewer would render as a static row.
 */
function PhoneCard(model) {
  return (
    <a
      href={waLink(waMessages.availability(`${model.brand} ${model.model}`))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Check availability of the ${model.brand} ${model.model} on WhatsApp`}
      className="group/card flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-white transition-colors duration-300 hover:border-ink-300"
    >
      {/* Product area — shows the real render when the CMS has one, otherwise a
          clean neutral placeholder sized identically so layout never shifts. */}
      <div
        className="flex items-center justify-center overflow-hidden bg-paper-mute"
        style={{ aspectRatio: "4 / 5" }}
      >
        {model.image ? (
          <img
            src={model.image}
            alt={`${model.brand} ${model.model}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
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
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-400">
          {model.brand}
        </p>
        <h3 className="mt-1 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
          {model.model}
        </h3>
        <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-accent-600">
          Check availability
          <Icon
            name="arrowRight"
            size={15}
            className="transition-transform duration-200 group-hover/card:translate-x-0.5"
          />
        </span>
      </div>
    </a>
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
            lead="A few of the models people come in asking about. Tell us your budget and we will help you pick — and confirm what is available today."
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
                renderItem={(model) => <PhoneCard key={model.slug} {...model} />}
              />
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-400">
                {smartphoneModelsNote}
              </p>
            </Reveal>
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
