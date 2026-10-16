import Icon from "../Icon.jsx";
import ResponsiveImage from "../ui/ResponsiveImage.jsx";
import Button from "../ui/Button.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/** ₹ price from a numeric amount; null when there is no real, positive price. */
export function formatPrice(amount, currency = "INR") {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Percentage saving when a real MRP is above a real selling price. */
export function discountPercent(item) {
  const price = Number(item.price_amount);
  const mrp = Number(item.mrp_amount);
  if (!Number.isFinite(price) || !Number.isFinite(mrp) || price <= 0 || mrp <= price) {
    return null;
  }
  return Math.round((1 - price / mrp) * 100);
}

/** Secondary spec line from whatever variant fields the record actually holds. */
export function accessoryVariantLine(item) {
  return [item.colour, item.compatibility]
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
    .join(" · ");
}

/**
 * AccessoryProductCard — the shared public accessories catalog card.
 *
 * Mirrors SmartphoneProductCard exactly: every field is optional and rendered
 * only when the CMS record actually holds it — no price, stock, discount or
 * image is fabricated. Missing fields are hidden rather than faked. The primary
 * action is a product-specific WhatsApp enquiry (accessories are confirmed with
 * the store), matching the site's enquiry-led model.
 */
export default function AccessoryProductCard({ item }) {
  const name = item.name || "Accessory";
  const price = formatPrice(item.price_amount, item.price_currency);
  const mrp = formatPrice(item.mrp_amount, item.price_currency);
  const showMrp = mrp && price && Number(item.mrp_amount) > Number(item.price_amount);
  const off = discountPercent(item);
  const inStock = item.stock_status === "in_stock";
  const outOfStock = item.stock_status === "out_of_stock";
  const variant = accessoryVariantLine(item);
  const label = item.categoryTitle || item.brand || "";

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]">
      {/* Badges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-1 p-2 sm:gap-2 sm:p-3">
        {item.is_featured ? (
          <span className="whitespace-nowrap rounded-full bg-ink-950 px-2 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-white sm:px-2.5 sm:text-[0.625rem]">
            Featured
          </span>
        ) : (
          <span />
        )}
        {off != null ? (
          <span className="whitespace-nowrap rounded-full bg-accent-600 px-2 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.06em] text-white sm:px-2.5 sm:text-[0.625rem]">
            {off}% off
          </span>
        ) : null}
      </div>

      {/* Image — consistent square area, contained, never cropped */}
      <div
        className="flex items-center justify-center overflow-hidden bg-paper-mute p-3 sm:p-5"
        style={{ aspectRatio: "1 / 1" }}
      >
        {item.image ? (
          <ResponsiveImage
            src={item.image}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 360px) 50vw, 100vw"
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
            {label || "Accessory"}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        {label ? (
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-400">
            {label}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-base font-bold leading-snug tracking-[-0.015em] text-ink-950 sm:text-[1.0625rem]">
          {name}
        </h3>
        {item.summary ? (
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-500">
            {item.summary}
          </p>
        ) : variant ? (
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-500">{variant}</p>
        ) : null}

        {(price || inStock || outOfStock) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            {price ? (
              <span className="font-display text-[1.0625rem] font-extrabold tracking-[-0.02em] text-ink-950 tabular-nums sm:text-[1.125rem]">
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
            {outOfStock ? (
              <span className="inline-flex items-center rounded-full border border-line bg-paper-mute px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-500">
                Out of stock
              </span>
            ) : null}
          </div>
        )}

        <div className="mt-auto pt-4">
          <Button
            href={waLink(waMessages.accessoryProduct(name))}
            external
            variant="wa"
            size="sm"
            icon="whatsapp"
            className="w-full"
          >
            Ask on WhatsApp
          </Button>
        </div>
      </div>
    </article>
  );
}
