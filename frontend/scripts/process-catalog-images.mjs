/**
 * Process owner-supplied catalog imagery into clean, web-optimised local assets.
 *
 * Inputs (owner-supplied, kept untouched):
 *   public/smartphone-images/*   official product renders
 *   public/accessory-image/*     accessory category banners
 *
 * Outputs (generated, safe to delete + regenerate):
 *   public/product-images/<slug>.webp     phone renders, contained, no upscaling
 *   public/accessory-images/<slug>.webp   category banners, re-encoded to webp
 *
 * This only re-encodes/rescales; it never composites, combines or invents
 * content. Offer banners are intentionally NOT processed here — they are used
 * exactly as supplied per the brief.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(HERE, "..", "public");
// Raw owner uploads live outside public/ so they are never served or copied
// into the build; only the processed outputs below ship.
const SRC = path.resolve(HERE, "..", "catalog-src");

const products = [
  { slug: "iphone-16", src: "iphone-16-finish-select-202409-6-1inch_AV1.webp" },
  { slug: "galaxy-s26-fe", src: "in-galaxy-s26-fe-sm-s741-sm-s741blgcins-thumb-554411440.avif" },
  { slug: "motorola-edge-60", src: "0veg5y4aeufycq5soj0hy9vgxn6op9585371.avif" },
  { slug: "redmi-note-14", src: "7c9ac30b8bfe2a6d2a02cdba118b29f8.webp" },
  { slug: "oppo-reno-16-5g", src: "P99xffyVRxqU4CrC.webp" },
];

const accessories = [
  { slug: "covers", src: "ChatGPT Image Sep 23, 2026, 12_12_46 AM.png" },
  { slug: "chargers-cables", src: "53933bd3-0deb-4888-bde2-bcb3957c6719.png" },
  { slug: "tempered-glass", src: "ChatGPT Image Sep 23, 2026, 12_15_24 AM.png" },
  { slug: "earphones-audio", src: "ChatGPT Image Sep 23, 2026, 12_17_09 AM.png" },
  { slug: "power-banks", src: "ChatGPT Image Sep 23, 2026, 12_18_35 AM.png" },
  { slug: "other-accessories", src: "ChatGPT Image Sep 23, 2026, 12_20_04 AM.png" },
];

async function run() {
  const outProd = path.join(PUB, "product-images");
  const outAcc = path.join(PUB, "accessory-images");
  fs.mkdirSync(outProd, { recursive: true });
  fs.mkdirSync(outAcc, { recursive: true });

  const report = { products: [], accessories: [] };

  // Phone renders: contain within 900px longest side, NEVER upscale, keep alpha.
  for (const p of products) {
    const inPath = path.join(SRC, "smartphone-images", p.src);
    if (!fs.existsSync(inPath)) {
      console.log(`MISSING product source: ${p.src}`);
      continue;
    }
    const meta = await sharp(inPath).metadata();
    const longest = Math.max(meta.width, meta.height);
    const target = Math.min(900, longest); // no upscaling
    const outPath = path.join(outProd, `${p.slug}.webp`);
    await sharp(inPath)
      .resize({ width: target, height: target, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(outPath);
    const om = await sharp(outPath).metadata();
    report.products.push({ slug: p.slug, srcW: meta.width, srcH: meta.height, outW: om.width, outH: om.height, bytes: fs.statSync(outPath).size });
    console.log(`product ${p.slug}: ${meta.width}x${meta.height} -> ${om.width}x${om.height} (${(fs.statSync(outPath).size / 1024).toFixed(0)}kb)`);
  }

  // Accessory banners: cap width at 1400, re-encode to webp (content unchanged).
  for (const a of accessories) {
    const inPath = path.join(SRC, "accessory-image", a.src);
    if (!fs.existsSync(inPath)) {
      console.log(`MISSING accessory source: ${a.src}`);
      continue;
    }
    const meta = await sharp(inPath).metadata();
    const outPath = path.join(outAcc, `${a.slug}.webp`);
    await sharp(inPath)
      .resize({ width: Math.min(1400, meta.width), withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    const om = await sharp(outPath).metadata();
    report.accessories.push({ slug: a.slug, srcW: meta.width, srcH: meta.height, outW: om.width, outH: om.height, bytes: fs.statSync(outPath).size });
    console.log(`accessory ${a.slug}: ${meta.width}x${meta.height} -> ${om.width}x${om.height} (${(fs.statSync(outPath).size / 1024).toFixed(0)}kb)`);
  }

  fs.writeFileSync(path.join(HERE, "catalog-images.report.json"), JSON.stringify(report, null, 2));
  console.log("\ndone");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
