import Icon from "../Icon.jsx";
import { business } from "../../data/site.js";

/**
 * Slim utility strip that sits above the main navigation, mirroring the
 * prototype's top bar.
 *
 * Left:  the shop's three-word promise (Smartphones · Repairs · Accessories).
 * Right: phone and daily hours — the two facts a walk-in customer wants first.
 *
 * It is part of the normal document flow (not sticky), so it scrolls away and
 * hands the top of the viewport to the sticky navigation beneath it. On the
 * narrowest screens the right-hand details drop away and the promise stays
 * centred, so nothing is ever clipped at 320px.
 */
export default function TopBar() {
  return (
    <div className="bg-ink-950 text-ink-300">
      <div className="shell flex h-9 items-center justify-center gap-4 sm:justify-between">
        {/* The promise — always visible */}
        <p className="flex items-center gap-2 font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-ink-200">
          <span>Smartphones</span>
          <span aria-hidden="true" className="text-accent-400">
            ·
          </span>
          <span>Repairs</span>
          <span aria-hidden="true" className="text-accent-400">
            ·
          </span>
          <span>Accessories</span>
        </p>

        {/* Contact facts — hidden on the smallest screens to avoid crowding */}
        <div className="hidden items-center gap-5 sm:flex">
          <a
            href={business.phoneTel}
            className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-300 transition-colors hover:text-white"
          >
            <Icon name="phone" size={13} className="text-ink-500" />
            <span className="tabular-nums">{business.phoneDisplay}</span>
          </a>
          <span aria-hidden="true" className="h-3.5 w-px bg-white/15" />
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-ink-400">
            <Icon name="clock" size={13} className="text-ink-500" />
            <span>Open daily · {business.hours.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
