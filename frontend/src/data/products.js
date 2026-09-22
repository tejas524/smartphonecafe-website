/**
 * "Latest Smartphones" — a small, visual, representative line-up.
 *
 * HONESTY RULES (from the brief):
 *   - The product renders are OFFICIAL images supplied by the shop owner and
 *     processed into local assets (see scripts/process-catalog-images.mjs).
 *   - These models are REPRESENTATIVE of what people ask about — they are NOT a
 *     confirmed stock list. No price, discount, availability or "in stock"
 *     claim is made anywhere. Every card routes to a WhatsApp / "Check
 *     Availability" enquiry so the customer confirms with the store.
 *   - `image` points at a generated file; if it is ever missing the card falls
 *     back to the brand logo, so the section never shows a broken tile.
 *
 * To change the featured set, edit this array and drop a matching render into
 * public/product-images/<slug>.webp (see that folder's expectations).
 */

export const smartphoneModels = [
  {
    slug: "iphone-16",
    brand: "Apple",
    brandSlug: "apple",
    model: "iPhone 16",
    image: "/product-images/iphone-16.webp",
    alt: "Apple iPhone 16 official product render",
  },
  {
    slug: "galaxy-s26-fe",
    brand: "Samsung",
    brandSlug: "samsung",
    model: "Galaxy S26 FE",
    image: "/product-images/galaxy-s26-fe.webp",
    alt: "Samsung Galaxy S26 FE official product render",
  },
  {
    slug: "motorola-edge-60",
    brand: "Motorola",
    brandSlug: "motorola",
    model: "Edge 60",
    image: "/product-images/motorola-edge-60.webp",
    alt: "Motorola Edge 60 official product render",
  },
  {
    slug: "redmi-note-14",
    brand: "Redmi",
    brandSlug: "redmi",
    model: "Redmi Note 14",
    image: "/product-images/redmi-note-14.webp",
    alt: "Redmi Note 14 official product render",
  },
  {
    slug: "oppo-reno-16-5g",
    brand: "OPPO",
    brandSlug: "oppo",
    model: "Reno 16 5G",
    image: "/product-images/oppo-reno-16-5g.webp",
    alt: "OPPO Reno 16 5G official product render",
  },
];

/** Shown under the grid so the line-up is never mistaken for live stock. */
export const smartphoneModelsNote =
  "Models shown are popular examples, not a live stock list. Availability, variants and current pricing change often — message us or visit the store to check what is available today.";
