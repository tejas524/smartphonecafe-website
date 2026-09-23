import PageHero from "../components/sections/PageHero.jsx";
import { Link } from "react-router-dom";
import RepairEnquiryForm from "../components/sections/RepairEnquiryForm.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Photo from "../components/ui/Photo.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { photos } from "../data/photos.js";
import { repairSteps, repairDisclaimer } from "../data/repairs.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

export default function Repairs() {
  const { business, repairs } = useSiteData();
  const repairIssues = repairs;

  usePageMeta({
    title: "Mobile Repair in Talegaon Dabhade",
    description:
      "Phone repair at SmartphoneCafe, Talegaon Dabhade — screens, batteries, charging faults, software issues, liquid damage, cameras, audio and data recovery. Bring your phone to the store on Talegaon Station Road or send a repair enquiry on WhatsApp.",
    path: "/repairs",
  });

  return (
    <>
      <PageHero
        eyebrow="Repairs"
        title="A phone repair shop, not a phone counter."
        lead="SmartphoneCafe is a dedicated mobile phone repair shop. Bring the device in and the fault is checked at the counter before any work is agreed."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button
            href={waLink(waMessages.repairs())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            WhatsApp Your Problem
          </Button>
          <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
            Call the Shop
          </Button>
        </div>
      </PageHero>

      {/* ========================================================= services */}
      <section className="bg-white" aria-labelledby="issues-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="What we look at"
            id="issues-heading"
            title="Common faults customers bring in"
            lead="These are the problems people walk in with most often. If yours is not listed, describe it anyway — unusual faults are still worth a look."
          />

          <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {repairIssues.map((issue, i) => (
              <li key={issue.id}>
                <Reveal delay={i * 50} className="h-full">
                  <a
                    href={waLink(
                      waMessages.repairDetail({ problem: issue.title })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/issue flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent-50 text-accent-600">
                      <Icon name={issue.icon} size={19} />
                    </span>

                    <h3 className="mt-4 font-display text-[1rem] font-bold leading-snug tracking-[-0.02em] text-ink-950">
                      {issue.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-600">
                      {issue.blurb}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {issue.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-line bg-paper-soft px-2.5 py-1 text-[0.6875rem] font-medium text-ink-500"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>

                    <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.75rem] font-semibold text-accent-600">
                      Ask about this
                      <Icon
                        name="arrowRight"
                        size={13}
                        className="transition-transform duration-200 group-hover/issue:translate-x-0.5"
                      />
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={200}>
            <div className="mt-8 flex items-start gap-3 rounded-[var(--radius-md)] border border-line bg-paper-soft p-4 sm:p-5">
              <Icon name="info" size={16} className="mt-0.5 shrink-0 text-ink-400" />
              <p className="text-[0.8125rem] leading-relaxed text-ink-600">
                <span className="font-semibold text-ink-800">
                  What we cannot tell you from here:
                </span>{" "}
                the exact cost, how long it will take, or whether a repair is
                even possible. That depends entirely on the device and the fault,
                and it can only be judged once the phone is in hand.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================= process */}
      <section className="relative overflow-hidden bg-ink-950" aria-labelledby="process-heading">
        <div className="grid-veil absolute inset-0 opacity-50" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute -right-32 top-0 h-[30rem] w-[30rem] rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(91 140 255 / 0.14), transparent 65%)",
          }}
        />

        <div className="shell relative py-16 lg:py-20">
          <SectionHeading
            eyebrow="How it works"
            id="process-heading"
            tone="light"
            title="Four steps, no surprises"
            lead="No work starts, and no cost is committed, until you have heard what the fault is and agreed to proceed."
          />

          <ol className="mt-11 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {repairSteps.map((s, i) => (
              <li key={s.n} className="bg-ink-950">
                <Reveal delay={i * 70} className="h-full">
                  <div className="flex h-full flex-col p-5 sm:p-6">
                    <span className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] text-accent-400/70">
                      {s.n}
                    </span>
                    <h3 className="mt-4 font-display text-[1rem] font-bold leading-snug tracking-[-0.02em] text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-400">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={280}>
            <p className="mt-7 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
              <Icon name="info" size={15} className="mt-0.5 shrink-0" />
              {repairDisclaimer}
            </p>
          </Reveal>
        </div>
      </section>

      {/* =================================================== form + details */}
      <section className="border-b border-line bg-paper-soft" aria-labelledby="enquiry-heading">
        <div className="shell py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Repair enquiry"
                id="enquiry-heading"
                title="Tell us what is wrong"
                lead="Fill this in and it opens WhatsApp with your details already written out. Nothing is stored on this website — the message only leaves your phone when you press send."
              />

              <div className="mt-9 space-y-3">
                {[
                  {
                    icon: "clock",
                    k: "Turnaround",
                    v: "Confirmed after the phone is seen — it depends on the fault and parts.",
                  },
                  {
                    icon: "rupee",
                    k: "Cost",
                    v: "Quoted at the counter before any work begins.",
                  },
                  {
                    icon: "shield",
                    k: "Your data",
                    v: "Back up anything important before handing over a device.",
                  },
                ].map((row, i) => (
                  <Reveal
                    key={row.k}
                    delay={i * 60}
                    className="flex gap-3.5 rounded-[var(--radius-md)] border border-line bg-white p-4"
                  >
                    <Icon
                      name={row.icon}
                      size={17}
                      className="mt-0.5 shrink-0 text-accent-600"
                    />
                    <div>
                      <p className="font-display text-[0.8125rem] font-bold text-ink-900">
                        {row.k}
                      </p>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-600">
                        {row.v}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={220} className="mt-6">
                <Photo
                  photo={photos.inStoreService}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="shadow-[var(--shadow-card)]"
                />
              </Reveal>

              <Reveal delay={240}>
                <p className="mt-3 flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-ink-500">
                  <Icon name="image" size={13} className="mt-0.5 shrink-0" />
                  <span>
                    A photograph of repair work at the bench is still to be
                    added — see the{" "}
                    <Link
                      to="/gallery"
                      className="font-semibold text-accent-600 underline decoration-accent-200 underline-offset-2 hover:text-accent-700"
                    >
                      gallery
                    </Link>{" "}
                    photo list.
                  </span>
                </p>
              </Reveal>

              <Reveal delay={260} className="mt-6">
                <Button
                  href={business.phoneTel}
                  variant="outline"
                  size="lg"
                  icon="phone"
                  full
                >
                  Prefer to talk? Call {business.phoneDisplay}
                </Button>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={100}>
                <RepairEnquiryForm />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <LocationSection />

      <CtaBand
        eyebrow="Phone not working?"
        title="Message the shop before you travel."
        body="Describe the fault on WhatsApp and we will tell you whether it is worth bringing in — and what to expect when you do."
        message={waMessages.repairs()}
      />
    </>
  );
}