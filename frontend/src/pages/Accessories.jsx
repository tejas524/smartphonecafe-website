import PageHero from "../components/sections/PageHero.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import { AccessoryGrid } from "../components/sections/AccessoriesSection.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { inStoreServices } from "../data/accessories.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Accessories page — image-led category browse + in-store services.
 *
 * Categories are CMS-driven (accessory_categories) with approved artwork; each
 * card opens a category-specific WhatsApp enquiry. Nothing is priced or listed
 * as guaranteed stock — availability is confirmed with the store. The in-store
 * services are supported by the shop's own Google listing categories.
 */
export default function Accessories() {
  const { accessories } = useSiteData();
  const categories = accessories.categories;

  usePageMeta({
    title: "Accessories",
    description:
      "Mobile accessories at SmartphoneCafe, Talegaon Dabhade — covers and cases, tempered glass, chargers and cables, earphones, power banks and more. Message us on WhatsApp to check what's in stock today.",
    path: "/accessories",
  });

  return (
    <>
      <PageHero
        eyebrow="Accessories"
        title="Covers, glass, chargers and everything in between."
        lead="The everyday accessories you end up needing the same day — fitted and checked at the counter. Tap a category to ask what's in stock right now on WhatsApp."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button
            href={waLink(waMessages.accessories())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            Ask what's in stock
          </Button>
        </div>
      </PageHero>

      <section className="bg-white" aria-labelledby="accessory-cats-heading">
        <div className="shell py-14 lg:py-20">
          <SectionHeading
            eyebrow="Browse by category"
            id="accessory-cats-heading"
            title="What we carry"
            lead="A snapshot of the categories customers ask for most. It's not a stock or price list — message us and we'll confirm exactly what's available."
          />
          {categories.length ? (
            <div className="mt-10">
              <AccessoryGrid categories={categories} columns={3} />
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-paper-soft px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-accent-600 shadow-[var(--shadow-card)]">
                <Icon name="sparkle" size={22} />
              </span>
              <h3 className="mt-5 font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink-950">
                Ask what's in stock
              </h3>
              <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
                Message us and we'll tell you which accessories are available in
                store today.
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
          )}
        </div>
      </section>

      {/* In-store services */}
      <section className="border-y border-line bg-paper-soft" aria-labelledby="instore-heading">
        <div className="shell py-16 lg:py-24">
          <SectionHeading
            eyebrow="At the counter"
            id="instore-heading"
            title="Set-up and services while you're here"
            lead="Beyond the accessories themselves, these are the things the counter can help with when you buy or bring in a phone."
          />
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {inStoreServices.map((s, i) => (
              <li key={s.title} className="flex">
                <Reveal delay={Math.min(i, 6) * 60} className="h-full w-full">
                  <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-white p-6 shadow-[var(--shadow-card)]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-accent-50 text-accent-600">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <h3 className="mt-4 font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink-950">
                      {s.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-600">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LocationSection />

      <CtaBand
        eyebrow="Not sure what fits your phone?"
        title="Message us your model and we'll sort it."
        body="Tell us your phone and what you're after — a cover, glass, charger or earphones — and we'll confirm what's in stock and the right fit."
        message={waMessages.accessories()}
      />
    </>
  );
}
