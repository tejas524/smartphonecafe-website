import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Smartphones from "./pages/Smartphones.jsx";
import SmartphoneDetail from "./pages/SmartphoneDetail.jsx";
import Repairs from "./pages/Repairs.jsx";
import Accessories from "./pages/Accessories.jsx";
import Offers from "./pages/Offers.jsx";
import About from "./pages/About.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/smartphones" element={<Smartphones />} />
        <Route path="/smartphones/:id" element={<SmartphoneDetail />} />
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}