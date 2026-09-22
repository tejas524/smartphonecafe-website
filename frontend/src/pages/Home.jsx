import { Link } from "react-router-dom";
import Hero from "../components/sections/Hero.jsx";
import TrustBar from "../components/sections/TrustBar.jsx";
import OffersSection from "../components/sections/OffersSection.jsx";
import BrandGrid, { BrandCta } from "../components/sections/BrandGrid.jsx";
import LatestSmartphones from "../components/sections/LatestSmartphones.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import AssetImage from "../components/ui/AssetImage.jsx";
import { business } from "../data/site.js";
import { repairIssues } from "../data/repairs.js";
import { accessoryCategories } from "../data/accessories.js";
import { photos } from "../data/photos.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Homepage — image-led, in the approved 13-section order:
 *   1 Top bar · 2 Navigation  (layout/Header + TopBar)
 *   3 Hero (full-width, real store photo)
 *   4 Trust / features (TrustBar)
 *   5 Offers (owner-supplied banners, as-is)
 *   6 Shop by brand (official logos)
 *   7 Latest smartphones (official product renders, representative)
 *   8 Repairs (real store photo)
 *   9 Accessories (owner-supplied category banners)
 *  10 Gallery (real store photos)
 *  11 About (real store photo + verified listing quote)
 *  12 Store + Map (LocationSection)
 *  13 Footer (layout/Footer)
 * A closing WhatsApp/call band (CtaBand) sits just above the footer.
 *
 * No price, stock or availability is asserted anywhere; catalog imagery is
 * representative and every card routes to a "Check Availability" enquiry.
 */

export default function Home() {
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

      {/* 4 — Trust / features */}
      <TrustBar />

      {/* 5 — Offers */}
      <OffersSection />

      {/* 6 — Shop by brand */}
      <section className="bg-white" aria-labelledby="brands-heading">
        <div className="shell py-14 lg:py-20">
          <SectionHeading
            eyebrow="Shop by brand"
            id="brands-heading"
            title="The brands people come in asking for"
            lead="Tap any brand to start a WhatsApp enquiry. This is the list of brands we are asked about most — it is not a stock list, so we will confirm what is in store when you message."
          />

          <div className="mt-10">
            <BrandGrid />
          </div>

          <Reveal delay={200} className="mt-8">
            <BrandCta />
          </Reveal>
        </div>
      </section>

      {/* 7 — Latest smartphones */}
      <LatestSmartphones />

      {/* 8 — Repairs */}
      <section className="bg-ink-950" aria-labelledby="repairs-heading">
        <div className="shell py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Our services"
                id="repairs-heading"
                tone="light"
                title="Mobile repair services"
                lead="We are a dedicated mobile phone repair shop. Bring the phone in and the fault is checked at the counter before anything goes ahead."
              />

              <Reveal delay={200} className="mt-8 flex flex-wrap gap-3">
                <Button
                  href={waLink(waMessages.repairs())}
                  external
                  variant="wa"
                  size="lg"
                  icon="whatsapp"
                >
                  WhatsApp your problem
                </Button>
                <Button href={business.phoneTel} variant="onDark" size="lg" icon="phone">
                  Call {business.phoneDisplay}
                </Button>
              </Reveal>

              <Reveal delay={240} className="mt-8">
                <Link
                  to="/repairs"
                  className="group/link inline-flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-accent-400 transition-colors hover:text-accent-200"
                >
                  See repair services
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                  />
                </Link>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal>
                <Photo
                  photo={photos.counterService}
                  aspect="16 / 9"
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  rounded="rounded-[var(--radius-lg)]"
                  className="bg-ink-900"
                />
                <p className="mt-3 text-[0.75rem] text-ink-500">
                  {photos.counterService.caption} — customer service at the
                  SmartphoneCafe counter
                </p>
              </Reveal>

              <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
                {repairIssues.slice(0, 8).map((issue, i) => (
                  <li key={issue.id}>
                    <Reveal delay={i * 40}>
                      <Link
                        to="/repairs"
                        className="group/rep flex items-center gap-3 border-t border-white/10 py-3.5 transition-colors"
                      >
                        <Icon
                          name={issue.icon}
                          size={17}
                          className="shrink-0 text-accent-400"
                        />
                        <span className="min-w-0 flex-1 font-display text-[0.9375rem] font-semibold tracking-[-0.015em] text-white">
                          {issue.title}
                        </span>
                        <Icon
                          name="arrowRight"
                          size={15}
                          className="shrink-0 text-ink-600 transition-transform duration-200 group-hover/rep:translate-x-0.5"
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

      {/* 9 — Accessories */}
      <section
        className="bg-paper-soft"
        id="accessories"
        aria-labelledby="accessories-heading"
        style={{ scrollMarginTop: "5.5rem" }}
      >
        <div className="shell py-14 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Accessories"
              id="accessories-heading"
              title="Everything you need"
              lead="Covers, screen protection, chargers, earphones and power banks — the everyday items you end up needing the same day."
            />
            <Reveal delay={140} className="shrink-0">
              <Button
                href={waLink(waMessages.accessories())}
                external
                variant="wa"
                size="lg"
                icon="whatsapp"
              >
                Ask what is in stock
              </Button>
            </Reveal>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accessoryCategories.map((a, i) => (
              <li key={a.id} className="h-full">
                <Reveal delay={i * 60} className="h-full">
                  <a
                    href={waLink(waMessages.accessories())}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ask about ${a.title} on WhatsApp`}
                    className="group/acc flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
                  >
                    <AssetImage
                      src={a.image}
                      alt={a.alt}
                      aspect="3 / 2"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/acc:scale-[1.03]"
                      className="bg-paper-mute"
                      fallback={
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#f4f6fb_0%,#e9edf6_100%)]">
                          <Icon name={a.icon} size={40} className="text-accent-600" />
                        </div>
                      }
                    />
                    <div className="flex flex-1 items-center justify-between gap-3 border-t border-line p-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
                          {a.title}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-ink-500">
                          {a.blurb}
                        </p>
                      </div>
                      <Icon
                        name="arrowRight"
                        size={16}
                        className="shrink-0 text-ink-300 transition-transform duration-200 group-hover/acc:translate-x-0.5 group-hover/acc:text-accent-600"
                      />
                    </div>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10 — Gallery */}
      <section className="bg-white" aria-labelledby="gallery-heading">
        <div className="shell py-14 lg:py-20">
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

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[photos.interiorWide, photos.inStoreService, photos.customerService].map(
              (p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <Link to="/gallery" className="group/gal block">
                    <Photo
                      photo={p}
                      aspect="4 / 3"
                      sizes="(min-width: 640px) 33vw, 100vw"
                      rounded="rounded-[var(--radius-lg)]"
                      className="bg-paper-mute"
                      imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/gal:scale-[1.03]"
                    />
                    <span className="mt-3 block text-[0.75rem] text-ink-400">
                      {p.caption}
                    </span>
                  </Link>
                </Reveal>
              )
            )}
          </div>
        </div>
      </section>

      {/* 11 — About */}
      <section className="bg-paper-soft" aria-labelledby="intro-heading">
        <div className="shell py-14 lg:py-20">
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

              <dl className="mt-9 border-t border-line">
                {[
                  { k: "Smartphones", v: "Compare handsets and take one home set up" },
                  { k: "Repairs", v: "Faults assessed at the counter" },
                  { k: "Accessories", v: "Covers, glass, chargers, earphones" },
                ].map((row, i) => (
                  <Reveal key={row.k} delay={180 + i * 50}>
                    <div className="flex flex-col gap-1 border-b border-line py-3.5 sm:flex-row sm:items-baseline sm:gap-6">
                      <dt className="font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950 sm:w-[9.5rem] sm:shrink-0">
                        {row.k}
                      </dt>
                      <dd className="text-[0.9375rem] leading-relaxed text-ink-600">
                        {row.v}
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>

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

              <blockquote className="mt-8 border-l-2 border-accent-600 pl-5">
                <p className="text-[1rem] leading-relaxed text-ink-700 italic">
                  “{business.listingDescription}”
                </p>
                <footer className="mt-3 text-[0.75rem] text-ink-400">
                  — {business.listingName}, description published on their Google
                  Business Profile
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 12 — Store + Map */}
      <LocationSection />

      {/* Closing conversion band, then 13 — Footer (in Layout) */}
      <CtaBand />
    </>
  );
}
