import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { publicApi } from "../lib/api.js";
import {
  adaptBusiness,
  adaptBrands,
  adaptOffers,
  adaptRepairs,
  adaptGallery,
  adaptSmartphones,
  adaptAccessoryCategories,
  adaptAccessoryItems,
  adaptServiceAreas,
  adaptSiteUrl,
  buildDirectionsUrl,
  buildMapEmbedUrl,
  indexHomeSections,
} from "../lib/adapters.js";
// Static identity fallbacks. `nav` has no DB table (site navigation is fixed);
// business/serviceAreas act as a resilience fallback if the API is unreachable
// so the header/footer never render blank.
import {
  business as staticBusiness,
  serviceAreas as staticServiceAreas,
  siteUrl as staticSiteUrl,
  directionsUrl as staticDirectionsUrl,
  mapEmbedUrl as staticMapEmbedUrl,
  nav,
} from "../data/site.js";

const SiteDataContext = createContext(null);

/** Assemble the unified site-data object from a raw /bootstrap payload. */
function assemble(bootstrap) {
  const business = adaptBusiness(bootstrap.business);
  return {
    business,
    serviceAreas: adaptServiceAreas(bootstrap.business),
    siteUrl: adaptSiteUrl(bootstrap.business),
    directionsUrl: buildDirectionsUrl(business),
    mapEmbedUrl: buildMapEmbedUrl(business),
    nav,
    home: indexHomeSections(bootstrap.home),
    brands: adaptBrands(bootstrap.brands),
    offers: adaptOffers(bootstrap.offers),
    repairs: adaptRepairs(bootstrap.repairs),
    gallery: adaptGallery(bootstrap.gallery),
    smartphones: adaptSmartphones(bootstrap.smartphones),
    accessories: {
      categories: adaptAccessoryCategories(bootstrap.accessories?.categories),
      items: adaptAccessoryItems(bootstrap.accessories?.items),
    },
  };
}

/** Static fallback used only when the API is unreachable. */
function staticFallback() {
  return {
    business: staticBusiness,
    serviceAreas: staticServiceAreas,
    siteUrl: staticSiteUrl,
    directionsUrl: staticDirectionsUrl,
    mapEmbedUrl: staticMapEmbedUrl,
    nav,
    home: {},
    brands: [],
    offers: [],
    repairs: [],
    gallery: [],
    smartphones: [],
    accessories: { categories: [], items: [] },
  };
}

export function SiteDataProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    setStatus("loading");
    publicApi
      .bootstrap(controller.signal)
      .then((payload) => {
        if (!mounted.current) return;
        setData(assemble(payload || {}));
        setError(null);
        setStatus("ready");
      })
      .catch((err) => {
        if (err?.name === "AbortError" || !mounted.current) return;
        // Resilience: fall back to static identity so the shell never blanks.
        setData(staticFallback());
        setError(err);
        setStatus("error");
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [nonce]);

  const value = useMemo(
    () => ({
      status,
      error,
      reload: () => setNonce((n) => n + 1),
      ...(data || staticFallback()),
    }),
    [status, error, data]
  );

  return (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
  );
}

/** Access the unified, adapted site data. */
export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error("useSiteData must be used within <SiteDataProvider>");
  }
  return ctx;
}
