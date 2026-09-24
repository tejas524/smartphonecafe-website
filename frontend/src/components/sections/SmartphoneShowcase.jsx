import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Button from "../ui/Button.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";

/**
 * Homepage smartphone showcase — a premium retail "Available right now" strip.
 *
 * Everything is API-driven (MySQL -> /api/public/bootstrap -> useSiteData()):
 * no product, price, spec, stock or image is invented. Up to five real products
 * render as a balanced row; a sixth or more turns the shared scroll-snap
 * carousel on. With no products it shows a compact premium empty state. The
 * approved brand logos sit below as a scrollable strip. Product-detail routing
 * doesn't exist yet, so "View details" and the header CTA both route to the
 * existing /smartphones page via client-side navigation.
 */
const HOMEPAGE_MAX = 8;

function formatPrice(amount, currency = "INR") {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Human variant line from whatever spec fields the record actually has. */
function variantLine(model) {
  return [model.ram, model.storage, model.colour]
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
    .join(" · ");
}

function SmartphoneCard(model) {
  const [saved, setSaved] = useState(false);
  const name = [model.brand, model.model].filter(Boolean).join(" ").trim();
  const price = formatPrice(model.price_amount, model.price_currency);
  const mrp = formatPrice(model.mrp_amount, model.price_currency);
  const showMrp = mrp && price && Number(model.mrp_amount) > Number(model.price_amount);
  const inStock = model.stock_status === "in_stock";
  const variant = variantLine(model);

  return (
    <article className="group/card relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]">
      {/* Badge + wishlist */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
        {model.is_featured ? (
          <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-white">
            Featured
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
          aria-pressed={saved}
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/90 text-ink-400 backdrop-blur-sm transition-colors hover:text-accent-600"
        >
          <Icon name={saved ? "heartFilled" : "heart"} size={16} />
        </button>
      </div>

      {/* Product image — large, centered, never cropped */}
      <div
        className="flex items-center justify-center overflow-hidden bg-paper-mute p-5"
        style={{ aspectRatio: "1 / 1" }}
      >
        {model.image ? (
          <img
            src={model.image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink-300"
          >
            {model.brand || "Phone"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {model.brand ? (
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-400">
            {model.brand}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-[1.0625rem] font-bold leading-snug tracking-[-0.015em] text-ink-950">
          {model.model}
        </h3>
        {variant ? (
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-500">{variant}</p>
        ) : null}

        {(price || inStock) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            {price ? (
              <span className="font-display text-[1.125rem] font-extrabold tracking-[-0.02em] text-ink-950 tabular-nums">
                {price}
              </span>
            ) : null}
            {showMrp ? (
              <span className="text-[0.8125rem] text-ink-400 line-through tabular-nums">
                {mrp}
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
          <Link
            to={`/smartphones/${model.slug || model.id}`}
            aria-label={`View details for the ${name}`}
            className="group/link inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-accent-600 transition-colors hover:text-accent-700"
          >
            View details
            <Icon
              name="arrowRight"
              size={15}
              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function BrandStrip({ brands }) {
  if (!brands?.length) return null;
  return (
    <Reveal delay={120} className="mt-12">
      <div className="border-t border-line pt-8">
        <p className="text-center text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-400">
          Brands we stock
        </p>
        <ul className="no-scrollbar mt-5 flex items-center gap-8 overflow-x-auto sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-6 sm:overflow-visible">
          {brands.map((brand) => (
            <li key={brand.id} className="flex shrink-0 items-center justify-center">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={`${brand.name} smartphones`}
                  loading="lazy"
                  decoding="async"
                  className="h-7 w-auto opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-8"
                />
              ) : (
                <span className="font-display text-[0.9375rem] font-semibold text-ink-400">
                  {brand.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function ShowcaseEmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-white px-6 py-12 text-center shadow-[var(--shadow-card)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
        <Icon name="smartphone" size={22} />
      </span>
      <p className="mt-4 max-w-sm font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
        Smartphones will appear here once products are added.
      </p>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        In the meantime, tell us the model or budget you have in mind and we'll
        confirm what's available in store today.
      </p>
    </div>
  );
}

export default function SmartphoneShowcase() {
  const { smartphones, brands } = useSiteData();
  // A homepage showcase, not the full catalogue: show the first few by order
  // and let the carousel handle any overflow. "Explore all smartphones" is the
  // entry point to the complete /smartphones catalogue.
  const shown = smartphones.slice(0, HOMEPAGE_MAX);

  return (
    <section className="relative overflow-hidden bg-white" aria-labelledby="showcase-heading">
      {/* Warm decorative accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,138,76,0.16) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-40 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,170,110,0.12) 0%, transparent 70%)" }}
      />

      <div className="shell relative py-16 lg:py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Smartphones"
            id="showcase-heading"
            title="Available right now"
            lead="Explore some of the smartphones currently available at SmartphoneCafe."
          />
          <Reveal delay={140} className="shrink-0">
            <Button to="/smartphones" variant="outline" size="lg" iconRight="arrowRight">
              Explore all smartphones
            </Button>
          </Reveal>
        </div>

        {smartphones.length === 0 ? (
          <Reveal>
            <ShowcaseEmptyState />
          </Reveal>
        ) : (
          <>
            {/* Products always render inside the carousel: up to five fit in one
                row on desktop, and the shared scroll-snap track adds arrows +
                dots (and native swipe/drag) on tablet and mobile where they
                overflow. */}
            <Reveal className="mt-10">
              <CardCarousel
                items={shown}
                ariaLabel="smartphone"
                cardBasis="basis-[80%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)] xl:basis-[calc(20%-0.8rem)]"
                renderItem={(model) => <SmartphoneCard key={model.slug || model.id} {...model} />}
              />
            </Reveal>

            {/* Catalogue entry point at the end of the showcase */}
            <Reveal delay={120} className="mt-10 flex justify-center">
              <Button to="/smartphones" variant="accent" size="lg" iconRight="arrowRight">
                Explore all smartphones
              </Button>
            </Reveal>
          </>
        )}

        <BrandStrip brands={brands} />
      </div>
    </section>
  );
}
