import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Smartphones from "./pages/Smartphones.jsx";
import SmartphoneDetail from "./pages/SmartphoneDetail.jsx";
import Accessories from "./pages/Accessories.jsx";
import Offers from "./pages/Offers.jsx";
import About from "./pages/About.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminApp from "./admin/AdminApp.jsx";

/** Public marketing site, wrapped in the shared header/footer layout. */
function PublicSite() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/smartphones" element={<Smartphones />} />
        <Route path="/smartphones/:id" element={<SmartphoneDetail />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
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
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
