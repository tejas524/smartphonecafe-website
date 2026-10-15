import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { publicApi } from "../lib/api.js";
import previewSnapshot from "../../public/preview-content.json";
import {
  adaptBusiness,
  adaptBrands,
  adaptOffers,
  adaptRepairs,
  adaptGallery,
  adaptSmartphones,
  adaptAccessoryCategories,
  adaptAccessoryItems,
  adaptSiteUrl,
  adaptReviews,
  adaptReviewsSummary,
  buildDirectionsUrl,
  buildMapEmbedUrl,
  indexHomeSections,
} from "../lib/adapters.js";
// Static identity fallbacks. `nav` has no DB table (site navigation is fixed);
// `business` acts as a resilience fallback if the API is unreachable so the
// header/footer never render blank.
import {
  business as staticBusiness,
  siteUrl as staticSiteUrl,
  directionsUrl as staticDirectionsUrl,
  mapEmbedUrl as staticMapEmbedUrl,
  nav,
} from "../data/site.js";

const SiteDataContext = createContext(null);

/** Assemble the unified site-data object from a raw /bootstrap payload. */
function assemble(bootstrap) {
  const business = adaptBusiness(bootstrap.business);
  const brands = adaptBrands(bootstrap.brands);
  const brandNameById = new Map(brands.map((b) => [b.id, b.name]));
  const smartphones = adaptSmartphones(bootstrap.smartphones).map((s) => ({
    ...s,
    brand: brandNameById.get(s.brand_id) || "",
    model: s.model_name,
    image: s.image_path || null,
  }));
  const accessoryCategories = adaptAccessoryCategories(bootstrap.accessories?.categories);
  const categoryById = new Map(accessoryCategories.map((c) => [c.id, c]));
  const accessoryItems = adaptAccessoryItems(bootstrap.accessories?.items).map((a) => {
    const cat = categoryById.get(a.category_id) || null;
    return {
      ...a,
      brand: brandNameById.get(a.brand_id) || "",
      categoryTitle: cat?.title || "",
      categorySlug: cat?.slug || "",
      image: a.image_path || cat?.image || null,
    };
  });
  return {
    business,
    siteUrl: adaptSiteUrl(bootstrap.business),
    directionsUrl: buildDirectionsUrl(business),
    mapEmbedUrl: buildMapEmbedUrl(business),
    nav,
    home: indexHomeSections(bootstrap.home),
    brands,
    offers: adaptOffers(bootstrap.offers),
    repairs: adaptRepairs(bootstrap.repairs),
    gallery: adaptGallery(bootstrap.gallery),
    smartphones,
    accessories: {
      categories: accessoryCategories,
      items: accessoryItems,
    },
    reviews: adaptReviews(bootstrap.reviews),
    reviewsSummary: adaptReviewsSummary(bootstrap.business),
  };
}

/** Static fallback used only when the API is unreachable. */
function staticFallback() {
  return {
    business: staticBusiness,
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
    // API unreachable: show no reviews rather than stale hard-coded ones. The
    // summary reads from the (also unavailable) business facts, so it stays
    // empty until the API responds; ReviewsSection renders a graceful state.
    reviews: [],
    reviewsSummary: { rating: 0, reviewCount: 0, googleUrl: staticBusiness.google.shortUrl },
  };
}

// Static previews already have public data at build time; skip a network round
// trip and keep rating/header text stable from the first render.
const initialPreviewData = import.meta.env.VITE_STATIC_PREVIEW ? assemble(previewSnapshot.data) : null;

export function SiteDataProvider({ children }) {
  const [status, setStatus] = useState(initialPreviewData ? "ready" : "loading");
  const [data, setData] = useState(initialPreviewData);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    if (initialPreviewData) return;
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
