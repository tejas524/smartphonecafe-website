import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MobileActionBar from "./MobileActionBar.jsx";

/**
 * Scroll behaviour on navigation:
 *   - plain route change → jump to top;
 *   - route change carrying a #hash → smooth-scroll to that section (after the
 *     new page has painted). Accounts for the sticky header via CSS
 *     scroll-margin / scroll-padding-top.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // Wait a frame so the target section exists after the route renders.
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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

      {/* Bottom padding clears the fixed mobile action bar */}
      <div aria-hidden="true" className="h-[4.25rem] lg:hidden" />

      <Footer />
      <div aria-hidden="true" className="h-[4.25rem] bg-ink-950 lg:hidden" />

      <MobileActionBar />
    </div>
  );
}