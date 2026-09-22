import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { business } from "../../data/site.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Closing conversion band. One message, three equally-weighted ways to act —
 * WhatsApp, call, or walk in.
 */
export default function CtaBand({
  eyebrow = "Ready when you are",
  title = "Message the store and get an answer today.",
  body = "Ask about a phone, check a price or describe a fault. We reply on WhatsApp during shop hours, every day of the week.",
  message,
}) {
  return (
    <section className="bg-ink-950">
      <div className="shell py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal as="p" className="eyebrow text-accent-400">
              {eyebrow}
            </Reveal>

            <Reveal
              as="h2"
              delay={60}
              className="mt-4 max-w-xl text-[1.75rem] text-white sm:text-[2.125rem] lg:text-[2.5rem]"
            >
              {title}
            </Reveal>

            <Reveal
              as="p"
              delay={120}
              className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-ink-400"
            >
              {body}
            </Reveal>

            <Reveal
              delay={180}
              className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-ink-400"
            >
              <span className="flex items-center gap-2">
                <Icon name="clock" size={14} className="text-ink-600" />
                Open daily {business.hours.label}
              </span>
              <span className="flex items-center gap-2">
                <Icon name="mapPin" size={14} className="text-ink-600" />
                Talegaon Station Rd
              </span>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={140} className="flex flex-col gap-2.5">
              <Button
                href={waLink(message || waMessages.general())}
                external
                variant="wa"
                size="lg"
                icon="whatsapp"
                full
              >
                WhatsApp Us
              </Button>

              <Button
                href={business.phoneTel}
                variant="onDark"
                size="lg"
                icon="phone"
                full
              >
                Call {business.phoneDisplay}
              </Button>

              <Button
                href={business.google.shortUrl}
                external
                variant="onDark"
                size="lg"
                icon="navigation"
                full
              >
                Get Directions
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}