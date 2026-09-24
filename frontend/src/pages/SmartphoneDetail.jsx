import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import LocationSection from "../components/sections/LocationSection.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import {
  formatPrice,
  variantLine,
  discountPercent,
} from "../components/smartphones/SmartphoneProductCard.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

const isActive = (s) => s.is_active !== 0 && s.is_active !== false;

function SpecRow({ label, value }) {
  if (value == null || String(value).trim() === "") return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.05em] text-ink-500">
        {label}
      </dt>
      <dd className="text-right text-[0.9375rem] text-ink-900">{value}</dd>
    </div>
  );
}

function NotFoundBody() {
  return (
    <div className="shell py-20 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
        <Icon name="smartphone" size={22} />
      </span>
      <h1 className="mt-4 font-display text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink-950">
        This smartphone isn't available
      </h1>
      <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        It may have been removed or is no longer listed. Browse the full catalog
        to see what's currently available.
      </p>
      <Button to="/smartphones" variant="outline" size="md" icon="arrowRight" className="mt-6">
        Back to Smartphones
      </Button>
    </div>
  );
}

export default function SmartphoneDetail() {
  const { id } = useParams();
  const { smartphones, business, status, reload } = useSiteData();

  const product = useMemo(() => {
    const list = smartphones || [];
    return (
      list.find((s) => String(s.slug) === String(id)) ||
      list.find((s) => String(s.id) === String(id)) ||
      null
    );
  }, [smartphones, id]);

  const name =
    product && ([product.brand, product.model].filter(Boolean).join(" ").trim() || "Smartphone");

  usePageMeta({
    title: product ? name : "Smartphones",
    description: product
      ? `${name} at SmartphoneCafe, Talegaon Dabhade. Check the latest price and availability on WhatsApp or call the store.`
      : "Browse smartphones at SmartphoneCafe, Talegaon Dabhade.",
    path: `/smartphones/${id}`,
  });

  const loading = status === "loading";

  if (loading && !product) {
    return (
      <section className="bg-white">
        <div className="shell py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-[var(--radius-lg)] bg-paper-mute" />
            <div className="space-y-4">
              <div className="h-3 w-1/4 animate-pulse rounded bg-paper-mute" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-paper-mute" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-paper-mute" />
              <div className="h-24 w-full animate-pulse rounded bg-paper-mute" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (status === "error" && !product) {
    return (
      <section className="bg-white">
        <div className="shell py-20 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
            <Icon name="alert" size={22} />
          </span>
          <h1 className="mt-4 font-display text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink-950">
            We couldn't load this product
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
            Please check your connection and try again.
          </p>
          <Button onClick={reload} variant="outline" size="md" icon="refresh" className="mt-6">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!product || !isActive(product)) {
    return <NotFoundBody />;
  }

  const price = formatPrice(product.price_amount, product.price_currency);
  const mrp = formatPrice(product.mrp_amount, product.price_currency);
  const showMrp = mrp && price && Number(product.mrp_amount) > Number(product.price_amount);
  const off = discountPercent(product);
  const inStock = product.stock_status === "in_stock";
  const outOfStock = product.stock_status === "out_of_stock";
  const variant = variantLine(product);
  const description = product.description || product.summary || "";
  const enquiry = waLink(waMessages.availability(name));

  const hasSpecs =
    product.ram ||
    product.storage ||
    product.colour ||
    product.is_5g != null ||
    product.stock_status;

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-500">
              <li>
                <Link to="/" className="transition-colors hover:text-ink-800">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="chevronRight" size={14} />
              </li>
              <li>
                <Link to="/smartphones" className="transition-colors hover:text-ink-800">
                  Smartphones
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="chevronRight" size={14} />
              </li>
              <li className="font-semibold text-ink-800">{name}</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <Reveal>
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-mute p-8"
                style={{ aspectRatio: "1 / 1" }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                  {product.is_featured ? (
                    <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-white">
                      Featured
                    </span>
                  ) : (
                    <span />
                  )}
                  {off != null ? (
                    <span className="rounded-full bg-accent-600 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-white">
                      {off}% off
                    </span>
                  ) : null}
                </div>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={name}
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="font-display text-[0.9375rem] font-semibold uppercase tracking-[0.14em] text-ink-300">
                    {product.brand || "Phone"}
                  </span>
                )}
              </div>
            </Reveal>

            {/* Info */}
            <Reveal delay={80}>
              <div className="flex h-full flex-col">
                {product.brand ? (
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-ink-400">
                    {product.brand}
                  </p>
                ) : null}
                <h1 className="mt-1.5 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.025em] text-ink-950 sm:text-[2rem]">
                  {product.model}
                </h1>
                {variant ? (
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{variant}</p>
                ) : null}

                {/* Price + availability */}
                {(price || inStock || outOfStock) && (
                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                    {price ? (
                      <span className="font-display text-[1.625rem] font-extrabold tracking-[-0.02em] text-ink-950 tabular-nums">
                        {price}
                      </span>
                    ) : null}
                    {showMrp ? (
                      <span className="text-[0.9375rem] text-ink-400 line-through tabular-nums">
                        {mrp}
                      </span>
                    ) : null}
                    {inStock ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-wa-600/25 bg-wa-500/10 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-wa-700">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-wa-500" />
                        Available
                      </span>
                    ) : null}
                    {outOfStock ? (
                      <span className="inline-flex items-center rounded-full border border-line bg-paper-mute px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-500">
                        Out of stock
                      </span>
                    ) : null}
                  </div>
                )}

                {!price ? (
                  <p className="mt-4 rounded-[var(--radius-md)] border border-line bg-paper-soft px-4 py-3 text-[0.875rem] leading-relaxed text-ink-600">
                    Message or call the store for the current price and to confirm
                    availability — we'll reply with today's figure.
                  </p>
                ) : null}

                {description ? (
                  <p className="mt-5 max-w-prose text-[0.9375rem] leading-relaxed text-ink-700">
                    {description}
                  </p>
                ) : null}

                {/* Actions */}
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <Button href={enquiry} external variant="wa" size="lg" icon="whatsapp">
                    Enquire on WhatsApp
                  </Button>
                  {business.phoneTel ? (
                    <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
                      Call {business.phoneDisplay}
                    </Button>
                  ) : null}
                </div>

                {product.warranty_note ? (
                  <p className="mt-5 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
                    <Icon name="shieldCheck" size={15} className="mt-0.5 shrink-0 text-accent-600" />
                    <span>{product.warranty_note}</span>
                  </p>
                ) : null}

                {/* Specifications */}
                {hasSpecs ? (
                  <div className="mt-8">
                    <h2 className="font-display text-[0.9375rem] font-bold tracking-[-0.01em] text-ink-950">
                      Specifications
                    </h2>
                    <dl className="mt-2 rounded-[var(--radius-md)] border border-line bg-white px-4">
                      <SpecRow label="Brand" value={product.brand || null} />
                      <SpecRow label="RAM" value={product.ram} />
                      <SpecRow label="Storage" value={product.storage} />
                      <SpecRow label="Colour" value={product.colour} />
                      <SpecRow
                        label="Network"
                        value={product.is_5g == null ? null : product.is_5g ? "5G" : "4G"}
                      />
                      <SpecRow
                        label="Availability"
                        value={
                          product.stock_status
                            ? product.stock_status === "in_stock"
                              ? "Available"
                              : product.stock_status === "out_of_stock"
                                ? "Out of stock"
                                : "Ask availability"
                            : null
                        }
                      />
                    </dl>
                  </div>
                ) : null}

                <div className="mt-8">
                  <Link
                    to="/smartphones"
                    className="group/link inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-ink-600 transition-colors hover:text-ink-950"
                  >
                    <Icon
                      name="chevronLeft"
                      size={16}
                      className="transition-transform duration-200 group-hover/link:-translate-x-0.5"
                    />
                    Back to Smartphones
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <LocationSection />
    </>
  );
}
