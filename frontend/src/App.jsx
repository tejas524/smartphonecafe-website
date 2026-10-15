import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import LazyRoute from "./components/LazyRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import RouteErrorBoundary from "./components/RouteErrorBoundary.jsx";

/**
 * Public page loaders.
 *
 * Secondary pages load through dynamic import() into separate chunks. The
 * homepage's first screen is eager; its lower sections load separately. A
 * single blocked or failed page module — e.g. a browser privacy filter blocking
 * /src/pages/PrivacyPolicy.jsx — degrades to a graceful, retryable error state
 * for THAT route only, instead of preventing the whole app from mounting.
 *
 * The loaders are defined at module scope so their references are stable (a new
 * function each render would restart LazyRoute's load effect on every render).
 */
const load = {
  admin: () => import("./admin/AdminApp.jsx"),
  smartphones: () => import("./pages/Smartphones.jsx"),
  smartphoneDetail: () => import("./pages/SmartphoneDetail.jsx"),
  accessories: () => import("./pages/Accessories.jsx"),
  about: () => import("./pages/About.jsx"),
  gallery: () => import("./pages/Gallery.jsx"),
  contact: () => import("./pages/Contact.jsx"),
  privacy: () => import("./pages/PrivacyPolicy.jsx"),
  terms: () => import("./pages/TermsAndConditions.jsx"),
};

/** Public marketing site, wrapped in the shared header/footer layout. */
function PublicSite() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
        <Route path="/smartphones" element={<LazyRoute loader={load.smartphones} name="Smartphones" />} />
        <Route path="/smartphones/:id" element={<LazyRoute loader={load.smartphoneDetail} name="SmartphoneDetail" />} />
        <Route path="/accessories" element={<LazyRoute loader={load.accessories} name="Accessories" />} />
        {/* The standalone Offers page was removed; offers now live in the
            homepage section. Any old /offers link redirects there and scrolls. */}
        <Route path="/offers" element={<Navigate to="/#offers" replace />} />
        <Route path="/about" element={<LazyRoute loader={load.about} name="About" />} />
        <Route path="/gallery" element={<LazyRoute loader={load.gallery} name="Gallery" />} />
        <Route path="/contact" element={<LazyRoute loader={load.contact} name="Contact" />} />
        <Route path="/privacy-policy" element={<LazyRoute loader={load.privacy} name="PrivacyPolicy" />} />
        <Route path="/terms-and-conditions" element={<LazyRoute loader={load.terms} name="TermsAndConditions" />} />
        {/* NotFound is tiny and always needed, so it stays eagerly bundled. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin dashboard lives outside the public layout and manages its own
          auth, routing and chrome. */}
      <Route path="/admin/*" element={import.meta.env.VITE_STATIC_PREVIEW ? (
        <main className="mx-auto max-w-xl px-6 py-24">
          <h1 className="text-3xl font-bold">Website preview</h1>
          <p className="mt-4">Admin editing is available on the local site. This preview displays a snapshot of the public website.</p>
          <a className="mt-6 inline-block underline" href="/">Back to the website</a>
        </main>
      ) : <LazyRoute loader={load.admin} name="admin" />} />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
