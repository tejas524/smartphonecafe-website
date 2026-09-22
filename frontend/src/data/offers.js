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
import { business } from "./site.js";

export const offers = [
  {
    id: "deals",
    icon: "tag",
    badge: "Ask in store",
    title: "Exclusive deals, in store",
    subtitle: "Current offers change often",
    body: "The shop advertises exclusive deals in store. Stock and pricing move quickly, so message us to hear exactly what is running right now — no guesswork, no out-of-date figures.",
    // Directly quotes the business's own Google listing description.
    source: "From the shop's own Google listing description",
    ctaLabel: "Ask about deals",
    ctaHref: waLink(waMessages.offers()),
    external: true,
  },
  {
    id: "emi",
    icon: "rupee",
    badge: "At the counter",
    title: "Easy EMI options in store",
    subtitle: "Instalments discussed at the counter",
    body: "EMI and cashback signage is displayed inside the shop, including Bajaj Finserv. Exact schemes, eligibility and rates are set by the finance provider and are not published online — ask at the counter for the current terms.",
    // Photographed in-store signage; flagged as in-store information.
    source: "In-store signage · terms set by the finance provider",
    needsConfirmation: true,
    ctaLabel: "Ask in store",
    ctaHref: business.phoneTel,
    external: false,
  },
  {
    id: "repairs",
    icon: "wrench",
    badge: "Service",
    title: "Quick repairs, checked first",
    subtitle: "Faults assessed before any work",
    body: "We are a dedicated mobile phone repair shop. Bring the phone in and the fault is checked in front of you — no work begins until you agree. The listing promises quick repairs but states no timeframe, so none is promised here.",
    source: "Google listing categories and description",
    ctaLabel: "WhatsApp your problem",
    ctaHref: waLink(waMessages.repairs()),
    external: true,
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
