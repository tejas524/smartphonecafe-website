import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(frontend, "public");
const out = path.join(publicDir, "optimized-images");
await fs.mkdir(out, { recursive: true });
const manifestPath = path.join(frontend, "src/data/image-variants.json");
let previous = {};
try { previous = JSON.parse(await fs.readFile(manifestPath, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const manifest = {};
for (const folder of ["offers-images", "product-images", "accessories-images"]) {
  for (const name of (await fs.readdir(path.join(publicDir, folder))).sort()) {
    if (!/\.png$/i.test(name)) continue;
    const input = await fs.readFile(path.join(publicDir, folder, name));
    const source = `/${folder}/${name}`;
    const sourceHash = createHash("sha256").update(input).digest("hex");
    if (previous[source]?.sourceHash === sourceHash) {
      const filesExist = await Promise.all(previous[source].variants.map(v =>
        fs.access(path.join(publicDir, v.src.slice(1))).then(() => true, () => false)));
      if (filesExist.every(Boolean)) { manifest[source] = previous[source]; continue; }
    }
    const meta = await sharp(input).metadata();
    const widths = folder === "product-images" ? [320, 640, 960] : [480, 960, 1600];
    const variants = [];
    for (const width of widths.filter(w => w <= meta.width)) {
      const buffer = await sharp(input).resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, alphaQuality: 100, effort: 6 }).toBuffer();
      const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
      const slug = path.parse(name).name.replace(/[^a-z0-9-]/gi, "-");
      const filename = `${folder}-${slug}-${width}-${hash}.webp`;
      await fs.writeFile(path.join(out, filename), buffer);
      variants.push({ src: `/optimized-images/${filename}`, width, bytes: buffer.length });
    }
    if (!variants.length) continue;
    manifest[source] = {
      sourceHash,
      src: variants.find(v => v.width >= 960)?.src || variants.at(-1).src,
      srcSet: variants.map(v => `${v.src} ${v.width}w`).join(", "),
      width: meta.width, height: meta.height, variants,
    };
  }
}
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Generated responsive WebP images for ${Object.keys(manifest).length} assets.`);
