/**
 * Smartphone brands associated with the shop.
 *
 * Supplied by the brief. The Google listing does not enumerate brands, so no
 * brand is presented as an authorised dealership, partnership or current stock.
 * Each entry is a plain browse-by-brand shortcut into a WhatsApp enquiry.
 */

export const brands = [
  { name: "Apple", note: "iPhone", category: "premium" },
  { name: "Samsung", note: "Galaxy", category: "mainstream" },
  { name: "Motorola", note: "Moto G & Edge", category: "mainstream" },
  { name: "Redmi", note: "Note & budget", category: "value" },
  { name: "Realme", note: "Narzo & number series", category: "value" },
  { name: "Vivo", note: "Y & V series", category: "mainstream" },
  { name: "OPPO", note: "A & Reno series", category: "mainstream" },
  { name: "POCO", note: "X, M & C series", category: "value" },
  { name: "Tecno", note: "Spark & Camon", category: "value" },
  { name: "Lava", note: "Blaze & Agni", category: "value" },
];

/**
 * Budget bands — a neutral way to browse when exact model/price lists are not
 * verifiable. Bands describe what the customer wants, not what the shop stocks.
 */
export const budgetBands = [
  {
    id: "entry",
    label: "Entry level",
    range: "under ₹10,000",
    blurb: "Everyday smartphones for calls, chat and light apps.",
  },
  {
    id: "mid",
    label: "Mid range",
    range: "₹10,000 – ₹20,000",
    blurb: "The sweet spot — strong battery, good cameras, 5G options.",
  },
  {
    id: "upper",
    label: "Upper mid",
    range: "₹20,000 – ₹35,000",
    blurb: "Better displays, faster charging and flagship-grade cameras.",
  },
  {
    id: "flagship",
    label: "Flagship",
    range: "₹35,000 and above",
    blurb: "Premium flagships including iPhone and Galaxy S series.",
  },
];

/**
 * What the shop sells, grouped by customer intent.
 * Grounded in the listing's own categories (cell phone store, cell phone
 * accessory store) and its published description.
 */
export const smartphoneCategories = [
  {
    id: "new",
    title: "New smartphones",
    blurb:
      "Brand-new handsets across every budget, set up and ready to use before you leave the counter.",
    points: ["Sealed box", "Set up in store", "All leading brands"],
  },
  {
    id: "5g",
    title: "5G smartphones",
    blurb:
      "5G-ready models on every major network, so your next phone stays current for years.",
    points: ["Future-proof", "All budgets", "Network ready"],
  },
  {
    id: "exchange",
    title: "Exchange & upgrade",
    blurb:
      "Bring your current handset and put its value towards your next one.",
    points: ["Instant valuation", "Same-day upgrade", "Any brand"],
  },
  {
    id: "budget",
    title: "Budget & value picks",
    blurb:
      "Dependable everyday phones that cover the essentials without stretching your budget.",
    points: ["Under ₹10,000", "Long battery life", "Great first phone"],
  },
];