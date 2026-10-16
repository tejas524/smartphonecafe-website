import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MobileActionBar from "./MobileActionBar.jsx";

/**
 * Scroll behaviour on navigation:
 *   - plain route change → jump to top;
 *   - route change carrying a #hash → smooth-scroll to that section once it
 *     exists. Because pages are code-split and lazily rendered, the target may
 *     not be in the DOM on the first frame (e.g. arriving at "/#offers" from an
 *     inner route while the Home chunk loads). We therefore retry across
 *     animation frames until the element mounts, up to a short deadline, rather
 *     than relying on a single fragile timeout. Sticky-header offset is handled
 *     by each section's CSS scroll-margin-top.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }

    const id = hash.slice(1);
    const deadline = (typeof performance !== "undefined" ? performance.now() : Date.now()) + 3000;
    let raf = 0;

    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now < deadline) {
        raf = requestAnimationFrame(attempt);
      }
      // Deadline passed and the section never appeared: leave the page as-is.
    };

    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}

export default function Layout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <Header />

      {/*
        No top offset here: the navigation is `sticky`, so it occupies real
        layout space and the page content already begins beneath it.
      */}
      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
      {/* Clears the fixed mobile action bar without introducing a light gap:
          the spacer sits BELOW the dark footer and shares its ink background. */}
      <div aria-hidden="true" className="bg-ink-950 lg:hidden" style={{ height: "calc(4.25rem + env(safe-area-inset-bottom))" }} />

      <MobileActionBar />
    </div>
  );
}
