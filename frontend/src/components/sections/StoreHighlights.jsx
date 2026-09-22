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
        <ul className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {trustFeatures.map((f, i) => (
            <li key={f.id} className="bg-white px-1 py-7 sm:px-6 lg:py-9 lg:first:pl-0">
              <Reveal delay={i * 60}>
                <p className="font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950 sm:text-[1rem]">
                  {f.title}
                </p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-500">
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
