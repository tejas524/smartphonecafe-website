import { useState } from "react";
import PageHero from "../components/sections/PageHero.jsx";
import RepairEnquiryForm from "../components/sections/RepairEnquiryForm.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { business } from "../data/site.js";
import { brands } from "../data/brands.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Contact page.
 *
 * Two enquiry paths, side by side and equally prominent: a smartphone question
 * and a repair question. Both are one tap from the top of the page.
 */

const contactMethods = [
  {
    key: "whatsapp",
    icon: "whatsapp",
    title: "WhatsApp",
    value: business.phoneDisplay,
    note: "Fastest route. Send a message any time — we reply during shop hours.",
    href: () => waLink(waMessages.general()),
    external: true,
    accent: "wa",
  },
  {
    key: "call",
    icon: "phone",
    title: "Call the shop",
    value: business.phoneDisplay,
    note: "Talk to someone directly between 10:00 am and 9:30 pm, every day.",
    href: () => business.phoneTel,
    external: false,
    accent: "ink",
  },
  {
    key: "visit",
    icon: "mapPin",
    title: "Visit in person",
    value: "Talegaon Station Road",
    note: `${business.address.line1}, ${business.address.line2}.`,
    href: () => business.google.shortUrl,
    external: true,
    accent: "ink",
  },
];

/** Quick smartphone enquiry — a brand picker that jumps straight to WhatsApp. */
function SmartphoneEnquiry() {
  const [selected, setSelected] = useState("");

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-ink-950 text-white">
          <Icon name="smartphone" size={18} />
        </span>
        <div>
          <h2 className="font-display text-[1.25rem] font-bold text-ink-950">
            Smartphone enquiry
          </h2>
          <p className="mt-0.5 text-[0.875rem] text-ink-500">
            Pick a brand to open WhatsApp with the message ready.
          </p>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">Choose a brand</legend>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => {
            const active = selected === b.name;
            return (
              <label
                key={b.name}
                className={`cursor-pointer rounded-full border px-3.5 py-2 font-display text-[0.8125rem] font-semibold transition-colors duration-200 ${
                  active
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-line-strong bg-white text-ink-700 hover:border-ink-400 hover:text-ink-950"
                }`}
              >
                <input
                  type="radio"
                  name="contact-brand"
                  value={b.name}
                  checked={active}
                  onChange={() => setSelected(b.name)}
                  className="sr-only"
                />
                {b.name}
              </label>
            );
          })}
          <label
            className={`cursor-pointer rounded-full border px-3.5 py-2 font-display text-[0.8125rem] font-semibold transition-colors duration-200 ${
              selected === "any"
                ? "border-ink-950 bg-ink-950 text-white"
                : "border-line-strong bg-white text-ink-700 hover:border-ink-400 hover:text-ink-950"
            }`}
          >
            <input
              type="radio"
              name="contact-brand"
              value="any"
              checked={selected === "any"}
              onChange={() => setSelected("any")}
              className="sr-only"
            />
            Not sure yet
          </label>
        </div>
      </fieldset>

      <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-paper-soft p-4">
        <p className="font-display text-[0.75rem] font-bold uppercase tracking-wider text-ink-400">
          Your message will say
        </p>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-700 italic">
          “
          {selected && selected !== "any"
            ? `Hello ${business.name}, I am looking for a ${selected} smartphone. Could you please share the available options?`
            : selected === "any"
              ? `Hello ${business.name}, I am looking for a smartphone. Please let me know the available options.`
              : "Choose a brand above to see the message."}
          ”
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Button
          href={waLink(
            selected && selected !== "any"
              ? waMessages.brand(selected)
              : waMessages.smartphones()
          )}
          external
          variant="wa"
          size="lg"
          icon="whatsapp"
          className="sm:flex-1"
        >
          Send on WhatsApp
        </Button>
        <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
          Call instead
        </Button>
      </div>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-500">
        Availability and pricing are confirmed in store or on WhatsApp. We do not
        publish a live stock list.
      </p>
    </div>
  );
}

export default function Contact() {
  usePageMeta({
    title: "Contact",
    description:
      "Contact SmartphoneCafe in Talegaon Dabhade — call or WhatsApp +91 99225 99577, visit Shop No. 7, Samrthchaya Apartment, Talegaon Station Road, or send a repair enquiry. Open 10 am – 9:30 pm daily.",
    path: "/contact",
  });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch or just walk in."
        lead="Call, message on WhatsApp or come to the counter on Talegaon Station Road. Open every day from 10:00 am to 9:30 pm."
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
          <Button href={business.phoneTel} variant="primary" size="lg" icon="phone">
            Call {business.phoneDisplay}
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
        </div>
      </PageHero>

      {/* ======================================================== methods */}
      <section className="bg-white" aria-labelledby="methods-heading">
        <div className="shell py-14 lg:py-16">
          <h2 id="methods-heading" className="sr-only">
            Ways to contact SmartphoneCafe
          </h2>

          <ul className="grid gap-4 lg:grid-cols-3">
            {contactMethods.map((m, i) => (
              <li key={m.key}>
                <Reveal delay={i * 70} className="h-full">
                  <a
                    href={m.href()}
                    {...(m.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group/m flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-white p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
                  >
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-[12px] ${
                        m.accent === "wa"
                          ? "bg-wa-600 text-white"
                          : "bg-ink-950 text-white"
                      }`}
                    >
                      <Icon name={m.icon} size={19} />
                    </span>

                    <h3 className="mt-5 font-display text-[0.75rem] font-bold uppercase tracking-wider text-ink-400">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink-950">
                      {m.value}
                    </p>
                    <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-600">
                      {m.note}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-semibold text-accent-600">
                      Open
                      <Icon
                        name="arrowUpRight"
                        size={14}
                        className="transition-transform duration-200 group-hover/m:-translate-y-0.5 group-hover/m:translate-x-0.5"
                      />
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ====================================================== enquiries */}
      <section className="border-y border-line bg-paper-soft" aria-labelledby="enquiries-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="Send an enquiry"
            id="enquiries-heading"
            title="Two ways in — buying or repairing"
            lead="Pick whichever matches what you need. Both routes open WhatsApp with your details already written out."
          />

          <div className="mt-11 grid gap-6 lg:grid-cols-2">
            <Reveal delay={80}>
              <SmartphoneEnquiry />
            </Reveal>

            <Reveal delay={160}>
              <RepairEnquiryForm compact />
            </Reveal>
          </div>
        </div>
      </section>

      <LocationSection />

      {/* ========================================================= hours */}
      <section className="border-t border-line bg-white" aria-labelledby="hours-heading">
        <div className="shell py-14 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Opening hours"
                id="hours-heading"
                title="Open every day of the week"
                lead="The same hours run seven days a week — there is no early-closing day to remember."
                size="sm"
              />
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={120}>
                <dl className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day, i) => (
                    <div
                      key={day}
                      className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                        i % 2 === 0 ? "bg-white" : "bg-paper-soft"
                      }`}
                    >
                      <dt className="font-display text-[0.875rem] font-semibold text-ink-800">
                        {day}
                      </dt>
                      <dd className="tabular-nums text-[0.875rem] text-ink-600">
                        {business.hours.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={180}>
                <p className="mt-4 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
                  <Icon name="info" size={15} className="mt-0.5 shrink-0" />
                  <span>
                    Hours are as published on our Google Business Profile. If you
                    are travelling a distance, a quick call ahead is always worth
                    it.
                  </span>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}