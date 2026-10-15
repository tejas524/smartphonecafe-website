import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(frontend, "public");
const repo = path.dirname(frontend);
const origin = new URL(process.argv[2] || "http://127.0.0.1:4000");
if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname)) {
  throw new Error("Export from the local backend only.");
}
const response = await fetch(new URL("/api/public/bootstrap", origin), {
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`Public API returned ${response.status}`);
const payload = await response.json();
if (!payload.data?.business || !Array.isArray(payload.data.smartphones)) {
  throw new Error("The public API did not return the expected website content.");
}

// The current public catalog uses renamed category artwork. Adapt the snapshot
// without changing local database records. There is no replacement for "other".
const categoryArtwork = {
  "/accessory-images/covers.webp": "/accessories-images/mobile-covers.png",
  "/accessory-images/tempered-glass.webp": "/accessories-images/screen-protection.png",
  "/accessory-images/chargers-cables.webp": "/accessories-images/chargers-cables.png",
  "/accessory-images/earphones-audio.webp": "/accessories-images/earphones-audio.png",
  "/accessory-images/power-banks.webp": "/accessories-images/power-banks.png",
  "/accessory-images/other-accessories.webp": null,
};
function updateArtwork(value) {
  if (typeof value === "string") return Object.hasOwn(categoryArtwork, value) ? categoryArtwork[value] : value;
  if (Array.isArray(value)) return value.map(updateArtwork);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, updateArtwork(entry)]));
  }
  return value;
}
payload.data = updateArtwork(payload.data);

// Copy only uploaded files referenced by the public response, never a DB dump
// or the entire uploads directory (which can contain unpublished images).
const uploads = new Set();
function collect(value) {
  if (typeof value === "string") {
    for (const match of value.matchAll(/\/uploads\/[^\s,]+/g)) uploads.add(match[0]);
  }
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
collect(payload.data);
for (const url of uploads) {
  const relative = decodeURIComponent(new URL(url, origin).pathname).slice(1);
  const source = path.resolve(repo, relative);
  const target = path.resolve(publicDir, relative);
  if (!source.startsWith(path.join(repo, "uploads") + path.sep) ||
      !target.startsWith(path.join(publicDir, "uploads") + path.sep)) {
    throw new Error("Invalid uploaded image path in public content.");
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}
await fs.writeFile(path.join(publicDir, "preview-content.json"),
  JSON.stringify({ data: payload.data }, null, 2) + "\n");
console.log(`Exported public website content and ${uploads.size} uploaded images.`);
