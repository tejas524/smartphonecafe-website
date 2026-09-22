import { useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { brands } from "../../data/brands.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Brand logo of the given brand, served from public/brand-logos/<slug>.svg.
 *
 * These are the real, official brand marks (sourced as vector SVG). If a logo
 * ever fails to load the card falls back to a clean typographic wordmark, so
 * the grid is never broken. Logos are used nominatively to show which brands
 * the shop sells — no dealership or partnership is claimed.
 */
function BrandLogo({ brand }) {
  const [failed, setFailed] = useState(!brand.logo);
  if (failed) {
    return (
      <span className="font-display text-[1.125rem] font-extrabold tracking-[-0.03em] text-ink-900">
        {brand.name}
      </span>
    );
  }
  return (
    <img
      src={brand.logo}
      alt={`${brand.name} logo`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="max-h-8 w-auto max-w-[8rem] object-contain"
    />
  );
}

/**
 * Shop-by-brand grid — official logos on clean cards, each opening a WhatsApp
 * availability enquiry for that brand.
 */
export default function BrandGrid({ limit }) {
  const list = limit ? brands.slice(0, limit) : brands;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {list.map((brand, i) => (
        <li key={brand.name}>
          <Reveal delay={i * 35} className="h-full">
            <a
              href={waLink(waMessages.brand(brand.name))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${brand.name} smartphones on WhatsApp`}
              className="group/brand flex h-full flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
            >
              <span className="flex h-12 items-center justify-center">
                <BrandLogo brand={brand} />
              </span>
              <span className="flex items-center gap-1 text-[0.75rem] font-medium text-ink-400 transition-colors group-hover/brand:text-accent-600">
                {brand.note}
                <Icon
                  name="arrowUpRight"
                  size={13}
                  className="opacity-0 transition-opacity duration-200 group-hover/brand:opacity-100"
                />
              </span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export function BrandCta({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Button
        href={waLink(waMessages.smartphones())}
        external
        variant="wa"
        size="lg"
        icon="whatsapp"
      >
        Check availability on WhatsApp
      </Button>
      <p className="text-[0.8125rem] leading-snug text-ink-500">
        Brand list only — tell us the model and we will confirm what is in store today.
      </p>
    </div>
  );
}
