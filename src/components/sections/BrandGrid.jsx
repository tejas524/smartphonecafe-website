import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { brands } from "../../data/brands.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Brand showcase.
 *
 * Rendered as text wordmarks rather than logos: the shop's authorised-dealer
 * status is unverified, so reproducing manufacturer marks would imply a
 * relationship that has not been confirmed. Typographic cards also stay crisp
 * at every size and cost nothing to load.
 */
export default function BrandGrid({ tone = "light", limit }) {
  const list = limit ? brands.slice(0, limit) : brands;
  const isDark = tone === "dark";

  return (
    <ul
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] sm:grid-cols-3 lg:grid-cols-5 ${
        isDark ? "bg-white/10" : "bg-line"
      }`}
    >
      {list.map((brand, i) => (
        <li key={brand.name} className={isDark ? "bg-ink-900" : "bg-white"}>
          <Reveal delay={i * 35}>
            <a
              href={waLink(waMessages.brand(brand.name))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${brand.name} smartphones on WhatsApp`}
              className={`group/brand flex h-full min-h-[7rem] flex-col justify-between p-5 transition-colors duration-200 ${
                isDark ? "hover:bg-ink-850" : "hover:bg-paper-soft"
              }`}
            >
              <span
                className={`font-display text-[1.25rem] font-extrabold leading-none tracking-[-0.035em] transition-colors sm:text-[1.375rem] ${
                  isDark
                    ? "text-white/85 group-hover/brand:text-white"
                    : "text-ink-900 group-hover/brand:text-accent-600"
                }`}
              >
                {brand.name}
              </span>

              <span className="mt-4 flex items-end justify-between gap-2">
                <span
                  className={`text-[0.75rem] leading-tight ${
                    isDark ? "text-ink-500" : "text-ink-400"
                  }`}
                >
                  {brand.note}
                </span>
                <Icon
                  name="arrowUpRight"
                  size={15}
                  className={`shrink-0 transition-transform duration-200 group-hover/brand:-translate-y-0.5 group-hover/brand:translate-x-0.5 ${
                    isDark ? "text-ink-600" : "text-ink-300"
                  }`}
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