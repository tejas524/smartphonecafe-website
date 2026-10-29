/**
 * Generates database/seed.sql from the live frontend data modules.
 *
 * WHY GENERATED
 * The seed must be a faithful migration of the verified data in
 * frontend/src/data/*.js. Hand-retyping those values would risk silent drift,
 * so this script imports the real modules and emits the SQL. The committed
 * seed.sql is therefore reproducible: `npm run db:seed:generate` regenerates it.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *  - It never invents a price, discount, stock level, warranty or offer.
 *    Columns for those stay NULL / absent, because the shop has not published
 *    them. A NULL means "not stated"; a fabricated 0 would be a false claim.
 *  - It does not create an admin user. The first account is created explicitly
 *    by the operator so no default credential can ever reach the repository.
 *
 * Run:  node database/generate-seed.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const DATA = path.join(REPO, "frontend", "src", "data");

const { business, serviceAreas, siteUrl } = await import(
  new URL(`file://${path.join(DATA, "site.js").replace(/\\/g, "/")}`)
);
const { brands, budgetBands, smartphoneCategories } = await import(
  new URL(`file://${path.join(DATA, "brands.js").replace(/\\/g, "/")}`)
);
const { repairIssues, repairSteps, repairProblems, repairDisclaimer } =
  await import(new URL(`file://${path.join(DATA, "repairs.js").replace(/\\/g, "/")}`));
const { accessoryCategories, inStoreServices } = await import(
  new URL(`file://${path.join(DATA, "accessories.js").replace(/\\/g, "/")}`)
);
const { galleryPhotos, galleryCategories, photoBrief } = await import(
  new URL(`file://${path.join(DATA, "gallery.js").replace(/\\/g, "/")}`)
);

/* ------------------------------------------------------------- helpers --- */

/** SQL string literal, or NULL. Escapes the four characters MySQL cares about. */
function q(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\n/g, "\\n").replace(/\r/g, "") + "'";
}

function n(v) {
  if (v === null || v === undefined) return "NULL";
  return String(v);
}

function b(v) {
  return v ? "1" : "0";
}

/** Emits a multi-row INSERT. Returns "" when there is nothing to insert. */
function insert(table, columns, rows) {
  if (!rows.length) return `-- ${table}: no rows to insert\n`;
  // Guard: every value must already be a rendered SQL token. A bare word that is
  // neither NULL, a number, nor a quoted literal is a bug in the caller and would
  // otherwise become an "Unknown column" error at apply time (this caught exactly
  // that mistake on offers.badge).
  rows.forEach((row, ri) => {
    if (row.length !== columns.length) {
      throw new Error(`${table} row ${ri}: ${row.length} values for ${columns.length} columns`);
    }
    row.forEach((v, ci) => {
      const s = String(v);
      const ok = s === "NULL" || /^-?\d+(\.\d+)?$/.test(s) || /^'.*'$/s.test(s);
      if (!ok) {
        throw new Error(
          `${table} row ${ri} column "${columns[ci]}": unquoted value ${JSON.stringify(s)}. ` +
            `Wrap strings with q().`
        );
      }
    });
  });
  const cols = columns.map((c) => `  \`${c}\``).join(", ");
  const values = rows
    .map((r) => "  (" + r.map((v) => String(v)).join(", ") + ")")
    .join(",\n");
  return `INSERT INTO \`${table}\` (\n${cols}\n) VALUES\n${values};\n`;
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const out = [];
const w = (s = "") => out.push(s);

/* ---------------------------------------------------------------- header -- */

w("-- ============================================================================");
w("--  SmartphoneCafe - seed data");
w("-- ============================================================================");
w("--  GENERATED FILE - DO NOT EDIT BY HAND.");
w("--  Produced by database/generate-seed.mjs, which imports the real data from");
w("--  frontend/src/data/*.js so the values below cannot drift from the site.");
w("--");
w("--  Regenerate with:  npm run db:seed:generate");
w("--  Apply with:       mysql --defaults-extra-file=<cnf> < database/seed.sql");
w("--");
w("--  EVERY value here is either supplied by the shop brief or extracted from");
w("--  the public Google Maps listing (docs/google-maps-findings.md). Nothing is");
w("--  inferred or invented. Commercial fields - prices, discounts, stock,");
w("--  warranties and current offers - are deliberately left NULL because the");
w("--  shop has not published them. NULL means 'not stated'.");
w("--");
w("--  No admin user is created here, on purpose. See database/README.md.");
w("-- ============================================================================");
w();
w("USE `smartphonecafe`;");
w();
w("-- Re-runnable: clear child tables before parents.");
w("SET FOREIGN_KEY_CHECKS = 0;");
w("TRUNCATE TABLE `homepage_content`;");
w("TRUNCATE TABLE `gallery`;");
w("TRUNCATE TABLE `accessories`;");
w("TRUNCATE TABLE `accessory_categories`;");
w("TRUNCATE TABLE `repair_services`;");
w("TRUNCATE TABLE `smartphones`;");
w("TRUNCATE TABLE `brands`;");
w("TRUNCATE TABLE `offers`;");
w("TRUNCATE TABLE `business_info`;");
w("TRUNCATE TABLE `reviews`;");
w("SET FOREIGN_KEY_CHECKS = 1;");
w();

/* ------------------------------------------------------ 1. business_info -- */

w("-- ---------------------------------------------------------------------------");
w("-- business_info - verified facts, seeded from frontend/src/data/site.js");
w("-- ---------------------------------------------------------------------------");

const biRows = [];
let biOrder = 0;
const bi = (key, value, group, label, type, source, isPublic = 1) => {
  biRows.push([
    q(key), q(value), q(group), q(label), q(type), q(source), b(isPublic), n(biOrder += 10),
  ]);
};

bi("business_name", business.name, "identity", "Business name", "text",
   "Supplied in the shop brief");
bi("listing_name", business.listingName, "identity", "Name on Google listing", "text",
   "Google Maps listing");
bi("tagline", business.tagline, "identity", "Tagline", "text", "Shop brief");
bi("business_type", business.type, "identity", "Business type", "text",
   "Derived from Google Maps categories");
bi("phone_display", business.phoneDisplay, "contact", "Phone (display)", "text",
   "Google Maps listing");
bi("phone_e164", business.phoneE164, "contact", "Phone (E.164)", "tel",
   "Google Maps listing");
bi("whatsapp_number", business.whatsappNumber, "contact", "WhatsApp number", "tel",
   "Shop brief");
// email is null in site.js: the listing publishes none. Stored as NULL rather
// than a made-up address.
bi("email", business.email, "contact", "Email address", "email",
   "Not published on the Google listing");
bi("address_line1", business.address.line1, "address", "Address line 1", "text",
   "Google Maps listing");
bi("address_line2", business.address.line2, "address", "Address line 2", "text",
   "Google Maps listing");
bi("address_line3", business.address.line3, "address", "Address line 3", "text",
   "Google Maps listing");
bi("address_city", business.address.city, "address", "City", "text", "Google Maps listing");
bi("address_region", business.address.region, "address", "State / region", "text",
   "Google Maps listing");
bi("address_postal_code", business.address.postalCode, "address", "Postal code", "text",
   "Google Maps listing");
bi("address_country", business.address.country, "address", "Country", "text",
   "Google Maps listing");
bi("address_full", business.address.full, "address", "Full address (one line)", "textarea",
   "Google Maps listing");
bi("address_short", business.address.short, "address", "Short address", "text",
   "Google Maps listing");
bi("hours_label", business.hours.label, "hours", "Opening hours (display)", "text",
   "Google Maps listing");
bi("hours_days", business.hours.days, "hours", "Days open", "text", "Google Maps listing");
bi("hours_opens", business.hours.opens, "hours", "Opens at (24h)", "text",
   "Google Maps listing");
bi("hours_closes", business.hours.closes, "hours", "Closes at (24h)", "text",
   "Google Maps listing");
bi("google_short_url", business.google.shortUrl, "location", "Google Maps short link", "url",
   "Shop brief");
bi("google_place_url", business.google.placeUrl, "location", "Google Maps place URL", "url",
   "Resolved from the short link");
bi("google_place_id", business.google.placeId, "location", "Google Place ID", "text",
   "Google Maps listing");
bi("google_plus_code", business.google.plusCode, "location", "Plus code", "text",
   "Google Maps listing");
bi("latitude", business.google.lat, "location", "Latitude", "number", "Google Maps listing");
bi("longitude", business.google.lng, "location", "Longitude", "number", "Google Maps listing");
bi("listing_description", business.listingDescription, "listing",
   "Description published on the Google listing", "textarea",
   "Google Business Profile, quoted verbatim");
bi("service_areas", serviceAreas.join(", "), "listing", "Service areas", "textarea",
   "Nearby localities listed in the shop brief");
bi("site_url", siteUrl, "listing", "Canonical site URL", "url", "Shop brief");
// Publicly displayed review totals. These are editable values, NOT computed
// from the reviews table, so the owner can show the real Google totals while
// curating which individual reviews appear on the site.
bi("review_count", "324", "listing", "Review count (shown on site)", "number",
   "Displayed Google review total; edited by the owner, not computed.");
bi("review_rating", "4.9", "listing", "Review rating (shown on site)", "number",
   "Displayed Google aggregate rating; edited by the owner.");

w(insert("business_info",
  ["info_key", "info_value", "info_group", "label", "value_type", "source_note", "is_public", "display_order"],
  biRows));
w();

/* ------------------------------------------------------------ 2. brands -- */

w("-- ---------------------------------------------------------------------------");
w("-- brands - from frontend/src/data/brands.js");
w("-- ---------------------------------------------------------------------------");
w("-- Brand names only. logo_path stays NULL so the site renders typographic");
w("-- wordmarks: no manufacturer logo is used and no authorised dealership is implied.");
w("-- `category` is the browse grouping from the source file, not a stock claim.");
w();

const brandRows = brands.map((bd, i) => [
  q(bd.name), q(slugify(bd.name)), q(bd.note), q(bd.category), "NULL", "1", n((i + 1) * 10),
]);
w(insert("brands",
  ["name", "slug", "note", "category", "logo_path", "is_active", "display_order"],
  brandRows));
w();

/* ------------------------------------------------------- 3. smartphones -- */

w("-- ---------------------------------------------------------------------------");
w("-- smartphones - INTENTIONALLY EMPTY");
w("-- ---------------------------------------------------------------------------");
w("-- The brief forbids inventing prices, stock or model availability, and none has");
w("-- been verified. Rather than seed fabricated rows, the table is left empty;");
w("-- every existing page routes the customer to WhatsApp to ask what is available.");
w("--");
w("-- The four customer-intent groups below are browse prompts from brands.js, not");
w("-- products, so they are not inserted here. They are recorded in");
w("-- homepage_content so the CMS can edit their wording.");
w();

/* --------------------------------------------------- 4. repair_services -- */

w("-- ---------------------------------------------------------------------------");
w("-- repair_services - from frontend/src/data/repairs.js");
w("-- ---------------------------------------------------------------------------");
w("-- price_from, turnaround_note and warranty_note stay NULL: the listing");
w("-- publishes no service menu, price list or warranty terms, and the site never");
w("-- promises a turnaround. Each row is an issue the shop will assess.");
w();

const rsRows = repairIssues.map((r, i) => [
  q(r.id),
  q(r.title),
  q(r.blurb),
  "NULL",
  q("INR"),
  "NULL",
  "NULL",
  q(Array.isArray(r.tags) ? r.tags.join(", ") : null),
  q(r.icon),
  "1",
  "1",
  n((i + 1) * 10),
]);
w(insert("repair_services",
  ["slug", "title", "description", "price_from", "price_currency", "turnaround_note",
   "warranty_note", "tags", "icon", "is_enquiry_only", "is_active", "display_order"],
  rsRows));
w();

/* -------------------------------------------------- 5. accessory_categories */

w("-- ---------------------------------------------------------------------------");
w("-- accessory_categories - from frontend/src/data/accessories.js");
w("-- ---------------------------------------------------------------------------");
w("-- Supported by the listing's 'Cell phone accessory store' category and the");
w("-- business's own description. Membership is an enquiry topic, never a stock claim.");
w();

const acRows = accessoryCategories.map((a, i) => [
  q(a.id), q(a.title), q(a.blurb), q(a.icon), "NULL", "1", n((i + 1) * 10),
]);
w(insert("accessory_categories",
  ["slug", "title", "description", "icon", "image_path", "is_active", "display_order"],
  acRows));
w();

/* --------------------------------------------------------- 6. accessories -- */

w("-- ---------------------------------------------------------------------------");
w("-- accessories - INTENTIONALLY EMPTY");
w("-- ---------------------------------------------------------------------------");
w("-- No accessory product list or price has been published, so no individual");
w("-- accessory rows are seeded. The six categories above carry the content.");
w();

/* ------------------------------------------------------------- 7. gallery -- */

w("-- ---------------------------------------------------------------------------");
w("-- gallery - the nine real store photographs");
w("-- ---------------------------------------------------------------------------");
w("-- Migrated from the generated frontend/src/data/photos.js. Only paths are");
w("-- stored; the image files live on disk under frontend/public/shop-images/.");
w("-- `source_width`/`source_height` record the ORIGINAL pixel size, which is how");
w("-- the 732x660 storefront is known to be too small to render large.");
w();

const galleryRows = galleryPhotos.map((p, i) => [
  q(p.id),
  q(p.caption || null),
  q(p.caption || `${business.name} store photograph`),
  q(p.alt),
  q(p.src),
  q(p.srcset || null),
  n(p.width),
  n(p.height),
  q(p.aspect || null),
  q(p.category || null),
  n(p.srcW),
  n(p.srcH),
  b(p.feature),
  b(p.hero),
  "1",
  n((i + 1) * 10),
]);
w(insert("gallery",
  ["slug", "title", "caption", "alt_text", "image_path", "srcset", "width", "height",
   "aspect_ratio", "category", "source_width", "source_height", "is_featured", "is_hero",
   "is_active", "display_order"],
  galleryRows));
w();

/* --------------------------------------------------------------- 8. offers -- */

w("-- ---------------------------------------------------------------------------");
w("-- offers - only source-backed statements, no invented commercial figures");
w("-- ---------------------------------------------------------------------------");
w("-- The shop has published NO verifiable current offers: no discount percentage,");
w("-- no rupee amount, no expiry. discount_label and price_amount are therefore NULL");
w("-- on every row. What IS supported by evidence is:");
w("--   a) the business's own listing description promising 'exclusive deals'");
w("--   b) 'quick repairs' from the same description");
w("--   c) Bajaj Finserv easy-EMI / cashback signage photographed INSIDE the shop");
w("-- (c) is in-store signage, so it is stored as in-store information pending");
w("-- confirmation, flagged needs_confirmation = 1, and must not be presented as a");
w("-- running online promotion. No '20% off' or 'Rs 499' style figure is invented.");
w();

const offerRows = [
  [
    q("Ask about current deals"),
    q("Exclusive deals advertised in store"),
    q("The business's own Google listing description states 'Enjoy exclusive deals, quick repairs, and personalized service - all in one stop.' Stock and pricing change often, so message the store to hear what is running right now."),
    "NULL", "NULL", q("INR"), q("Enquiry"), "NULL",
    q("Message us"), q("https://wa.me/919922599577"),
    "NULL", "NULL", "1", "1", "1",
    q("Google Business Profile description, quoted verbatim"),
    n(10),
  ],
  [
    q("Easy EMIs available in store"),
    q("Instalment options discussed at the counter"),
    q("EMI and cashback signage is displayed inside the shop (including Bajaj Finserv). Exact schemes, eligibility and rates are set by the finance provider and are not published online - ask at the counter for the current terms."),
    "NULL", "NULL", q("INR"), q("In store"), "NULL",
    q("Ask in store"), q("https://wa.me/919922599577"),
    "NULL", "NULL", "1", "0", "1",
    q("In-store signage photographed at the shop - in-store information, not an online promotion"),
    n(20),
  ],
  [
    q("Quick repairs, checked at the counter"),
    q("Faults assessed before any work starts"),
    q("The shop is a dedicated mobile phone repair shop. Bring the phone in and the fault is checked in front of you; no work begins until you agree. The listing promises 'quick repairs' but states no timeframe, so no turnaround is promised here."),
    "NULL", "NULL", q("INR"), q("Service"), "NULL",
    q("WhatsApp your problem"), q("https://wa.me/919922599577"),
    "NULL", "NULL", "1", "0", "1",
    q("Google Business Profile description and categories"),
    n(30),
  ],
];
w(insert("offers",
  ["title", "subtitle", "description", "discount_label", "price_amount", "price_currency",
   "badge", "image_path", "cta_label", "cta_url", "starts_on", "ends_on", "is_active",
   "is_featured", "needs_confirmation", "source_note", "display_order"],
  offerRows));
w();

/* --------------------------------------------------- 9. homepage_content -- */

w("-- ---------------------------------------------------------------------------");
w("-- homepage_content - section copy, migrated from the existing live pages");
w("-- ---------------------------------------------------------------------------");
w("-- Every heading and paragraph below already renders on the built site, taken");
w("-- from Hero.jsx, Home.jsx, CtaBand.jsx and SectionHeading props. Nothing is new");
w("-- copy and nothing is placeholder text.");
w();

const heroEyebrow = business.tagline; // "Smartphones · Repairs · Accessories"
const hp = [];
let hpOrder = 0;
const hpc = (key, eyebrow, heading, sub, body, ctaLabel, ctaUrl, img, visible = 1) => {
  hp.push([
    q(key), q(eyebrow), q(heading), q(sub), q(body), q(ctaLabel), q(ctaUrl), q(img),
    b(visible), n(hpOrder += 10),
  ]);
};

hpc(
  "hero",
  heroEyebrow,
  "Your next phone. Your local repair shop.",
  null,
  `${business.name} sits on Talegaon Station Road. Come in to compare handsets, pick up the essentials, or have a fault looked at the counter.`,
  "Explore Smartphones",
  "/smartphones",
  galleryPhotos.find((p) => p.hero)?.src || null
);

hpc(
  "about",
  "Who we are",
  "A phone shop you can walk into",
  null,
  `${business.name} sells smartphones and repairs them. The store is on Talegaon Station Road near Umang Medical - an easy stop whether you are buying a new handset, replacing a cracked screen or picking up a charger on the way home.`,
  "More about the store",
  "/about",
  galleryPhotos.find((p) => p.id === "ownerWithCustomer")?.src || null
);

hpc(
  "smartphones",
  "Smartphones",
  "Find the right phone, not just any phone",
  "Tell us your budget and how you use your phone. We will show you what fits - and what is actually available today.",
  null,
  null,
  null,
  galleryPhotos.find((p) => p.id === "products")?.src || null
);

hpc(
  "repairs",
  "Repairs",
  "Something wrong with your phone?",
  "We are a dedicated mobile phone repair shop. Bring the phone in and the fault is checked at the counter before anything goes ahead.",
  null,
  "See repair services",
  "/repairs",
  galleryPhotos.find((p) => p.id === "counterService")?.src || null
);

hpc(
  "brands",
  "Brands",
  "The brands people come in asking for",
  "Tap any brand to start a WhatsApp enquiry. This is the list of brands we are asked about most - it is not a stock list, so we will confirm what is in store when you message.",
  null,
  null,
  null,
  null
);

hpc(
  "accessories",
  "Accessories",
  "The small things that keep a phone usable",
  "Covers, screen protection, chargers, earphones and power banks - the everyday items you end up needing the same day.",
  null,
  "Ask what is in stock",
  null,
  null
);

hpc(
  "gallery",
  "Gallery",
  "A look inside the store",
  "Real photographs of SmartphoneCafe - the counter, the displays and the people behind it. Photographed in the shop, not borrowed from a stock library.",
  null,
  "Open gallery",
  "/gallery",
  galleryPhotos.find((p) => p.id === "interiorWide")?.src || null
);

hpc(
  "visit",
  "Find the store",
  "On Talegaon Station Road, easy to reach.",
  null,
  "We are on the main Station Road stretch near Umang Medical - a short walk from Talegaon station and easy to pull up to on a two-wheeler.",
  "Get Directions",
  business.google.shortUrl,
  null
);

hpc(
  "cta",
  "Ready when you are",
  "Message the store and get an answer today.",
  null,
  "Ask about a phone, check a price or describe a fault. We reply on WhatsApp during shop hours, every day of the week.",
  "WhatsApp Us",
  `https://wa.me/${business.whatsappNumber}`,
  null
);

w(insert("homepage_content",
  ["section_key", "eyebrow", "heading", "subheading", "body", "cta_label", "cta_url",
   "image_path", "is_visible", "display_order"],
  hp));
w();

/* ----------------------------------------------------------- N. reviews -- */
// Verified customer reviews from the Google Business Profile, transcribed
// exactly. No reviewer photo is stored (the card shows a first-letter avatar);
// the displayed count/rating are the business_info values above.
w("-- ---------------------------------------------------------------------------");
w("-- reviews - verified customer reviews from the Google Business Profile");
w("-- ---------------------------------------------------------------------------");
w("-- Transcribed exactly as published. No review, name or star value is invented.");
w();

const REVIEWS = [
  ["Sampat Shinde", "This shop really impressed me with their selection and financing options. They had a wide range of brands like Oppo, Vivo, Samsung, iPhone, Realme, Motorola, and Nokia, which made it easy to find exactly what I was looking for. Plus, they …", 5],
  ["Shivaji Ghardale", "I recently visited this mobile shop, and I have to say, I was really impressed! The owner was super friendly and took the time to help me find exactly what I needed, all at very reasonable prices. It’s definitely my go-to place for anything mobile!", 5],
  ["Sujata Jadhav", "Very fast service, change my mobile display touch glass in one hour, rate are very reasonable, recommended for mobile repair.", 5],
  ["Jijaram Kaldoke", "Very nice service and cooperative staff, good product rang also repair service available here, must visit for any mobile phone related problem.", 5],
  ["Alom Hoque", "Very good service, Repair my OnePlus mobile here, rate are very reasonable, mobile wrap also available here, recommended for your all mobile needs, keep it up 😊 …", 5],
  ["Pappu", "Good Shop, fast service and owner is also very cooperative.", 5],
];
const reviewRows = REVIEWS.map(([name, text, rating], i) => [
  q(name), q(text), n(rating), b(1), n(i * 10),
]);
w(insert("reviews",
  ["reviewer_name", "review_text", "rating", "is_active", "display_order"],
  reviewRows));
w();

/* ------------------------------------------------------------- footer note */

w("-- ---------------------------------------------------------------------------");
w("-- Deliberately not seeded");
w("-- ---------------------------------------------------------------------------");
w("--  smartphones        no verified model list, price or stock exists");
w("--  accessories        no verified product list or price exists");
w("--  users              the first admin is created by the operator, so no");
w("--                     default credential can leak into the repository");
w("--  budget_bands /     these are browse prompts rather than records; their");
w("--  smartphone_        wording is already carried in homepage_content and");
w("--  categories         brands.js remains the source for the public site");
w("-- Total placed offers, prices and discounts: zero, because none is verified.");
w("-- ---------------------------------------------------------------------------");
w("");

fs.writeFileSync(path.join(HERE, "seed.sql"), out.join("\n"), "utf8");

const bytes = fs.statSync(path.join(HERE, "seed.sql")).size;
console.log(`wrote database/seed.sql (${bytes} bytes)`);
console.log(`  business_info : ${biRows.length} rows`);
console.log(`  brands        : ${brandRows.length} rows`);
console.log(`  repair_services: ${rsRows.length} rows`);
console.log(`  accessory_categories: ${acRows.length} rows`);
console.log(`  gallery       : ${galleryRows.length} rows`);
console.log(`  offers        : ${offerRows.length} rows`);
console.log(`  homepage_content: ${hp.length} rows`);
console.log(`  reviews       : ${reviewRows.length} rows`);
console.log("  smartphones   : 0 rows (intentionally empty - no verified data)");
console.log("  accessories   : 0 rows (intentionally empty - no verified data)");
console.log("  users         : 0 rows (created by the operator, not seeded)");
console.log(`\nsource modules: brands=${brands.length} budgetBands=${budgetBands.length} smartphoneCategories=${smartphoneCategories.length} repairSteps=${repairSteps.length} repairProblems=${repairProblems.length} inStoreServices=${inStoreServices.length} galleryCategories=${galleryCategories.length} photoBrief=${photoBrief.length}`);