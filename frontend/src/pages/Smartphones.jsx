import { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/sections/PageHero.jsx";
import BrandGrid from "../components/sections/BrandGrid.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { photos } from "../data/photos.js";
import { smartphoneCategories, budgetBands } from "../data/brands.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/** What we ask for so the shop can answer in one reply. */
const enquiryChecklist = [
  "The brand you have in mind",
  "Your budget range",
  "What matters most — camera, battery or display",
  "Whether you want to exchange your current phone",
];

export default function Smartphones() {
  const { business } = useSiteData();

  usePageMeta({
    title: "Smartphones",
    description:
      "Browse smartphones by brand and budget at SmartphoneCafe, Talegaon Dabhade. Apple, Samsung, Motorola, Redmi, Realme, Vivo, OPPO, POCO, Tecno and Lava. Check availability on WhatsApp or visit the store on Talegaon Station Road.",
    path: "/smartphones",
  });

  const [band, setBand] = useState(null);

  return (
    <>
      <PageHero
        eyebrow="Smartphones"
        title="Every budget. Every brand people ask for."
        lead="We do not publish a fake price list. Tell us what you need and we will tell you what is actually on the shelf today — with the price, in one message."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button
            href={waLink(waMessages.smartphones())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            Check Availability
          </Button>
          <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
            Call {business.phoneDisplay}
          </Button>
        </div>
      </PageHero>

      {/* ========================================================== notice */}
      <section className="border-b border-line bg-white">
        <div className="shell py-8">
          <Reveal className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-line bg-paper-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3.5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-white text-accent-600 shadow-[var(--shadow-card)]">
                <Icon name="info" size={18} />
              </span>
              <div>
                <p className="font-display text-[0.9375rem] font-bold text-ink-950">
                  Why you will not see prices or model lists here
                </p>
                <p className="mt-1 max-w-2xl text-[0.875rem] leading-relaxed text-ink-600">
                  Stock and pricing at a local store change daily. Rather than
                  publish figures we cannot keep accurate, we confirm the exact
                  model, variant and price when you ask.
                </p>
              </div>
            </div>
            <Button
              href={waLink(waMessages.availability())}
              external
              variant="primary"
              size="md"
              icon="whatsapp"
              className="shrink-0"
            >
              Ask now
            </Button>
          </Reveal>
        </div>
      </section>

      {/* =========================================================== brands */}
      <section className="bg-white" aria-labelledby="brands-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="Shop by brand"
            id="brands-heading"
            title="Start with the brand you already trust"
            lead="Tap a brand to open WhatsApp with the enquiry already written. We will reply with the models currently available."
          />

          <div className="mt-11">
            <BrandGrid />
          </div>

          <Reveal delay={180} className="mt-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                href={waLink(waMessages.smartphones())}
                external
                variant="wa"
                size="lg"
                icon="whatsapp"
              >
                Check availability on WhatsApp
              </Button>
              <p className="text-[0.8125rem] text-ink-500">
                Not sure which brand? Just describe what you need.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================== budgets */}
      <section className="border-y border-line bg-paper-soft" aria-labelledby="budget-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="Shop by budget"
            id="budget-heading"
            title="Pick a range and we will do the shortlisting"
            lead="Budget is usually the fastest way to narrow things down. Choose a band to send a matching enquiry."
          />

          <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {budgetBands.map((b, i) => {
              const active = band === b.id;
              return (
                <li key={b.id}>
                  <Reveal delay={i * 60} className="h-full">
                    <a
                      href={waLink(waMessages.budget(b.range))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setBand(b.id)}
                      onFocus={() => setBand(b.id)}
                      onMouseLeave={() => setBand(null)}
                      onBlur={() => setBand(null)}
                      className={`flex h-full flex-col rounded-[var(--radius-lg)] border bg-white p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${
                        active ? "border-accent-400" : "border-line"
                      }`}
                    >
                      <span className="eyebrow text-ink-400">{b.label}</span>
                      <p className="mt-3 font-display text-[1.375rem] font-extrabold tracking-[-0.035em] text-ink-950">
                        {b.range}
                      </p>
                      <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-600">
                        {b.blurb}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-semibold text-accent-600">
                        Enquire for this range
                        <Icon name="arrowUpRight" size={14} />
                      </span>
                    </a>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ======================================================= categories */}
      <section className="bg-white" aria-labelledby="cats-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="How we help"
            id="cats-heading"
            title="Buying a phone, the way it should work"
            lead="A short conversation beats an endless spec sheet. Here is what we do for every customer who walks in."
          />

          <ul className="mt-11 grid gap-4 sm:grid-cols-2">
            {smartphoneCategories.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={i * 60} className="h-full">
                  <div className="flex h-full gap-5 rounded-[var(--radius-lg)] border border-line bg-paper-soft p-5 transition-colors duration-200 hover:bg-white sm:p-6">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-ink-950 text-white">
                      <Icon
                        name={
                          c.id === "new"
                            ? "smartphone"
                            : c.id === "5g"
                              ? "chip"
                              : c.id === "exchange"
                                ? "swap"
                                : "rupee"
                        }
                        size={19}
                      />
                    </span>
                    <div>
                      <h3 className="font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-ink-950">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">
                        {c.blurb}
                      </p>
                      <ul className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5">
                        {c.points.map((p) => (
                          <li
                            key={p}
                            className="flex items-center gap-1.5 text-[0.8125rem] text-ink-500"
                          >
                            <Icon name="check" size={13} className="text-accent-600" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ======================================================== checklist */}
      <section className="border-y border-line bg-paper-soft" aria-labelledby="checklist-heading">
        <div className="shell py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Before you message"
                id="checklist-heading"
                title="Four things that get you a useful answer faster"
                lead="You do not need all of them — but the more you tell us, the closer the first reply will be."
              />

              <ol className="mt-9 space-y-3">
                {enquiryChecklist.map((item, i) => (
                  <Reveal
                    as="li"
                    key={item}
                    delay={i * 60}
                    className="flex items-center gap-4 rounded-[var(--radius-md)] border border-line bg-white p-4"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 font-display text-[0.8125rem] font-bold text-accent-600">
                      {i + 1}
                    </span>
                    <span className="text-[0.9375rem] text-ink-700">{item}</span>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={280} className="mt-8 flex flex-wrap gap-2.5">
                <Button
                  href={waLink(waMessages.smartphones())}
                  external
                  variant="wa"
                  size="lg"
                  icon="whatsapp"
                >
                  Start a WhatsApp enquiry
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="lg"
                  iconRight="arrowRight"
                >
                  Other ways to reach us
                </Button>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <Photo
                  photo={photos.products}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="shadow-[var(--shadow-card)]"
                />
              </Reveal>

              <Reveal delay={180} className="mt-4">
                <Photo
                  photo={photos.counterService}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="shadow-[var(--shadow-card)]"
                />
              </Reveal>

              <Reveal delay={220}>
                <p className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-white p-4 text-[0.8125rem] leading-relaxed text-ink-600">
                  <Icon name="checkCircle" size={15} className="mt-0.5 shrink-0 text-accent-600" />
                  <span>
                    Real photographs of {business.name}. See the{" "}
                    <Link
                      to="/gallery"
                      className="font-semibold text-accent-600 underline decoration-accent-200 underline-offset-2 hover:text-accent-700"
                    >
                      full gallery
                    </Link>{" "}
                    for more of the store.
                  </span>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <LocationSection />

      <CtaBand
        eyebrow="Found something you like?"
        title="Send us the model name and we will confirm it."
        body="Tell us the phone you are considering. We will check what is in store, what it costs today, and whether your current handset can be exchanged against it."
        message={waMessages.availability()}
      />
    </>
  );
}