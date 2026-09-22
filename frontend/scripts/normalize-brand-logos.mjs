/**
 * Normalise brand-logo SVGs so they render identically in every browser when
 * used via <img>. Chrome/Edge give an <img>-embedded SVG NO intrinsic size
 * when it has a viewBox but no width/height attributes, which makes CSS
 * height-only sizing unreliable. This adds width/height (from the viewBox) to
 * any logo missing them. It does not touch geometry, colours or anything else.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, "..", "public", "brand-logos");

let changed = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".svg"))) {
  const p = path.join(DIR, file);
  let svg = fs.readFileSync(p, "utf8");
  const open = svg.match(/<svg\b[^>]*>/);
  if (!open) {
    console.log(`SKIP ${file} (no <svg>)`);
    continue;
  }
  const tag = open[0];
  const hasW = /\swidth\s*=/.test(tag);
  const hasH = /\sheight\s*=/.test(tag);
  if (hasW && hasH) {
    console.log(`ok   ${file} (already sized)`);
    continue;
  }
  const vb = tag.match(/viewBox\s*=\s*"([^"]+)"/);
  if (!vb) {
    console.log(`SKIP ${file} (no viewBox)`);
    continue;
  }
  const parts = vb[1].trim().split(/[\s,]+/).map(Number);
  const w = parts[2];
  const h = parts[3];
  if (!(w > 0) || !(h > 0)) {
    console.log(`SKIP ${file} (bad viewBox ${vb[1]})`);
    continue;
  }
  // Insert width/height right after `<svg`
  const newTag = tag.replace(/^<svg\b/, `<svg width="${w}" height="${h}"`);
  svg = svg.replace(tag, newTag);
  fs.writeFileSync(p, svg);
  changed += 1;
  console.log(`FIX  ${file} -> width="${w}" height="${h}"`);
}
console.log(`\n${changed} file(s) updated`);
