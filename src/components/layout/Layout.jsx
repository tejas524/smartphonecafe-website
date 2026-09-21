import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MobileActionBar from "./MobileActionBar.jsx";

/** Reset scroll on navigation — a SPA route change should start at the top. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function Layout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <Header />

      <main id="main" className="flex-1 pt-16 lg:pt-[4.5rem]">
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