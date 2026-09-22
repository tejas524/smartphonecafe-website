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

// Each category carries an owner-supplied banner image (public/accessory-images),
// re-encoded to webp from the artwork in public/accessory-image. `image` may be
// missing without breaking the card — the UI falls back to the icon tile.
export const accessoryCategories = [
  {
    id: "protection",
    icon: "shield",
    title: "Mobile covers",
    blurb:
      "Back covers and protective cases to keep a new handset safe from day one.",
    image: "/accessory-images/covers.webp",
    alt: "Mobile covers and cases in a range of styles and colours",
  },
  {
    id: "power",
    icon: "charge",
    title: "Chargers & cables",
    blurb:
      "Chargers and data cables for the common handsets people bring in every day.",
    image: "/accessory-images/chargers-cables.webp",
    alt: "Fast chargers and cables for everyday devices",
  },
  {
    id: "glass",
    icon: "screenCrack",
    title: "Tempered glass",
    blurb:
      "Screen guards and tempered glass, fitted at the counter so it lines up properly.",
    image: "/accessory-images/tempered-glass.webp",
    alt: "Premium tempered glass screen protectors",
  },
  {
    id: "audio",
    icon: "headphones",
    title: "Earphones & audio",
    blurb:
      "Wired and wireless earphones for calls, music and everything in between.",
    image: "/accessory-images/earphones-audio.webp",
    alt: "Earphones and audio accessories",
  },
  {
    id: "backup",
    icon: "battery",
    title: "Power banks",
    blurb:
      "Portable backup power for long days, travel and load-shedding hours.",
    image: "/accessory-images/power-banks.webp",
    alt: "Portable power banks for charging on the go",
  },
  {
    id: "storage",
    icon: "chip",
    title: "More accessories",
    blurb:
      "SIM & memory cards, phone stands, car accessories, cleaning kits and more.",
    image: "/accessory-images/other-accessories.webp",
    alt: "Other accessories including memory cards, stands and cleaning kits",
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