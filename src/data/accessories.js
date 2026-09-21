/**
 * Accessories + in-store services.
 *
 * Evidence base: the Google listing carries the categories "Cell phone
 * accessory store" and "Cell phone store", and the business's own published
 * description promises "reliable accessories", "exclusive deals" and
 * "personalized service". A public review also mentions accessories.
 *
 * The listing publishes no product catalogue, brand list or price list, so
 * nothing here is presented as guaranteed stock. Each entry is an enquiry
 * topic and every card routes to WhatsApp to confirm what is available today.
 */

export const accessoryCategories = [
  {
    id: "protection",
    icon: "shield",
    title: "Covers & cases",
    blurb:
      "Back covers and protective cases to keep a new handset safe from day one.",
  },
  {
    id: "glass",
    icon: "screenCrack",
    title: "Screen protection",
    blurb:
      "Screen guards and tempered glass, fitted at the counter so it lines up properly.",
  },
  {
    id: "power",
    icon: "charge",
    title: "Chargers & cables",
    blurb:
      "Chargers and data cables for the common handsets people bring in every day.",
  },
  {
    id: "audio",
    icon: "headphones",
    title: "Earphones & audio",
    blurb:
      "Wired and wireless earphones for calls, music and everything in between.",
  },
  {
    id: "backup",
    icon: "battery",
    title: "Power banks",
    blurb:
      "Portable backup power for long days, travel and load-shedding hours.",
  },
  {
    id: "storage",
    icon: "chip",
    title: "Memory cards & storage",
    blurb:
      "Memory cards and storage extras to give your phone more room.",
  },
];

/** In-store services — all supported by the listing's own categories. */
export const inStoreServices = [
  {
    icon: "smartphone",
    title: "New handset set-up",
    body: "Data transfer, account sign-in and essential apps configured before you leave the store.",
  },
  {
    icon: "swap",
    title: "Exchange & upgrade",
    body: "Bring your current phone and put its value towards your next handset.",
  },
  {
    icon: "shieldCheck",
    title: "Data recovery",
    body: "A service category listed for the shop — helpful when photos or contacts are stuck on a faulty phone.",
  },
  {
    icon: "sliders",
    title: "Personalised advice",
    body: "Tell us your budget and how you use your phone, and get pointed to the handsets that actually fit.",
  },
  {
    icon: "wrench",
    title: "Repairs on site",
    body: "The shop is a dedicated mobile phone repair shop, so faults are handled in store.",
  },
  {
    icon: "tag",
    title: "Current deals",
    body: "The business advertises exclusive deals in store. Message us to hear what is running right now.",
  },
];