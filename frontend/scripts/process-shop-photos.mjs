import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Processes the owner-supplied shop photographs into optimised web assets.
 *
 * Source:  <repo>/shop photo/          (original camera files, 0.5–9 MP)
 * Output:  <repo>/frontend/public/shop-images/
 *
 * Every path below is resolved from THIS FILE's location, not the process CWD,
 * so the pipeline behaves identically whether it is run from the repo root or
 * from frontend/. The owner's originals deliberately stay at the repository
 * root: they are source material, not part of the deployed frontend bundle.
 *
 * For every photo this generates a responsive set of WebP files plus one JPEG
 * fallback, and strips all metadata (EXIF/GPS) so no camera or location data
 * leaks into the published site.
 *
 * Run with:  npm run photos
 *
 * NOTE ON ALT TEXT / CATEGORIES
 * Alt text combines (a) the shop owner's own descriptive filenames and (b) text
 * actually read off the photographs with OCR (see _tools/ocr-shop-photos.txt).
 * Only brand and model names that the OCR returned clearly are named. Nothing
 * here is a guess about what an image shows, and no price, stock level or
 * availability claim is made from a photograph.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url)); // <repo>/frontend/scripts
const FRONTEND = path.resolve(HERE, ".."); // <repo>/frontend
const REPO = path.resolve(FRONTEND, ".."); // <repo>

const SRC = path.join(REPO, "shop photo");
const OUT = path.join(FRONTEND, "public", "shop-images");

/** Output name → source file, category, alt text, caption. */
const PLAN = [
  {
    src: "store photo from inside.jpg",
    out: "smartphonecafe-interior",
    category: "interior",
    alt: "Inside SmartphoneCafe in Talegaon Dabhade: display boards for OPPO, vivo and Samsung Galaxy A14 5G above the counter, with vivo and OPPO posters on the walls",
    caption: "Inside the store",
    // Wide 16:9 interior — the sharpest, most detailed frame in the set, and the
    // one whose display signage is legible enough to confirm it shows genuine
    // retail displays. Used as the hero image.
    hero: true,
    feature: true,
  },
  {
    src: "shop owners photo with customer.jpg",
    out: "smartphonecafe-owner-with-customer",
    category: "store",
    alt: "The SmartphoneCafe owner at the counter with a customer, standing beneath OPPO F19 Pro+ and F19 Pro display boards",
    caption: "Owner and customer at the counter",
    feature: true,
  },
  {
    src: "shop owner with customer 4.jpg",
    out: "smartphonecafe-customer-service",
    category: "store",
    alt: "A customer being served at the SmartphoneCafe counter, with OPPO F19 Pro+, F19 Pro and A54 display boards behind",
    caption: "Serving a customer",
  },
  {
    src: "shop interior 2.jpg",
    out: "smartphonecafe-interior-wide",
    category: "interior",
    alt: "Wide view of the SmartphoneCafe interior, with vivo Y20, Y30 and Y17 display boards along the wall",
    caption: "Shop interior",
  },
  {
    src: "selling items photo.jpg",
    out: "smartphonecafe-products",
    category: "smartphones",
    alt: "Smartphone promotional boards at SmartphoneCafe showing OPPO A53, A15 and A33, vivo V20 and Y-series models, and Bajaj Finserv easy-EMI offers",
    caption: "Phones and offers on display",
  },
  {
    src: "shop owner with customer 3.jpg",
    out: "smartphonecafe-counter-service",
    category: "store",
    alt: "The shop owner assisting a customer at the counter, with OPPO display boards on the wall behind",
    caption: "Helping a customer choose",
  },
  {
    src: "store photo from outside.jpg",
    out: "smartphonecafe-storefront",
    category: "store",
    // The fascia sign reads SMART PHONE CAFE; OPPO branding is visible either
    // side of it. Source is only 732x660 so it is capped, never upscaled.
    alt: "The Smart Phone Cafe shop front on Talegaon Station Road, with the signboard name and OPPO branding",
    caption: "Our shop front on Station Road",
    maxWidth: 732,
  },
  {
    src: "customer with phone.jpg",
    out: "smartphonecafe-customer",
    category: "store",
    alt: "A customer holding a phone at the SmartphoneCafe store, with an OPPO A55 poster behind",
    caption: "A customer with their phone",
  },
  {
    src: "shop owner with customer 2.jpg",
    out: "smartphonecafe-in-store-service",
    category: "store",
    alt: "The shop owner with a customer inside the store, beside a vivo V20 board advertising easy EMIs and 5% cashback",
    caption: "In-store service",
  },
];

const WIDTHS = [2000, 1200, 700];

fs.mkdirSync(OUT, { recursive: true });

const manifest = [];

for (const item of PLAN) {
  const srcPath = path.join(SRC, item.src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`SKIP (missing): ${item.src}`);
    continue;
  }

  const meta = await sharp(srcPath).metadata();
  // Apply EXIF orientation so portrait shots are not sideways.
  const rotated = sharp(srcPath).rotate();
  const rot = await rotated.metadata();
  const srcW = rot.width;
  const srcH = rot.height;

  const cap = item.maxWidth || Math.max(...WIDTHS);
  const widths = WIDTHS.filter((w) => w <= cap).sort((a, b) => a - b); // ascending
  if (!widths.length) widths.push(Math.min(cap, srcW));
  if (srcW < widths[0]) widths.unshift(srcW);

  const variants = [];

  for (const w of widths) {
    const target = Math.min(w, srcW);
    const file = `${item.out}-${target}.webp`;
    await sharp(srcPath)
      .rotate()
      .resize(target, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(OUT, file));

    variants.push({ w: target, src: `/shop-images/${file}` });
  }

  // JPEG fallback at the LARGEST generated width
  const largest = variants.reduce((a, b) => (b.w > a.w ? b : a), variants[0]);
  const jpgFile = `${item.out}-${largest.w}.jpg`;
  await sharp(srcPath)
    .rotate()
    .resize(largest.w, null, { withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(path.join(OUT, jpgFile));

  const fallbackMeta = await sharp(path.join(OUT, jpgFile)).metadata();

  manifest.push({
    ...item,
    width: fallbackMeta.width,
    height: fallbackMeta.height,
    ratio: Number((fallbackMeta.width / fallbackMeta.height).toFixed(3)),
    srcW,
    srcH,
    srcVariants: variants,
    fallback: `/shop-images/${jpgFile}`,
    aspect: `${fallbackMeta.width} / ${fallbackMeta.height}`,
  });

  console.log(
    `${item.src.padEnd(36)} ${String(srcW + "x" + srcH).padEnd(11)} -> ${item.out} (${widths
      .map((v) => Math.min(v, srcW))
      .join(", ")}) + jpg`
  );
}

fs.mkdirSync(path.join(REPO, "_tools"), { recursive: true });
fs.writeFileSync(
  path.join(REPO, "_tools", "shop-images-manifest.json"),
  JSON.stringify(manifest, null, 2)
);

/* ------------------------------------------------------------------ data --
 * Emit the photo data module the app imports. Generating it here means the
 * dimensions, srcsets and file paths can never drift out of sync with the
 * files this script actually produced.
 * ------------------------------------------------------------------------- */

const camel = (s) =>
  s.replace(/^smartphonecafe-/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const entries = manifest.map((m) => ({
  id: camel(m.out),
  src: m.fallback,
  srcset: m.srcVariants.map((v) => `${v.src} ${v.w}w`).join(", "),
  width: m.width,
  height: m.height,
  aspect: m.aspect,
  alt: m.alt,
  caption: m.caption,
  category: m.category,
  feature: !!m.feature,
  hero: !!m.hero,
  srcW: m.srcW,
  srcH: m.srcH,
}));

const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
const gallery = entries.filter((e) => e.id !== "storefront" || true);

const header = `/**
 * SmartphoneCafe shop photographs - GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Produced by frontend/scripts/process-shop-photos.mjs from the owner-supplied
 * originals in <repo>/shop photo/. Re-run \`npm run photos\` after adding or
 * replacing photos.
 *
 * Every image is served as responsive WebP with a JPEG fallback, and all EXIF
 * and GPS metadata has been stripped from the published files.
 *
 * Alt text and captions are based on the shop owner's own descriptive filenames
 * for these photographs.
 */
`;

const body =
  header +
  `\n/** Every processed shop photograph, in the order they appear in the gallery. */\nexport const shopPhotos = ${JSON.stringify(
    gallery,
    null,
    2
  )};\n\n/** Look up a single photo by id. */\nexport const photos = ${JSON.stringify(
    byId,
    null,
    2
  )};\n\nexport const heroPhoto = photos.interior;\nexport const storefrontPhoto = photos.storefront;\n`;

fs.mkdirSync(path.join(FRONTEND, "src", "data"), { recursive: true });
fs.writeFileSync(path.join(FRONTEND, "src", "data", "photos.js"), body);
console.log(`wrote src/data/photos.js (${entries.length} photos)`);

// Report output size
const files = fs.readdirSync(OUT);
let total = 0;
for (const f of files) total += fs.statSync(path.join(OUT, f)).size;

console.log(`\n${files.length} files, ${(total / 1024 / 1024).toFixed(2)} MB total`);
console.log("Manifest: _tools/shop-images-manifest.json");