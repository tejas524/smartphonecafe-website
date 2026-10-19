import Reveal from "../ui/Reveal.jsx";
import { trustFeatures } from "../../data/offers.js";

/**
 * Store highlights — a quiet horizontal strip, not floating cards.
 *
 * Four verified reasons to walk in, separated by subtle hairline dividers
 * (a 1px grid gap over a line-coloured backing). No icons, no pills, no
 * shadows — just typography. Every claim is evidence-backed (see
 * data/offers.js): no rating, review count, years-in-business or "No. 1".
 */
export default function StoreHighlights() {
  return (
    <section
      className="border-b border-line bg-white"
      aria-label="Store highlights"
    >
      <div className="shell">
        <ul className="divide-y divide-line lg:grid lg:grid-cols-4 lg:gap-px lg:divide-y-0 lg:bg-line">
          {trustFeatures.map((f, i) => (
            <li key={f.id} className="bg-white py-5 lg:px-6 lg:py-9 lg:first:pl-0">
              <Reveal delay={i * 60}>
                <p className="font-display text-[1rem] font-bold tracking-[-0.015em] text-ink-950 lg:text-[1rem]">
                  {f.title}
                </p>
                <p className="mt-1.5 text-[0.9375rem] leading-[1.5] text-ink-500 lg:text-[0.875rem] lg:leading-relaxed">
                  {f.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
