import { Link } from "react-router-dom";
import { Logo } from "../Logo.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

export default function Footer() {
  const { business, nav, reviewsSummary } = useSiteData();
  const year = new Date().getFullYear();

  const linkCls =
    "text-[0.875rem] text-ink-400 transition-colors hover:text-white";

  return (
    <footer className="border-t border-white/8 bg-ink-950 text-ink-300">
      <div className="shell py-14 lg:py-16">
        <div className="grid gap-11 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Logo size={40} tone="light" />

            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-ink-400">
              {business.tagline}
            </p>

            <p className="mt-4 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
              A mobile phone store and repair shop on Talegaon Station Road,
              serving Talegaon Dabhade and the surrounding area.
            </p>

            {reviewsSummary?.rating ? (
              <a
                href={reviewsSummary.googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.8125rem] text-ink-300 transition-colors hover:border-white/25 hover:text-white"
              >
                <span aria-hidden="true" style={{ color: "#fbbc04" }}>
                  ★★★★★
                </span>
                <span className="font-semibold tabular-nums text-white">
                  {reviewsSummary.rating.toFixed(1)}
                </span>
                <span className="text-ink-500">
                  · {reviewsSummary.reviewCount} Google reviews
                </span>
              </a>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={waLink(waMessages.general())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-wa-600 px-4 font-display text-[0.8125rem] font-semibold text-white transition-colors hover:bg-wa-700"
              >
                <Icon name="whatsapp" size={16} />
                WhatsApp
              </a>
              <a
                href={business.phoneTel}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/18 px-4 font-display text-[0.8125rem] font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Icon name="phone" size={16} />
                Call
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-3">
            <h2 className="eyebrow text-white">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkCls}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h2 className="eyebrow text-white">Visit the store</h2>

            <address className="mt-4 not-italic">
              <p className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-ink-400">
                <Icon name="mapPin" size={15} className="mt-1 shrink-0 text-ink-600" />
                <span>
                  {business.address.line1},
                  <br />
                  {business.address.line2},
                  <br />
                  {business.address.line3},
                  <br />
                  {business.address.region} {business.address.postalCode}
                </span>
              </p>
            </address>

            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={business.phoneTel}
                  className="flex items-center gap-2.5 text-[0.875rem] text-ink-400 transition-colors hover:text-white"
                >
                  <Icon name="phone" size={15} className="shrink-0 text-ink-600" />
                  <span className="tabular-nums">{business.phoneDisplay}</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-[0.875rem] text-ink-400">
                <Icon name="clock" size={15} className="shrink-0 text-ink-600" />
                <span>
                  <span className="font-semibold text-ink-200">Open daily</span> ·{" "}
                  {business.hours.label}
                </span>
              </li>
              <li>
                <a
                  href={business.google.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[0.875rem] text-ink-400 transition-colors hover:text-white"
                >
                  <Icon name="google" size={15} className="shrink-0 text-ink-600" />
                  See SmartphoneCafe on Google
                  <Icon name="external" size={13} className="text-ink-600" />
                </a>
              </li>
            </ul>

            <a
              href={business.google.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-display text-[0.8125rem] font-semibold text-accent-400 transition-colors hover:text-accent-200"
            >
              Get directions
              <Icon name="arrowUpRight" size={14} />
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/8 pt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] text-ink-600">
              © {year} {business.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link to="/privacy-policy" className={linkCls}>
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className={linkCls}>
                Terms &amp; Conditions
              </Link>
              <span className="text-[0.8125rem] text-ink-600">
                {business.type} · Talegaon Dabhade, Maharashtra
              </span>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-[0.75rem] leading-relaxed text-ink-700">
            Brand names shown on this website belong to their respective owners
            and are listed only to indicate the kinds of phones customers ask us
            about. Nothing here states or implies authorised dealership, and
            availability is confirmed in store or on WhatsApp.
          </p>
        </div>
      </div>
    </footer>
  );
}