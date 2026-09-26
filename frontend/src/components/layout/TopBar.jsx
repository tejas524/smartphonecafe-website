import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";

/**
 * Slim utility strip above the main navigation.
 *
 * Left:  a Google rating trust chip + the shop's three-word promise.
 * Right: phone and daily hours — the two facts a walk-in customer wants first.
 *
 * Part of the normal document flow (not sticky), so it scrolls away and hands
 * the top of the viewport to the sticky navigation beneath it. On the narrowest
 * screens the secondary details drop away so nothing is clipped at 320px.
 */
export default function TopBar() {
  const { business, reviewsSummary } = useSiteData();
  const rating = reviewsSummary?.rating;

  return (
    <div className="hidden bg-ink-950 text-ink-300 sm:block">
      <div className="shell flex h-9 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {rating ? (
            <a
              href={reviewsSummary.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-200 transition-colors hover:text-white"
            >
              <span aria-hidden="true" style={{ color: "#fbbc04" }}>
                ★
              </span>
              <span className="tabular-nums font-semibold">{rating.toFixed(1)}</span>
              <span className="text-ink-400">on Google</span>
            </a>
          ) : null}
          <span aria-hidden="true" className="hidden h-3.5 w-px bg-white/15 sm:block" />
          <p className="flex items-center gap-2 font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ink-200">
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
        </div>

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
