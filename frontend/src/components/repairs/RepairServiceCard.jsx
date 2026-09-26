import Reveal from "../ui/Reveal.jsx";
import Icon from "../Icon.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * RepairServiceCard — a first-class catalog card for a single repair service.
 *
 * Mirrors the accessory/smartphone card treatment: rounded-lg surface, subtle
 * lift on hover, a consistent 4:3 media area and clean typography. Every field
 * is CMS-driven (repair_services). If a service has no photo yet, a clean icon
 * tile stands in so the grid never breaks — the existing fallback behaviour.
 * The whole card opens a service-specific WhatsApp enquiry.
 */
export default function RepairServiceCard({ repair, index = 0 }) {
  const name = repair.title || "Repair service";
  return (
    <Reveal delay={Math.min(index, 6) * 60} className="h-full">
      <a
        href={waLink(waMessages.repairService(name))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Enquire about ${name} on WhatsApp`}
        className="group/rep flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
      >
        {/* Media — consistent 4:3, real photo (cover) or clean icon fallback */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-mute">
          {repair.image ? (
            <img
              src={repair.image}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/rep:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-accent-600">
              <Icon name={repair.icon || "wrench"} size={40} />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-display text-[0.9375rem] font-bold leading-snug tracking-[-0.02em] text-ink-950 sm:text-[1.0625rem]">
            {name}
          </h3>
          {repair.blurb ? (
            <p className="mt-1.5 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-600 sm:text-[0.875rem]">
              {repair.blurb}
            </p>
          ) : null}
          <span className="mt-3 inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-semibold text-wa-700 sm:mt-4">
            <Icon name="whatsapp" size={15} className="shrink-0" />
            WhatsApp
            <Icon
              name="arrowRight"
              size={15}
              className="transition-transform duration-200 group-hover/rep:translate-x-0.5"
            />
          </span>
        </div>
      </a>
    </Reveal>
  );
}
