import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { trustFeatures } from "../../data/offers.js";

/**
 * Trust / features strip.
 *
 * A quiet band of four verified reasons to walk in — hours, on-site repairs,
 * the one-stop range, and in-store EMI. Every claim is evidence-backed (see
 * data/offers.js); there is no rating, review count, "No. 1" or years-in-
 * business language anywhere. It sits directly under the hero, exactly where
 * the prototype places its trust row.
 */
export default function TrustBar() {
  return (
    <section
      className="border-y border-line bg-paper-soft"
      aria-label="Why customers visit the store"
    >
      <div className="shell py-8 lg:py-10">
        <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map((f, i) => (
            <li key={f.id}>
              <Reveal delay={i * 60}>
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-white text-accent-600 shadow-[var(--shadow-card)]">
                    <Icon name={f.icon} size={19} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">
                      {f.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
