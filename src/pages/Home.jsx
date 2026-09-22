import { Link } from "react-router-dom";
import Hero from "../components/sections/Hero.jsx";
import BrandGrid, { BrandCta } from "../components/sections/BrandGrid.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import { business } from "../data/site.js";
import { smartphoneCategories } from "../data/brands.js";
import { repairIssues } from "../data/repairs.js";
import { accessoryCategories } from "../data/accessories.js";
import { photos } from "../data/photos.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Homepage.
 *
 * Editorial / local-retail layout: real photography carries the page, type
 * does the explaining, and UI chrome is kept to hairlines instead of cards,
 * borders, gradients and glass panels.
 *
 * IMAGE CURATION (every assignment below is evidence-based)
 *  hero      → interior              In-store display signage legible (OPPO,
 *                                    vivo, Samsung Galaxy A14 5G). Sharpest,
 *                                    most detailed frame in the set.
 *  about     → ownerWithCustomer     Owner and customer at the counter.
 *  phones    → products              Promotional boards for OPPO/vivo models.
 *  repairs   → counterService        Service happening at the counter — the
 *                                    only supplied frame of counter service.
 *                                    Caption states the counter, NOT a repair
 *                                    bench, because no repair photo exists.
 *  gallery   → three strongest wide frames.
 * No photograph is captioned as showing something the pixels do not support.
 */

export default function Home() {
  usePageMeta({
    title: null, // Home uses the full default title from index.html
    description:
      "SmartphoneCafe is a mobile phone store and repair shop on Talegaon Station Road, Talegaon Dabhade. Browse smartphones, pick up accessories and get your phone repaired. Open 10 am – 9:30 pm daily.",
    path: "/",
  });

  return (
    <>
      <Hero />

      {/* =========================================================== about */}
      <section className="bg-white" aria-labelledby="intro-heading">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Who we are"
                title="A phone shop you can walk into"
                as="h2"
                id="intro-heading"
              />

              <Reveal
                delay={140}
                className="mt-6 text-[1.0625rem] leading-relaxed text-ink-600"
              >
                <p>
                  {business.name} sells smartphones and repairs them. The store
                  is on Talegaon Station Road near Umang Medical — an easy stop
                  whether you are buying a new handset, replacing a cracked
                  screen or picking up a charger on the way home.
                </p>
              </Reveal>

              {/* What you can do here — typographic, no cards. */}
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

              <Reveal delay={330} className="mt-8">
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

      {/* ====================================================== smartphones */}
      <section className="bg-paper-soft" aria-labelledby="phones-heading">
        <div className="shell py-16 lg:py-24">
          <SectionHeading
            eyebrow="Smartphones"
            id="phones-heading"
            title="Find the right phone, not just any phone"
            lead="Tell us your budget and how you use your phone. We will show you what fits — and what is actually available today."
          />

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal delay={100} className="lg:col-span-6">
              <Photo
                photo={photos.products}
                aspect="4 / 3"
                sizes="(min-width: 1024px) 48vw, 100vw"
                rounded="rounded-[var(--radius-lg)]"
                className="bg-white"
              />
              <p className="mt-3 text-[0.75rem] text-ink-400">
                {photos.products.caption} — handset model boards and easy-EMI
                offers posted in store
              </p>
            </Reveal>

            <div className="lg:col-span-6">
              <ul className="border-t border-line">
                {smartphoneCategories.map((c, i) => (
                  <li key={c.id}>
                    <Reveal delay={i * 60}>
                      <Link
                        to="/smartphones"
                        className="group/row flex items-start gap-5 border-b border-line py-5 transition-colors hover:bg-white"
                      >
                        <span className="mt-0.5 font-display text-[0.75rem] font-bold tabular-nums text-ink-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink-950">
                            {c.title}
                          </span>
                          <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-ink-600">
                            {c.blurb}
                          </span>
                        </span>
                        <Icon
                          name="arrowRight"
                          size={17}
                          className="mt-1 shrink-0 text-ink-300 transition-transform duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-accent-600"
                        />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>

              <Reveal delay={280} className="mt-8">
                <Button to="/smartphones" variant="primary" size="lg" iconRight="arrowRight">
                  Browse smartphones
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== repairs */}
      <section className="bg-ink-950" aria-labelledby="repairs-heading">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Repairs"
                id="repairs-heading"
                tone="light"
                title="Something wrong with your phone?"
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

      {/* =========================================================== brands */}
      <section className="bg-white" aria-labelledby="brands-heading">
        <div className="shell py-16 lg:py-24">
          <SectionHeading
            eyebrow="Brands"
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

      {/* ====================================================== accessories */}
      <section className="bg-paper-soft" aria-labelledby="accessories-heading">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Accessories"
                id="accessories-heading"
                title="The small things that keep a phone usable"
                lead="Covers, screen protection, chargers, earphones and power banks — the everyday items you end up needing the same day."
              />

              <Reveal delay={200} className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  href={waLink(waMessages.accessories())}
                  external
                  variant="wa"
                  size="lg"
                  icon="whatsapp"
                >
                  Ask what is in stock
                </Button>
                <p className="max-w-[24ch] text-[0.8125rem] leading-snug text-ink-500">
                  Accessory stock changes often — message us and we will check.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
                {accessoryCategories.map((a, i) => (
                  <li key={a.id}>
                    <Reveal delay={i * 45}>
                      <div className="flex items-start gap-3.5 border-b border-line py-4">
                        <Icon
                          name={a.icon}
                          size={17}
                          className="mt-0.5 shrink-0 text-accent-600"
                        />
                        <div className="min-w-0">
                          <h3 className="font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
                            {a.title}
                          </h3>
                          <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-600">
                            {a.blurb}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= gallery */}
      <section className="bg-white" aria-labelledby="gallery-heading">
        <div className="shell py-16 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Gallery"
              id="gallery-heading"
              title="A look inside the store"
              lead="Real photographs of SmartphoneCafe — the counter, the displays and the people behind it. Photographed in the shop, not borrowed from a stock library."
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

      {/* ======================================================== location */}
      <LocationSection />

      {/* ==================================================== google profile */}
      <section className="border-t border-line bg-paper-soft">
        <div className="shell py-14 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal as="p" className="eyebrow text-accent-600">
                On Google
              </Reveal>
              <Reveal as="h2" delay={60} className="mt-4 text-[1.625rem] sm:text-[2rem]">
                See SmartphoneCafe on Google
              </Reveal>
              <Reveal
                as="p"
                delay={120}
                className="mt-4 max-w-xl text-[1rem] leading-relaxed text-ink-600"
              >
                Our Google Business Profile carries the store&apos;s photos,
                customer reviews and live opening status. We do not reproduce
                ratings or review text here — check the profile directly for the
                current picture.
              </Reveal>

              <Reveal delay={180} className="mt-7 flex flex-wrap gap-2.5">
                <Button
                  href={business.google.shortUrl}
                  external
                  variant="primary"
                  size="lg"
                  icon="google"
                >
                  View on Google
                </Button>
                <Button
                  href={business.google.shortUrl}
                  external
                  variant="outline"
                  size="lg"
                  icon="navigation"
                >
                  Get Directions
                </Button>
              </Reveal>
            </div>

            <Reveal delay={200} className="lg:col-span-5">
              <dl className="border-t border-line">
                {[
                  { k: "Listed as", v: business.listingName },
                  {
                    k: "Categories",
                    v: "Mobile phone repair shop · Cell phone store · Accessory store",
                  },
                  { k: "Plus code", v: business.google.plusCode },
                  { k: "Place ID", v: business.google.placeId },
                ].map((row) => (
                  <div key={row.k} className="flex gap-4 border-b border-line py-3.5">
                    <dt className="w-[5.5rem] shrink-0 text-[0.75rem] font-semibold uppercase tracking-wider text-ink-400">
                      {row.k}
                    </dt>
                    {/*
                      min-w-0 + overflow-wrap:anywhere lets this cell shrink below
                      its min-content width. The Place ID is a single 27-character
                      token with no break opportunity, which would otherwise force
                      the whole page wider than a 320px viewport.
                    */}
                    <dd className="min-w-0 text-[0.875rem] leading-snug text-ink-700 [overflow-wrap:anywhere]">
                      {row.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}