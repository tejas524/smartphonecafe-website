import { useState } from "react";
import Button from "../ui/Button.jsx";
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
      <span className="font-display text-[1.0625rem] font-extrabold tracking-[-0.03em] text-ink-900">
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
      className="h-7 w-auto max-w-[6.5rem] object-contain sm:h-8"
    />
  );
}

/**
 * Shop-by-brand grid — an editorial logo wall.
 *
 * Logos sit on a clean hairline grid (1px gap over a line-coloured backing),
 * not inside heavy rounded cards. Generous vertical space, one consistent logo
 * height, subtle separators. Each cell opens a WhatsApp availability enquiry
 * for that brand.
 */
export default function BrandGrid({ limit }) {
  const list = limit ? brands.slice(0, limit) : brands;

  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] bg-line sm:grid-cols-3 lg:grid-cols-5">
      {list.map((brand, i) => (
        <li key={brand.name} className="bg-white">
          <Reveal delay={i * 30} className="h-full">
            <a
              href={waLink(waMessages.brand(brand.name))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${brand.name} smartphones on WhatsApp`}
              className="group/brand flex h-full min-h-[6.5rem] items-center justify-center px-5 py-8 transition-colors duration-300 hover:bg-paper-soft"
            >
              <span className="flex items-center justify-center opacity-85 transition-opacity duration-300 group-hover/brand:opacity-100">
                <BrandLogo brand={brand} />
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
