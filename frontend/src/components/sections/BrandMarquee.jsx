import { useState } from "react";
import Reveal from "../ui/Reveal.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * One brand logo, normalized into a consistent visual cell.
 *
 * Logos have very different shapes (square marks, wide wordmarks), so each sits
 * in a fixed-size box and is constrained with object-contain — the aspect ratio
 * is preserved, never stretched, and no brand dominates. A failed logo falls
 * back to a clean wordmark so the row is never broken.
 */
function MarqueeLogo({ brand }) {
  const [failed, setFailed] = useState(!brand.logo);
  return (
    <span className="flex h-14 w-[7rem] items-center justify-center sm:h-16 sm:w-[9rem]">
      {failed ? (
        <span className="font-display text-[1.0625rem] font-extrabold tracking-[-0.03em] text-ink-700">
          {brand.name}
        </span>
      ) : (
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain opacity-70 grayscale transition duration-300 group-hover/cell:opacity-100 group-hover/cell:grayscale-0"
        />
      )}
    </span>
  );
}

/**
 * Brands — a premium infinite horizontal marquee.
 *
 * The logo list is rendered twice inside one track; CSS animates the track by
 * exactly -50%, so the second copy seamlessly takes over with no visible jump
 * (see .sc-marquee-* in index.css). It pauses on hover/focus, and under
 * prefers-reduced-motion becomes a static, manually scrollable single row.
 *
 * Data and assets are the existing brand API + individual logo files — nothing
 * is downloaded, generated, combined or hardcoded.
 */
export default function BrandMarquee() {
  const { brands } = useSiteData();
  if (!brands.length) return null;

  const renderCell = (brand, i, duplicate = false) => (
    <li key={`${duplicate ? "dup-" : ""}${brand.id ?? brand.name}-${i}`} className="shrink-0">
      <a
        href={waLink(waMessages.brand(brand.name))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Enquire about ${brand.name} smartphones on WhatsApp`}
        tabIndex={duplicate ? -1 : 0}
        aria-hidden={duplicate ? true : undefined}
        className="group/cell flex items-center justify-center px-5 sm:px-7"
      >
        <MarqueeLogo brand={brand} />
      </a>
    </li>
  );

  return (
    <Reveal>
      <div className="sc-marquee-group no-scrollbar relative overflow-hidden">
        {/* Edge fades */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20"
        />

        <ul className="sc-marquee-track flex w-max items-center py-2">
          {brands.map((brand, i) => renderCell(brand, i, false))}
          {/* Duplicate copy for the seamless loop (hidden from a11y tree) */}
          {brands.map((brand, i) => renderCell(brand, i, true))}
        </ul>
      </div>
    </Reveal>
  );
}
