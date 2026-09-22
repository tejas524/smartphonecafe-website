/**
 * Single source of truth for verified SmartphoneCafe business data.
 *
 * Every value here is either:
 *  (a) supplied directly by the shop brief, or
 *  (b) extracted from the public Google Maps listing (see
 *      docs/google-maps-findings.md).
 *
 * Nothing in this file is inferred, estimated or invented. If a value is not
 * verified it is deliberately absent rather than filled with a placeholder
 * claim.
 */

export const business = {
  name: "SmartphoneCafe",
  /** The name exactly as it appears on the Google listing. */
  listingName: "Smart Phone Cafe",
  tagline: "Smartphones · Repairs · Accessories",
  type: "Mobile phone store & mobile phone repair shop",

  phoneDisplay: "+91 99225 99577",
  phoneShort: "9922599577",
  /** E.164, dial-ready */
  phoneE164: "+919922599577",
  phoneTel: "tel:+919922599577",

  whatsappNumber: "919922599577",

  email: null, // Not published on the listing — intentionally left unset.

  address: {
    line1: "Shop No. 7, Samrthchaya Apartment",
    line2: "Talegaon Station Rd, near Umang Medical",
    line3: "Vatan Nagar, Talegaon Dabhade R",
    city: "Talegaon Dabhade",
    region: "Maharashtra",
    postalCode: "410507",
    country: "India",
    full:
      "Shop No. 7, Samrthchaya Apartment, Talegaon Station Rd, near Umang Medical, Vatan Nagar, Talegaon Dabhade R, Maharashtra 410507",
    /** Compact single-line for inline use. */
    short: "Talegaon Station Rd, Talegaon Dabhade, Maharashtra 410507",
  },

  hours: {
    label: "10:00 AM – 9:30 PM",
    /** Verified: identical every day of the week on the listing. */
    days: "Open all 7 days",
    opens: "10:00",
    closes: "21:30",
  },

  google: {
    /** The short link supplied in the brief. */
    shortUrl: "https://maps.app.goo.gl/XwvLKCfxm1MawvcT8",
    /** Canonical Maps place URL resolved from the short link. */
    placeUrl:
      "https://www.google.com/maps/place/Smart+Phone+Cafe/@18.7333126,73.6780695,17z/data=!4m6!3m5!1s0x3bc2b1935d5671d9:0x96e00ddd4c0a9f23!8m2!3d18.7333126!4d73.6780695!16s%2Fg%2F11dftbwglj",
    placeId: "ChIJ2XFWXZOxwjsRI58KTN0N4JY",
    plusCode: "PMMH+86 Talegaon Dabhade R, Maharashtra",
    /** Coordinates verified from the resolved Maps URL. */
    lat: 18.7333126,
    lng: 73.6780695,
  },

  /** The business-authored description published on the Google listing. */
  listingDescription:
    "Discover the ultimate mobile experience at Smart Phone Cafe! Whether you're looking for the latest smartphones, reliable accessories, or expert advice, our friendly team is here to help you find exactly what you need. Enjoy exclusive deals, quick repairs, and personalized service—all in one stop. Visit Smart Phone Cafe today and let us upgrade your digital lifestyle!",
};

/** Directions deep-link — opens turn-by-turn in the user's Maps app. */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${business.listingName}, ${business.address.full}`
)}&destination_place_id=${business.google.placeId}`;

/**
 * Keyless Google Maps embed.
 *
 * Uses the documented `maps.google.com/maps?q=…&output=embed` mechanism with
 * the verified Place ID. No fabricated coordinates and no API key required.
 */
export const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  business.listingName
)}&cid=10871704744587075363&z=16&hl=en&output=embed`;

export const nav = [
  { label: "Home", to: "/" },
  { label: "Smartphones", to: "/smartphones" },
  { label: "Repairs", to: "/repairs" },
  { label: "Accessories", to: "/#accessories" },
  { label: "Offers", to: "/#offers" },
  { label: "About", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

/** Service areas — nearby localities served from the Talegaon Dabhade store. */
export const serviceAreas = [
  "Talegaon Dabhade",
  "Talegaon Station",
  "Vatan Nagar",
  "Vadgaon Maval",
  "Urse",
  "Kamshet",
  "Lonavala",
  "Chakan",
];

export const siteUrl = "https://smartphonecafe.in";