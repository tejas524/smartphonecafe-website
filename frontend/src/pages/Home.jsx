import { Link } from "react-router-dom";
import Hero from "../components/sections/Hero.jsx";
import StoreHighlights from "../components/sections/StoreHighlights.jsx";
import OffersSection from "../components/sections/OffersSection.jsx";
import BrandMarquee from "../components/sections/BrandMarquee.jsx";
import ReviewsSection from "../components/sections/ReviewsSection.jsx";
import SmartphoneShowcase from "../components/sections/SmartphoneShowcase.jsx";
import AccessoriesSection from "../components/sections/AccessoriesSection.jsx";
import RepairsCarousel from "../components/sections/RepairsCarousel.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { photos } from "../data/photos.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Homepage — editorial skeleton, typography- and photography-led, in the
 * approved 14-section order:
 *   1 Utility bar · 2 Navigation        (layout/Header + TopBar)
 *   3 Hero            (full-width real store photo + readability gradient)
 *   4 Store highlights (quiet divider strip)
 *   5 Offers          (image-only draggable card carousel)
 *   6 Brands          (editorial logo wall)
 *   7 Google reviews  (data-driven; animated review count)
 *   8 Smartphones     (product cards with photos, shared carousel)
 *   9 Repairs         (real store photo + text rows)
 *  10 Accessories     (category cards with photos)
 *  11 Inside SmartphoneCafe (asymmetric real-photo gallery)
 *  12 About           (editorial split + real photo)
 *  13 Visit store     (clean split: details + Google map)
 *  14 Final CTA       (dark band)
 *  15 Footer          (layout/Footer)
 *
 * No price, stock, spec or availability is asserted anywhere. Every offer,
 * smartphone and accessory card routes to a WhatsApp enquiry so terms are
 * confirmed with the store.
 */
export default function Home() {
  const { business, home } = useSiteData();

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

      {/* 6 — Brands (clean "Shop by Brand" strip) */}
      <section className="bg-white" aria-labelledby="brands-heading">
        <div className="shell py-12 lg:py-16">
          <SectionHeading
            eyebrow={home.brands?.eyebrow || "Brands"}
            id="brands-heading"
            title={home.brands?.heading || "Shop by Brand"}
          />

          <div className="mt-8">
            <BrandMarquee />
          </div>
        </div>
      </section>

      {/* 7 — Google reviews */}
      <ReviewsSection />

      {/* 8 — Smartphones showcase (API-driven; premium empty state until stocked) */}
      <SmartphoneShowcase />

      {/* 9 — Repairs (interactive service carousel, CMS-driven) */}
      <RepairsCarousel />

      {/* 10 — Accessories */}
      <AccessoriesSection />

      {/* 11 — Inside SmartphoneCafe */}
      <section
        className="border-t border-line bg-paper-soft"
        aria-labelledby="gallery-heading"
      >
        <div className="shell py-12 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Our store"
              id="gallery-heading"
              title="Inside SmartphoneCafe"
              lead="Real photographs of the store — the counter, the displays and the people behind it. Photographed in the shop, not borrowed from a stock library."
            />
            <Reveal delay={140} className="shrink-0">
              <Button to="/gallery" variant="outline" size="lg" iconRight="arrowRight" className="w-full sm:w-auto">
                Open gallery
              </Button>
            </Reveal>
          </div>

          {/* Asymmetric gallery: one large feature + two supporting images.
              On phones only the feature photo shows so the teaser stays compact. */}
          <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-12">
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

            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
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
        <div className="shell py-12 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="About us"
                title="About SmartphoneCafe"
                as="h2"
                id="intro-heading"
              />

              <Reveal
                delay={140}
                className="mt-6 text-[1rem] leading-relaxed text-ink-600 sm:text-[1.0625rem]"
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
