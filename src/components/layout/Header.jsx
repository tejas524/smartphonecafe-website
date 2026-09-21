import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "../Logo.jsx";
import Icon from "../Icon.jsx";
import Button from "../ui/Button.jsx";
import { business, nav } from "../../data/site.js";
import { waLink, waMessages } from "../../utils/whatsapp.js";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock background scroll while the mobile panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-white/92 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
          : "border-b border-transparent bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/40"
      }`}
    >
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

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
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `relative inline-flex h-10 items-center rounded-[10px] px-3.5 font-display text-[0.875rem] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                      isActive
                        ? "text-ink-950"
                        : "text-ink-500 hover:text-ink-950"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3.5 bottom-1 h-[2px] rounded-full bg-accent-600 transition-transform duration-300 ease-out ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={business.phoneTel}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] px-3 font-display text-[0.875rem] font-semibold text-ink-700 transition-colors hover:bg-paper-mute hover:text-ink-950"
          >
            <Icon name="phone" size={16} />
            <span className="tabular-nums">{business.phoneDisplay}</span>
          </a>
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

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="lg:hidden"
        style={{ maxHeight: "calc(100dvh - 4rem)" }}
      >
        <div className="overflow-y-auto border-t border-line bg-white px-5 pb-7 pt-4">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {nav.map((item, i) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center justify-between border-b border-line py-3.5 font-display text-[1.0625rem] font-semibold tracking-[-0.015em] transition-colors ${
                        isActive ? "text-accent-600" : "text-ink-800"
                      }`
                    }
                    style={{ animationDelay: `${i * 28}ms` }}
                  >
                    {item.label}
                    <Icon name="chevronRight" size={17} className="text-ink-300" />
                  </NavLink>
                </li>
              ))}
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
    </header>
  );
}