/**
 * Homepage "Current Offers" content.
 *
 * IMPORTANT — every entry here is source-backed and carries NO invented
 * commercial figure. This mirrors the `offers` rows in database/seed.sql
 * exactly (which the Phase 3 generator built from verified evidence only):
 *
 *   - No discount percentage, no rupee amount, no expiry date is stated,
 *     because none is published or verified. The prototype's mock figures
 *     ("₹499", "20% Off", "Up to ₹10,000 Off") are deliberately NOT reproduced.
 *   - What IS supported by evidence:
 *       a) the business's own Google listing promising "exclusive deals"
 *          and "quick repairs";
 *       b) Bajaj Finserv easy-EMI / cashback signage photographed INSIDE the
 *          shop — stored as in-store information (needsConfirmation), never as
 *          a running online promotion.
 *
 * Each card is an enquiry prompt that routes to WhatsApp or a call, so the
 * customer always confirms the current terms with the store rather than
 * trusting a figure the site cannot keep accurate.
 *
 * This is local Phase-5 data. When the site is repointed at the API (a later
 * phase) these same rows will come from the `offers` table.
 */

import { waLink, waMessages } from "../utils/whatsapp.js";

/**
 * OFFER BANNERS — owner-supplied promotional artwork, used AS-IS.
 *
 * The four images live in public/offers-images/ exactly as the owner provided
 * them (only losslessly renamed to clean slugs). Per the brief: one image = one
 * offer; do not generate, combine, replace or invent offer content. So each
 * banner is shown whole, with no overlaid text. The banners carry their own
 * calls to action; tapping one simply opens a WhatsApp enquiry so the customer
 * can confirm the current terms with the store. `alt` is transcribed from each
 * banner (OCR) — no claim is added that the artwork does not already make.
 */
export const offerBanners = [
  {
    id: "accessories",
    src: "/offers-images/offer-accessories.png",
    width: 1254,
    height: 1254,
    alt: "Accessories offer: save on selected accessories — covers, chargers, earphones, power banks and more. Offer on selected accessories only; check in-store for details.",
    ctaMessage: waMessages.accessories(),
  },
  {
    id: "galaxy-a55",
    src: "/offers-images/offer-galaxy-a55.png",
    width: 1254,
    height: 1254,
    alt: "Samsung Galaxy A55 5G — 50MP triple camera, Super AMOLED display, IP67 water resistant. Visit store for best price; offer valid for a limited time, T&C apply.",
    ctaMessage: waMessages.smartphones(),
  },
  {
    id: "covers-glass",
    src: "/offers-images/offer-covers-glass.png",
    width: 1254,
    height: 1254,
    alt: "Special combo: buy a cover and tempered glass together. Scratch resistant, fingerprint protection and crystal-clear display. Check in-store for details.",
    ctaMessage: waMessages.accessories(),
  },
  {
    id: "exchange",
    src: "/offers-images/offer-exchange.png",
    width: 1254,
    height: 1254,
    alt: "Exchange offer: upgrade to a new smartphone and get value for your old phone. Final value depends on condition and model; bring your phone to the store, T&C apply.",
    ctaMessage: waMessages.smartphones(),
  },
];

/**
 * OFFERS — editorial, text-only cards for the homepage skeleton.
 *
 * These mirror the store's real running promotions (the same four subjects the
 * owner's in-store banners cover), presented as plain text so the homepage
 * stays typographic and image-light. Crucially, NO figure is invented: there is
 * no discount %, price, saving or expiry here, because none is published. Each
 * card is an enquiry prompt that routes to WhatsApp so the customer confirms
 * the current terms with the store.
 */
export const offers = [
  {
    id: "accessories",
    eyebrow: "Accessories",
    title: "Deals on everyday accessories",
    body: "Save on selected covers, chargers, cables, earphones and power banks. Ask which items are on offer this week.",
    ctaLabel: "Ask on WhatsApp",
    ctaMessage: waMessages.accessories(),
  },
  {
    id: "galaxy-a55",
    eyebrow: "Featured smartphone",
    title: "Samsung Galaxy A55 5G",
    body: "A popular pick in store — 50MP triple camera, Super AMOLED display and IP67 build. Visit the store for the current best price.",
    ctaLabel: "Check price",
    ctaMessage: waMessages.smartphones(),
  },
  {
    id: "covers-glass",
    eyebrow: "Protection combo",
    title: "Cover + tempered glass together",
    body: "Pair a back cover with tempered glass and have it fitted at the counter. Ask about the combo when you visit.",
    ctaLabel: "Ask on WhatsApp",
    ctaMessage: waMessages.accessories(),
  },
  {
    id: "exchange",
    eyebrow: "Exchange & upgrade",
    title: "Trade in your old phone",
    body: "Put the value of your current handset towards a new one. Final value depends on the phone's condition and model — bring it in for a check.",
    ctaLabel: "Ask about exchange",
    ctaMessage: waMessages.smartphones(),
  },
];

/**
 * Short, verified reasons to choose the store — the "trust / features" strip
 * that sits directly under the hero.
 *
 * Every item is evidence-backed:
 *   - hours are verified from the Google listing (identical all 7 days);
 *   - "dedicated repair shop" is the listing's primary category;
 *   - "sales · service · accessories" are the listing's own categories;
 *   - EMI is photographed in-store signage (phrased as "in store", pending
 *     confirmation, never as a fixed online promotion).
 * No rating, review count, years-in-business or "No. 1" style claim appears.
 */
export const trustFeatures = [
  {
    id: "open",
    icon: "clock",
    title: "Open all 7 days",
    body: "10:00 AM – 9:30 PM, every day of the week.",
  },
  {
    id: "repairs",
    icon: "wrench",
    title: "Repairs on site",
    body: "A dedicated repair shop — faults checked at the counter.",
  },
  {
    id: "onestop",
    icon: "store",
    title: "Sales · Service · Accessories",
    body: "Phones, repairs and the everyday extras, all in one stop.",
  },
  {
    id: "emi",
    icon: "rupee",
    title: "Easy EMI in store",
    body: "Instalment options, including Bajaj Finserv — ask at the counter.",
  },
];
