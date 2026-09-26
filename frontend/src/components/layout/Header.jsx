import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "../Logo.jsx";
import Icon from "../Icon.jsx";
import Button from "../ui/Button.jsx";
import TopBar from "./TopBar.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";

/**
 * Site header — premium local-retail treatment.
 *
 *   1. a slim dark utility TopBar (in the normal flow, scrolls away);
 *   2. a solid white navigation bar that sticks to the top of the viewport,
 *      lifting off the content with a soft shadow once the page is scrolled.
 *
 * The full-screen mobile drawer slides in from the right with the primary nav,
 * the two conversion actions and the store's address/hours.
 */
export default function Header() {
  const { business, nav } = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const navLinkCls = ({ isActive }) =>
    `relative inline-flex h-10 items-center rounded-[10px] px-3 font-display text-[0.875rem] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
      isActive ? "text-ink-950" : "text-ink-500 hover:text-ink-950"
    }`;

  // Nav items may target an in-page section on the homepage (e.g. "/#repairs").
  // React Router's NavLink matches on pathname only, so a hash link would read
  // as active on every "/" render; hash items get their own active check.
  const isHashItem = (to) => to.includes("#");
  const hashActive = (to) => {
    const [base, id] = to.split("#");
    return pathname === (base || "/") && hash === `#${id}`;
  };

  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <TopBar />

      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled || open
            ? "border-line shadow-[0_1px_0_rgb(8_9_12/0.04),0_8px_24px_-16px_rgb(8_9_12/0.28)]"
            : "border-line"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Link
            to="/"
            aria-label={`${business.name} — home`}
            className="shrink-0 rounded-lg py-1"
          >
            <Logo size={36} />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {nav.map((item) => {
                if (isHashItem(item.to)) {
                  const active = hashActive(item.to);
                  return (
                    <li key={item.to}>
                      <Link to={item.to} className={navLinkCls({ isActive: active })}>
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-accent-600 transition-transform duration-300 ease-out ${
                            active ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.to === "/"} className={navLinkCls}>
                      {({ isActive }) => (
                        <>
                          {item.label}
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-accent-600 transition-transform duration-300 ease-out ${
                              isActive ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={business.phoneTel}
              className="hidden h-10 items-center gap-2 rounded-[10px] px-3 font-display text-[0.875rem] font-semibold text-ink-700 transition-colors hover:bg-paper-mute hover:text-ink-950 xl:inline-flex"
            >
              <Icon name="phone" size={16} />
              <span className="tabular-nums">{business.phoneDisplay}</span>
            </a>

            <a
              href={waLink(waMessages.general())}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp us"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-wa-600 text-white transition-colors hover:bg-wa-700 xl:hidden"
            >
              <Icon name="whatsapp" size={18} />
            </a>
            <div className="hidden xl:block">
              <Button
                href={waLink(waMessages.general())}
                external
                variant="wa"
                size="md"
                icon="whatsapp"
              >
                WhatsApp Us
              </Button>
            </div>
          </div>

          {/* Mobile: call + menu */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <a
              href={business.phoneTel}
              aria-label={`Call ${business.name}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line-strong bg-white text-ink-800 transition-colors hover:bg-paper-mute"
            >
              <Icon name="phone" size={17} />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line-strong bg-white text-ink-800 transition-colors hover:bg-paper-mute"
            >
              <Icon name={open ? "x" : "menu"} size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------- Mobile drawer -- */}
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[55] bg-ink-950/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-y-0 right-0 z-[56] flex w-[86%] max-w-sm flex-col bg-white shadow-[var(--shadow-deep)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <Logo size={32} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line-strong bg-white text-ink-800 transition-colors hover:bg-paper-mute"
          >
            <Icon name="x" size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {nav.map((item) => {
                const mobileCls = (active) =>
                  `flex items-center justify-between border-b border-line py-3.5 font-display text-[1.0625rem] font-semibold tracking-[-0.015em] transition-colors ${
                    active ? "text-accent-600" : "text-ink-800"
                  }`;
                if (isHashItem(item.to)) {
                  return (
                    <li key={item.to}>
                      <Link to={item.to} className={mobileCls(hashActive(item.to))}>
                        {item.label}
                        <Icon name="chevronRight" size={17} className="text-ink-300" />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) => mobileCls(isActive)}
                    >
                      {item.label}
                      <Icon name="chevronRight" size={17} className="text-ink-300" />
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              href={waLink(waMessages.general())}
              external
              variant="wa"
              size="lg"
              icon="whatsapp"
              full
            >
              WhatsApp Us
            </Button>
            <Button href={business.phoneTel} variant="outline" size="lg" icon="phone" full>
              Call {business.phoneDisplay}
            </Button>
          </div>

          <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-paper-soft p-4">
            <p className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-600">
              <Icon name="mapPin" size={15} className="mt-0.5 shrink-0 text-ink-400" />
              <span>{business.address.full}</span>
            </p>
            <p className="mt-2.5 flex items-center gap-2.5 text-[0.8125rem] text-ink-600">
              <Icon name="clock" size={15} className="shrink-0 text-ink-400" />
              <span>
                <span className="font-semibold text-ink-800">Open daily</span> ·{" "}
                {business.hours.label}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
