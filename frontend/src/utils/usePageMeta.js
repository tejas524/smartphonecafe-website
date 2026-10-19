import { useEffect } from "react";

const SITE = import.meta.env.VITE_SITE_URL || "https://smartphonecafe.in";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Per-route document title, meta description, canonical and OG tags.
 * Keeps the SPA's client-side metadata consistent with the crawlable
 * static tags in index.html.
 */
export default function usePageMeta({ title, description, path = "/", noIndex = false }) {
  useEffect(() => {
    const full = title
      ? `${title} | SmartphoneCafe`
      : "SmartphoneCafe | Smartphones & Mobile Repair in Talegaon Dabhade";

    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", `${SITE}${path}`);
    setMeta("name", "twitter:title", full);
    setMeta("name", "twitter:description", description);
    setMeta("name", "robots", noIndex || import.meta.env.VITE_STATIC_PREVIEW ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${SITE}${path}`);
  }, [title, description, path, noIndex]);
}
