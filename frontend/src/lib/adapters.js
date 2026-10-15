/**
 * Adapters map the backend's API row shapes onto the shapes the existing UI
 * components expect. The public API returns flat DB rows (e.g. business_info as
 * a key/value object, brands/offers as arrays with `image_path` strings); the
 * components were built against the hand-authored src/data/*.js shapes. Keeping
 * the mapping here means components stay declarative and the static data files
 * can be retired without a rewrite.
 *
 * Everything is defensive: missing keys yield sensible empties, never crashes.
 */

const str = (v) => (v == null ? "" : String(v));
const clean = (v) => {
  const s = str(v).trim();
  return s === "" ? null : s;
};

/** Flat business_info key/value object -> nested `business` shape (see data/site.js). */
export function adaptBusiness(b = {}) {
  const e164 = str(b.phone_e164) || "+919922599577";
  return {
    name: str(b.business_name) || "SmartphoneCafe",
    listingName: str(b.listing_name) || str(b.business_name),
    tagline: str(b.tagline),
    type: str(b.business_type),

    phoneDisplay: str(b.phone_display),
    phoneShort: e164.replace(/^\+91/, ""),
    phoneE164: e164,
    phoneTel: `tel:${e164}`,

    whatsappNumber: str(b.whatsapp_number),
    email: clean(b.email),

    address: {
      line1: str(b.address_line1),
      line2: str(b.address_line2),
      line3: str(b.address_line3),
      city: str(b.address_city),
      region: str(b.address_region),
      postalCode: str(b.address_postal_code),
      country: str(b.address_country),
      full: str(b.address_full),
      short: str(b.address_short),
    },

    hours: {
      label: str(b.hours_label),
      days: str(b.hours_days),
      opens: str(b.hours_opens),
      closes: str(b.hours_closes),
    },

    google: {
      shortUrl: str(b.google_short_url),
      placeUrl: str(b.google_place_url),
      placeId: str(b.google_place_id),
      plusCode: str(b.google_plus_code),
      lat: b.latitude != null ? Number(b.latitude) : null,
      lng: b.longitude != null ? Number(b.longitude) : null,
    },

    listingDescription: str(b.listing_description),
  };
}

/** Turn-by-turn directions deep-link built from adapted business data. */
export function buildDirectionsUrl(business) {
  const dest = `${business.listingName}, ${business.address.full}`;
  const pid = business.google.placeId
    ? `&destination_place_id=${business.google.placeId}`
    : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}${pid}`;
}

/** Keyless Google Maps embed URL (no API key required). */
export function buildMapEmbedUrl(business) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    business.listingName
  )}&z=16&hl=en&output=embed`;
}

export const adaptSiteUrl = (b = {}) => str(b.site_url) || "https://smartphonecafe.in";

/**
 * reviews rows -> the shape ReviewCard consumes. No reviewer photo is stored or
 * fetched: the card renders an avatar from the first letter of `name`.
 */
export const adaptReviews = (rows) =>
  byOrder(rows).map((r) => ({
    id: r.id,
    name: r.reviewer_name || "",
    text: r.review_text || "",
    rating: Number(r.rating) || 5,
  }));

/**
 * The public review summary (big rating + total). Both figures are editable
 * business_info values, NOT computed from the review rows, so the owner can
 * show the real Google totals while curating individual reviews. `googleUrl`
 * reuses the verified Maps short link.
 */
export function adaptReviewsSummary(b = {}) {
  const rating = b.review_rating != null ? Number(b.review_rating) : 0;
  const count = b.review_count != null ? Number(b.review_count) : 0;
  return {
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: Number.isFinite(count) ? count : 0,
    googleUrl: str(b.google_short_url) || str(b.google_place_url),
  };
}

/** homepage_content rows -> { [section_key]: row } for easy lookup. */
export function indexHomeSections(rows = []) {
  const map = {};
  for (const row of rows) map[row.section_key] = row;
  return map;
}

/** Resolve an image_path/logo_path to a usable URL (already root-relative). */
export const assetUrl = (path) => (path ? str(path) : null);

/**
 * Pass-through list adapters. These keep the raw API rows but guarantee arrays
 * and stable ordering by display_order (the API already orders, this is a
 * belt-and-braces guard). Components read the DB column names directly.
 */
const byOrder = (rows) =>
  [...(rows || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

export const adaptBrands = (rows) =>
  byOrder(rows).map((r) => ({ ...r, logo: r.logo_path || null }));

export const adaptOffers = (rows) =>
  byOrder(rows).map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle || null,
    src: r.image_path || null,
    alt: r.subtitle || r.title || "Current offer",
    href: r.cta_url || null,
    ctaLabel: r.cta_label || null,
  }));

export const adaptRepairs = (rows) =>
  byOrder(rows).map((r) => ({
    id: r.id,
    slug: r.slug,
    icon: r.icon || "wrench",
    image: r.image_path || null,
    title: r.title,
    blurb: r.description || "",
    description: r.description || "",
    tags: r.tags
      ? String(r.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  }));

export const adaptGallery = (rows) =>
  byOrder(rows).map((r) => {
    const src = assetUrl(r.image_path);
    return {
      id: r.id,
      slug: r.slug,
      src,
      srcset: r.srcset || (src ? `${src} ${r.width || 2000}w` : ""),
      width: r.width || undefined,
      height: r.height || undefined,
      alt: r.alt_text || r.caption || r.title || "",
      caption: r.caption || r.title || "",
      aspect: r.aspect_ratio || "4 / 3",
      category: r.category || "all",
      feature: !!r.is_featured,
    };
  });

// Brand name is joined from brand_id in the SiteData provider (assemble()).
export const adaptSmartphones = (rows) => byOrder(rows);

export const adaptAccessoryCategories = (rows) =>
  byOrder(rows).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    blurb: r.description || "",
    icon: r.icon || null,
    image: r.image_path || null,
    alt: r.title ? `${r.title} at SmartphoneCafe` : "Accessory category",
  }));

export const adaptAccessoryItems = (rows) => byOrder(rows);
