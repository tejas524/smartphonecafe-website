import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SiteDataProvider } from "./context/SiteData.jsx";
import { PrivacyProvider } from "./context/Privacy.jsx";
import PrivacyChoices from "./components/PrivacyChoices.jsx";
import ConsentAnalytics from "./components/ConsentAnalytics.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <PrivacyProvider>
        <SiteDataProvider>
          <App />
          <PrivacyChoices />
          <ConsentAnalytics />
        </SiteDataProvider>
      </PrivacyProvider>
    </BrowserRouter>
  </StrictMode>
);
