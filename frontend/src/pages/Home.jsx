import { Link } from "react-router-dom";
import Hero from "../components/sections/Hero.jsx";
import StoreHighlights from "../components/sections/StoreHighlights.jsx";
import OffersSection from "../components/sections/OffersSection.jsx";
import { BrandCta } from "../components/sections/BrandGrid.jsx";
import BrandMarquee from "../components/sections/BrandMarquee.jsx";
import ReviewsSection from "../components/sections/ReviewsSection.jsx";
import SmartphoneShowcase from "../components/sections/SmartphoneShowcase.jsx";
import AccessoriesSection from "../components/sections/AccessoriesSection.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { photos } from "../data/photos.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Homepage — editorial skeleton, typography- and photography-led, in the
 * approved 14-section order:
 *   1 Utility bar · 2 Navigation        (layout/Header + TopBar)
 *   3 Hero            (full-width real store photo + readability gradient)
 *   4 Store highlights (quiet divider strip)
 *   5 Offers          (editorial text cards, no artwork)
 *   6 Brands          (editorial logo wall)
 *   7 Google reviews  (data-driven; animated review count)
 *   8 Smartphones     (text cards + neutral image area, shared carousel)
 *   9 Repairs         (real store photo + text rows)
 *  10 Accessories     (text category grid, no images)
 *  11 Inside SmartphoneCafe (asymmetric real-photo gallery)
 *  12 About           (editorial split + real photo)
 *  13 Visit store     (clean split: details + Google map)
 *  14 Final CTA       (dark band)
 *  15 Footer          (layout/Footer)
 *
 * No price, stock, spec or availability is asserted anywhere. Offers,
 * smartphones and accessories carry no images in this phase; every card routes
 * to a WhatsApp enquiry so terms are confirmed with the store.
 */
export default function Home() {
  const { business, repairs, home } = useSiteData();

  usePageMeta({
    title: null,
    description:
      "SmartphoneCafe is a mobile phone store and repair shop on Talegaon Station Road, Talegaon Dabhade. Browse smartphones, pick up accessories and get your phone repaired. Open 10 am – 9:30 pm daily.",
    path: "/",
  });

  return (
    <>
      {/* 3 — Hero */}
      <Hero />

      {/* 4 — Store highlights */}
      <StoreHighlights />

      {/* 5 — Offers */}
      <OffersSection />

      {/* 6 — Brands */}
      <section className="bg-white" aria-labelledby="brands-heading">
        <div className="shell py-16 lg:py-24">
          <SectionHeading
            eyebrow={home.brands?.eyebrow || "Shop by brand"}
            id="brands-heading"
            title={home.brands?.heading || "The brands people ask for"}
            lead={
              home.brands?.subheading ||
              "Tap a brand to start a WhatsApp enquiry. This is the list we are asked about most — not a stock list, so we confirm what is in store when you message."
            }
          />

          <div className="mt-10">
            <BrandMarquee />
          </div>

          <Reveal delay={200} className="mt-8">
            <BrandCta />
          </Reveal>
        </div>
      </section>

      {/* 7 — Google reviews */}
      <ReviewsSection />

      {/* 8 — Smartphones showcase (API-driven; premium empty state until stocked) */}
      <SmartphoneShowcase />

      {/* 9 — Repairs */}
      <section
        className="border-y border-line bg-paper-soft"
        aria-labelledby="repairs-heading"
      >
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Photo */}
            <Reveal className="lg:col-span-6">
              <Photo
                photo={photos.counterService}
                aspect="4 / 3"
                sizes="(min-width: 1024px) 48vw, 100vw"
                rounded="rounded-[var(--radius-lg)]"
                className="bg-paper-mute"
              />
              <p className="mt-3 text-[0.75rem] text-ink-400">
                {photos.counterService.caption} — at the SmartphoneCafe counter
              </p>
            </Reveal>

            {/* Copy + repair types */}
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow={home.repairs?.eyebrow || "Repairs"}
                id="repairs-heading"
                title={home.repairs?.heading || "Mobile repair services"}
                lead={
                  home.repairs?.subheading ||
                  "We are a dedicated mobile phone repair shop. Bring the phone in and the fault is checked at the counter before anything goes ahead."
                }
              />

              <Reveal delay={160} className="mt-7 flex flex-wrap gap-3">
                <Button
                  href={waLink(waMessages.repairs())}
                  external
                  variant="wa"
                  size="lg"
                  icon="whatsapp"
                >
                  WhatsApp your problem
                </Button>
                <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
                  Call {business.phoneDisplay}
                </Button>
              </Reveal>

              <ul className="mt-9 grid gap-x-10 sm:grid-cols-2">
                {repairs.slice(0, 8).map((issue, i) => (
                  <li key={issue.id}>
                    <Reveal delay={i * 35}>
                      <Link
                        to="/repairs"
                        className="group/rep flex items-center gap-3 border-t border-line py-3 transition-colors"
                      >
                        <Icon
                          name={issue.icon}
                          size={16}
                          className="shrink-0 text-accent-600"
                        />
                        <span className="min-w-0 flex-1 font-display text-[0.9375rem] font-semibold tracking-[-0.015em] text-ink-900">
                          {issue.title}
                        </span>
                        <Icon
                          name="arrowRight"
                          size={15}
                          className="shrink-0 text-ink-300 transition-transform duration-200 group-hover/rep:translate-x-0.5 group-hover/rep:text-accent-600"
                        />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10 — Accessories */}
      <AccessoriesSection />

      {/* 11 — Inside SmartphoneCafe */}
      <section
        className="border-t border-line bg-paper-soft"
        aria-labelledby="gallery-heading"
      >
        <div className="shell py-16 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Our store"
              id="gallery-heading"
              title="Inside SmartphoneCafe"
              lead="Real photographs of the store — the counter, the displays and the people behind it. Photographed in the shop, not borrowed from a stock library."
            />
            <Reveal delay={140} className="shrink-0">
              <Button to="/gallery" variant="outline" size="lg" iconRight="arrowRight">
                Open gallery
              </Button>
            </Reveal>
          </div>

          {/* Asymmetric gallery: one large feature + two supporting images */}
          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <Link to="/gallery" className="group/gal block">
                <Photo
                  photo={photos.interiorWide}
                  aspect="16 / 10"
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  rounded="rounded-[var(--radius-lg)]"
                  className="bg-paper-mute"
                  imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/gal:scale-[1.03]"
                />
                <span className="mt-3 block text-[0.75rem] text-ink-400">
                  {photos.interiorWide.caption}
                </span>
              </Link>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {[photos.ownerWithCustomer, photos.inStoreService].map((p, i) => (
                <Reveal key={p.id} delay={80 + i * 80}>
                  <Link to="/gallery" className="group/gal block">
                    <Photo
                      photo={p}
                      aspect="16 / 10"
                      sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
                      rounded="rounded-[var(--radius-lg)]"
                      className="bg-paper-mute"
                      imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/gal:scale-[1.03]"
                    />
                    <span className="mt-3 block text-[0.75rem] text-ink-400">
                      {p.caption}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 12 — About */}
      <section className="bg-white" aria-labelledby="intro-heading">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="About us"
                title="About SmartphoneCafe"
                as="h2"
                id="intro-heading"
              />

              <Reveal
                delay={140}
                className="mt-6 text-[1.0625rem] leading-relaxed text-ink-600"
              >
                <p>
                  {business.name} is a local mobile phone store and repair shop
                  on Talegaon Station Road near Umang Medical — an easy stop
                  whether you are buying a new handset, replacing a cracked
                  screen or picking up a charger on the way home.
                </p>
              </Reveal>

              <blockquote className="mt-8 border-l-2 border-accent-600 pl-5">
                <p className="text-[1rem] leading-relaxed text-ink-700 italic">
                  “{business.listingDescription}”
                </p>
                <footer className="mt-3 text-[0.75rem] text-ink-400">
                  — {business.listingName}, description published on their Google
                  Business Profile
                </footer>
              </blockquote>

              <Reveal delay={330} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  to="/about"
                  className="group/link inline-flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-accent-600 transition-colors hover:text-accent-700"
                >
                  More about the store
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                  />
                </Link>
                <a
                  href={business.google.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-ink-700 transition-colors hover:text-ink-950"
                >
                  <Icon name="google" size={16} />
                  See us on Google
                  <Icon name="external" size={13} className="text-ink-400" />
                </a>
              </Reveal>
            </div>

            <Reveal delay={100} className="lg:col-span-7">
              <Photo
                photo={photos.ownerWithCustomer}
                aspect="4 / 3"
                sizes="(min-width: 1024px) 56vw, 100vw"
                rounded="rounded-[var(--radius-lg)]"
                className="bg-paper-mute"
              />
              <p className="mt-3 text-[0.75rem] text-ink-400">
                {photos.ownerWithCustomer.caption}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 13 — Visit store */}
      <LocationSection />

      {/* 14 — Final CTA, then 15 — Footer (in Layout) */}
      <CtaBand />
    </>
  );
}
