import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Accessory category card — image-led retail tile.
 *
 * Uses the approved accessory artwork (from the CMS `accessory_categories`
 * image_path). If a category has no image yet, a clean icon tile stands in so
 * the grid is never broken. The whole card opens a category-specific WhatsApp
 * enquiry so availability is confirmed with the store.
 */
export function AccessoryCard({ category, index = 0 }) {
  return (
    <Reveal delay={Math.min(index, 6) * 60} className="h-full">
      <a
        href={waLink(waMessages.accessoryCategory(category.title))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ask about ${category.title} on WhatsApp`}
        className="group/acc flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-mute">
          {category.image ? (
            <img
              src={category.image}
              alt={category.alt || category.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/acc:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-accent-600">
              <Icon name={category.icon || "sparkle"} size={40} />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink-950">
            {category.title}
          </h3>
          {category.blurb ? (
            <p className="mt-1.5 flex-1 text-[0.875rem] leading-relaxed text-ink-600">
              {category.blurb}
            </p>
          ) : null}
          <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-semibold text-accent-600">
            Ask on WhatsApp
            <Icon
              name="arrowRight"
              size={15}
              className="transition-transform duration-200 group-hover/acc:translate-x-0.5"
            />
          </span>
        </div>
      </a>
    </Reveal>
  );
}

/** Bare grid of accessory category cards — reused on the standalone page. */
export function AccessoryGrid({ categories, columns = 3 }) {
  if (!categories?.length) return null;
  const cols =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`grid grid-cols-1 gap-4 ${cols} sm:gap-5`}>
      {categories.map((c, i) => (
        <li key={c.id} className="flex">
          <AccessoryCard category={c} index={i} />
        </li>
      ))}
    </ul>
  );
}

/** Empty state for when no accessory categories are active in the CMS. */
function AccessoriesEmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-paper-soft px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-accent-600 shadow-[var(--shadow-card)]">
        <Icon name="sparkle" size={22} />
      </span>
      <h3 className="mt-5 font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink-950">
        Ask what's in stock
      </h3>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        Covers, screen protection, chargers, earphones and power banks — message
        us and we'll tell you what's available in store today.
      </p>
      <div className="mt-6">
        <Button
          href={waLink(waMessages.accessories())}
          external
          variant="wa"
          size="lg"
          icon="whatsapp"
        >
          Ask on WhatsApp
        </Button>
      </div>
    </div>
  );
}

/**
 * Homepage accessories showcase — image-rich category grid pulled from the CMS.
 */
export default function AccessoriesSection() {
  const { accessories, home } = useSiteData();
  const categories = accessories.categories;
  const content = home.accessories || {};

  return (
    <section
      id="accessories"
      className="border-y border-line bg-paper-soft"
      aria-labelledby="accessories-heading"
      style={{ scrollMarginTop: "5.5rem" }}
    >
      <div className="shell py-16 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={content.eyebrow || "Accessories"}
            id="accessories-heading"
            title={content.heading || "The small things that keep a phone usable"}
            lead={
              content.subheading ||
              "Covers, screen protection, chargers, earphones and power banks — the everyday items you end up needing the same day."
            }
          />
          <Reveal delay={140} className="shrink-0">
            <Button to="/accessories" variant="outline" size="lg" iconRight="arrowRight">
              Browse accessories
            </Button>
          </Reveal>
        </div>

        {categories.length ? (
          <div className="mt-10">
            <AccessoryGrid categories={categories} columns={3} />
          </div>
        ) : (
          <AccessoriesEmptyState />
        )}
      </div>
    </section>
  );
}
