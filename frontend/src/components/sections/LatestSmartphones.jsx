import { useState } from "react";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Button from "../ui/Button.jsx";
import { smartphoneModels, smartphoneModelsNote } from "../../data/products.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Product image with a brand-logo fallback.
 *
 * If the official render is missing, the card shows the brand logo on the same
 * gradient so the grid never breaks and never fabricates a product photo.
 */
function ProductImage({ model }) {
  const [failed, setFailed] = useState(!model.image);

  return (
    <div className="relative flex aspect-square items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#f4f6fb_0%,#e9edf6_100%)] p-6">
      {failed ? (
        <img
          src={`/brand-logos/${model.brandSlug}.svg`}
          alt={`${model.brand} logo`}
          loading="lazy"
          decoding="async"
          className="max-h-12 w-auto max-w-[9rem] object-contain opacity-80"
        />
      ) : (
        <img
          src={model.image}
          alt={model.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.05]"
        />
      )}
    </div>
  );
}

/**
 * "Latest Smartphones" — a visual, representative line-up (not a stock list).
 * Official renders on clean cards; each opens a "Check Availability" WhatsApp
 * enquiry. No price, stock or availability is stated anywhere.
 */
export default function LatestSmartphones() {
  return (
    <section className="bg-white" aria-labelledby="latest-heading">
      <div className="shell py-14 lg:py-20">
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

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {smartphoneModels.map((model, i) => (
            <li key={model.slug}>
              <Reveal delay={i * 60} className="h-full">
                <a
                  href={waLink(waMessages.availability(`${model.brand} ${model.model}`))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Check availability of the ${model.brand} ${model.model} on WhatsApp`}
                  className="group/card flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
                >
                  <ProductImage model={model} />
                  <div className="flex flex-1 flex-col border-t border-line p-4">
                    <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                      {model.brand}
                    </span>
                    <span className="mt-1 font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
                      {model.model}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-accent-600">
                      Check availability
                      <Icon
                        name="arrowRight"
                        size={14}
                        className="transition-transform duration-200 group-hover/card:translate-x-0.5"
                      />
                    </span>
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={220}>
          <p className="mt-6 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-400">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-ink-300" />
            <span>{smartphoneModelsNote}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
