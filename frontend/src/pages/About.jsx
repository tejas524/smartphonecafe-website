import { Link } from "react-router-dom";
import PageHero from "../components/sections/PageHero.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import { business, serviceAreas } from "../data/site.js";
import { inStoreServices } from "../data/accessories.js";
import { photos } from "../data/photos.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Everything asserted on this page is traceable to either the brief or the
 * public Google listing. There are deliberately no claims about years in
 * business, number of repairs, "authorised" status, warranties or rankings —
 * none of those could be verified.
 */

const verifiedFacts = [
  {
    icon: "store",
    label: "Listed categories",
    value: "Mobile phone repair shop · Cell phone store · Cell phone accessory store",
  },
  {
    icon: "chip",
    label: "Also listed as",
    value: "Phone repair service · Data recovery service",
  },
  {
    icon: "clock",
    label: "Opening hours",
    value: `${business.hours.label}, ${business.hours.days.toLowerCase()}`,
  },
  {
    icon: "mapPin",
    label: "Location",
    value: `${business.address.line2}, ${business.address.region} ${business.address.postalCode}`,
  },
];

export default function About() {
  usePageMeta({
    title: "About",
    description:
      "SmartphoneCafe is a mobile phone store and repair shop on Talegaon Station Road, Talegaon Dabhade. Learn what the store offers, where to find it and how to get in touch.",
    path: "/about",
  });

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A neighbourhood phone shop, run the straightforward way."
        lead="SmartphoneCafe sells smartphones, repairs them and stocks the accessories that keep them going — all from one counter on Talegaon Station Road."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button
            href={waLink(waMessages.general())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            WhatsApp Us
          </Button>
          <Button
            href={business.google.shortUrl}
            external
            variant="outline"
            size="lg"
            icon="google"
          >
            View on Google
          </Button>
        </div>
      </PageHero>

      {/* =========================================================== story */}
      <section className="bg-white" aria-labelledby="story-heading">
        <div className="shell py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="What we do"
                id="story-heading"
                title="Sales, repairs and accessories in one place"
                lead="Most people arrive with one of three things on their mind: a phone to buy, a phone to fix, or an accessory they need today. All three are handled at the same counter."
              />

              <div className="mt-9 space-y-5 text-[1rem] leading-relaxed text-ink-600 sm:text-[1.0625rem]">
                <Reveal as="p" delay={160}>
                  If you are buying, the useful part is the conversation rather
                  than a spec sheet. Tell us what you use your phone for and what
                  you want to spend, and you will be pointed at the handsets that
                  genuinely fit — including whether your current phone is worth
                  exchanging against the new one.
                </Reveal>

                <Reveal as="p" delay={200}>
                  If you are repairing, the shop is set up for it. SmartphoneCafe
                  is listed as a mobile phone repair shop first and a phone store
                  second, so faults are looked at on site rather than posted
                  away somewhere. Screens, batteries, charging ports, software
                  faults, liquid damage, cameras, speakers and data recovery are
                  all things customers bring in.
                </Reveal>

                <Reveal as="p" delay={240}>
                  And if it is an accessory — a cover, tempered glass, a charger,
                  earphones or a power bank — you can usually walk out with it the
                  same day instead of waiting on a delivery.
                </Reveal>
              </div>

              <Reveal delay={300}>
                <blockquote className="mt-9 rounded-[var(--radius-lg)] border border-line bg-paper-soft p-6">
                  <p className="text-[0.9375rem] leading-relaxed italic text-ink-700">
                    “{business.listingDescription}”
                  </p>
                  <footer className="mt-4 flex items-center gap-2 text-[0.75rem] text-ink-400">
                    <Icon name="google" size={13} />
                    Published by {business.listingName} on their Google Business
                    Profile
                  </footer>
                </blockquote>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <Photo
                  photo={photos.storefront}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="shadow-[var(--shadow-card)]"
                />
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-2.5 text-[0.75rem] leading-relaxed text-ink-500">
                  {photos.storefront.caption} — the exterior photo supplied is
                  lower resolution, so it is shown at a modest size.
                </p>
              </Reveal>

              <Reveal delay={200} className="mt-4">
                <Photo
                  photo={photos.interiorWide}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="shadow-[var(--shadow-card)]"
                />
              </Reveal>

              <Reveal delay={240} className="mt-4">
                <Photo
                  photo={photos.ownerWithCustomer}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="shadow-[var(--shadow-card)]"
                />
              </Reveal>

              <Reveal delay={280} className="mt-5">
                <div className="rounded-[var(--radius-lg)] border border-line bg-paper-soft p-5">
                  <p className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-600">
                    <Icon name="checkCircle" size={15} className="mt-0.5 shrink-0 text-accent-600" />
                    <span>
                      Real photographs of the store. See the{" "}
                      <Link
                        to="/gallery"
                        className="font-semibold text-accent-600 underline decoration-accent-200 underline-offset-2 hover:text-accent-700"
                      >
                        gallery
                      </Link>{" "}
                      for the rest.
                    </span>
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== verified */}
      <section className="border-y border-line bg-paper-soft" aria-labelledby="facts-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="Straight facts"
            id="facts-heading"
            title="What we can state, and nothing more"
            lead="A lot of local business websites claim things they cannot back up. Everything below is taken directly from our Google Business Profile — if it is not here, we have not claimed it."
          />

          <dl className="mt-11 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2">
            {verifiedFacts.map((f, i) => (
              <div key={f.label} className="bg-white">
                <Reveal delay={i * 55} className="h-full">
                  <div className="flex h-full gap-4 p-5 sm:p-6">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-accent-50 text-accent-600">
                      <Icon name={f.icon} size={18} />
                    </span>
                    <div>
                      <dt className="font-display text-[0.75rem] font-bold uppercase tracking-wider text-ink-400">
                        {f.label}
                      </dt>
                      <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-800">
                        {f.value}
                      </dd>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </dl>

          <Reveal delay={240}>
            <p className="mt-6 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-white p-4 text-[0.8125rem] leading-relaxed text-ink-600">
              <Icon name="info" size={15} className="mt-0.5 shrink-0 text-ink-400" />
              <span>
                We have not published ratings, review counts or testimonials on
                this site, and we do not state authorised-dealer status for any
                brand. Those details change, and a static page is a poor place to
                keep them honest — check our Google profile for the current
                picture.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ====================================================== services */}
      <section className="bg-white" aria-labelledby="services-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="In store"
            id="services-heading"
            title="What you can get done at the counter"
            lead="Beyond selling handsets, these are the everyday jobs the shop takes on."
          />

          <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inStoreServices.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={i * 55} className="h-full">
                  <div className="flex h-full gap-4 rounded-[var(--radius-lg)] border border-line bg-paper-soft p-5">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-ink-950 text-white">
                      <Icon name={s.icon} size={18} />
                    </span>
                    <div>
                      <h3 className="font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-600">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================================================== areas served */}
      <section className="border-t border-line bg-paper-soft" aria-labelledby="areas-heading">
        <div className="shell py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Where our customers come from"
                id="areas-heading"
                title="Serving Talegaon Dabhade and nearby"
                lead="The store sits on the main Station Road stretch, which makes it a convenient stop for the surrounding towns and villages as well."
              />
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={120}>
                <ul className="flex flex-wrap gap-2">
                  {serviceAreas.map((area) => (
                    <li
                      key={area}
                      className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.875rem] text-ink-700"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={180}>
                <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-600">
                  Not on the list? You are still welcome. If you can reach
                  Talegaon Station Road, you can reach us — and if you are unsure
                  whether we can help with something specific, message us first
                  and we will tell you honestly.
                </p>
              </Reveal>

              <Reveal delay={240} className="mt-7">
                <Button
                  href={waLink(waMessages.directions())}
                  external
                  variant="wa"
                  size="lg"
                  icon="whatsapp"
                >
                  Ask us for directions
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <LocationSection />

      <CtaBand />
    </>
  );
}