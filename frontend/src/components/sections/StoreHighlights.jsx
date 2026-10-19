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
        <ul className="grid grid-cols-1 gap-px bg-line min-[360px]:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map((f, i) => (
            <li key={f.id} className="bg-white px-3 py-5 sm:px-5 lg:px-6 lg:py-7">
              <Reveal delay={i * 60}>
                <p className="font-display text-[0.875rem] font-bold leading-snug tracking-[-0.015em] text-ink-950 lg:text-[1rem]">
                  {f.title}
                </p>
                <p className="mt-1.5 max-w-[32ch] text-[0.8125rem] leading-relaxed text-ink-500 lg:text-[0.875rem]">
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
