/**
 * Secure image uploads.
 *
 * SECURITY MODEL
 *  1. Multer buffers to MEMORY, never to a user-named path. The filename is
 *     therefore never used to build a filesystem path, which removes path
 *     traversal and null-byte tricks entirely.
 *  2. The bytes are handed to sharp, which DECODES the image. A file that is
 *     not a real image fails to decode and is rejected - so a renamed .exe or a
 *     .php script cannot be stored, regardless of its extension or MIME claim.
 *  3. Only an allow-list of decoded formats is accepted.
 *  4. sharp re-encodes every image. Re-encoding discards EXIF, GPS, XMP and ICC
 *     metadata and neutralises embedded payloads (polyglot files) as a side
 *     effect of the pixels being rewritten.
 *  5. The output filename is generated here from a timestamp plus a random
 *     suffix. No part of the client filename is preserved.
 *  6. Dimension limits stop a decompression bomb (a small file that expands to
 *     an enormous bitmap and exhausts memory).
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import config from "../config/env.js";
import { badRequest, payloadTooLarge, unsupportedMedia } from "../lib/errors.js";
import { slugify } from "../lib/validate.js";

// Avoid retaining libvips' operation cache between admin uploads. A single
// native worker and one active image keep simultaneous decodes from multiplying
// memory use on small hosts. Image dimensions, quality and validation stay intact.
sharp.cache(false);
sharp.concurrency(1);

let imageTurn = Promise.resolve();

/** Formats sharp can decode AND that are sensible for a shop website. */
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "tiff", "heif"]);

/** Formats the pipeline writes. */
const OUTPUT_FORMAT = "webp";

/** Subdirectories inside UPLOAD_DIR. A fixed allow-list, never client-supplied. */
export const UPLOAD_BUCKETS = {
  gallery: "gallery",
  smartphones: "smartphones",
  accessories: "accessories",
  offers: "offers",
  brands: "brands",
  "repair-services": "repairs",
  "accessory-categories": "accessories",
  "business-info": "misc",
  "homepage-content": "homepage",
};

export function bucketFor(resourceKey) {
  return UPLOAD_BUCKETS[resourceKey] || "misc";
}

/** Resolves a bucket to an absolute directory, refusing anything outside the root. */
export function bucketDir(bucket) {
  const safe = /^[a-z0-9-]+$/i.test(bucket) ? bucket : "misc";
  const dir = path.resolve(config.uploads.dir, safe);
  const root = path.resolve(config.uploads.dir);
  // Defence in depth: even though `safe` is already constrained, re-verify that
  // the resolved path is genuinely inside the upload root.
  if (dir !== root && !dir.startsWith(root + path.sep)) {
    throw badRequest("Invalid upload destination.");
  }
  return dir;
}

export async function ensureUploadDirs() {
  await fsp.mkdir(path.resolve(config.uploads.dir), { recursive: true });
  for (const bucket of new Set(Object.values(UPLOAD_BUCKETS))) {
    await fsp.mkdir(bucketDir(bucket), { recursive: true });
  }
}

/**
 * Multer in memory mode. `files: 1` because every resource stores a single
 * image_path column.
 */
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.uploads.maxBytes,
    files: 1,
    // Reject unexpected multipart fields early.
    fields: 60,
    fieldSize: 1024 * 100,
  },
  fileFilter(_req, file, cb) {
    // A first cheap gate on the declared MIME type. This is NOT trusted as the
    // real check - sharp decoding below is what actually decides.
    const declaredOk = /^image\//i.test(file.mimetype || "");
    if (!declaredOk) {
      return cb(
        unsupportedMedia(
          `Only image uploads are accepted (received "${file.mimetype || "unknown"}").`
        )
      );
    }
    return cb(null, true);
  },
}).single("image");

/**
 * Decodes, validates and re-encodes an uploaded buffer.
 *
 * @param {Buffer} buffer
 * @param {object} opts
 * @param {string} opts.bucket        destination bucket key
 * @param {string} [opts.baseName]    human name used for the readable part
 * @returns {Promise<{path: string, width: number, height: number, srcset: string,
 *                    bytes: number, format: string, variants: object[]}>}
 */
export async function processImage(buffer, { bucket, baseName = "image" } = {}) {
  const previous = imageTurn;
  let release;
  imageTurn = new Promise((resolve) => { release = resolve; });
  await previous;
  try {
    return await processImageNow(buffer, { bucket, baseName });
  } finally {
    // A rejected/corrupt upload must never block the next image.
    release();
  }
}

async function processImageNow(buffer, { bucket, baseName }) {
  if (!buffer || !buffer.length) {
    throw badRequest("No image data was received.");
  }

  let meta;
  try {
    // `failOn` makes libvips reject a truncated or corrupt image rather than
    // emitting a half-decoded result.
    meta = await sharp(buffer, { failOn: "error", limitInputPixels: config.uploads.maxPixels }).metadata();
  } catch (err) {
    throw unsupportedMedia(
      "That file could not be read as an image. Please upload a JPEG, PNG, WebP or AVIF file.",
      { reason: String(err.message || "").slice(0, 120) }
    );
  }

  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw unsupportedMedia(
      `Unsupported image format "${meta.format || "unknown"}". ` +
        `Allowed: ${[...ALLOWED_FORMATS].join(", ")}.`
    );
  }
  if (!meta.width || !meta.height) {
    throw unsupportedMedia("The image has no readable dimensions.");
  }

  const bucketPath = bucketDir(bucket);
  await fsp.mkdir(bucketPath, { recursive: true });

  const readable = (slugify(baseName) || "image").slice(0, 60);
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const random = crypto.randomBytes(4).toString("hex");
  const stem = `${readable}-${stamp}-${random}`;

  const variants = [];
  const written = [];

  try {
    for (const width of config.uploads.widths) {
      // Never upscale: a 732px-wide source must not be blown up to 2000px, which
      // would only add bytes and blur. Skip widths above the source width.
      if (width > meta.width) continue;

      const filename = `${stem}-${width}.${OUTPUT_FORMAT}`;
      const target = path.join(bucketPath, filename);

      // `withoutEnlargement` is a second guard for the same rule.
      const info = await sharp(buffer, { failOn: "error", limitInputPixels: config.uploads.maxPixels })
        .rotate() // apply EXIF orientation, then the metadata is dropped below
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 82, effort: 4 })
        .toFile(target);

      written.push(target);
      variants.push({
        width: info.width,
        height: info.height,
        bytes: info.size,
        filename,
        url: `/uploads/${path.basename(bucketPath)}/${filename}`,
      });
    }

    // A source narrower than every configured width still needs one output.
    if (!variants.length) {
      const filename = `${stem}-${meta.width}.${OUTPUT_FORMAT}`;
      const target = path.join(bucketPath, filename);
      const info = await sharp(buffer, { failOn: "error", limitInputPixels: config.uploads.maxPixels })
        .rotate()
        .resize({ width: meta.width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 82, effort: 4 })
        .toFile(target);
      written.push(target);
      variants.push({
        width: info.width,
        height: info.height,
        bytes: info.size,
        filename,
        url: `/uploads/${path.basename(bucketPath)}/${filename}`,
      });
    }
  } catch (err) {
    // Clean up anything already written so a failed upload leaves no litter.
    await Promise.all(written.map((f) => fsp.rm(f, { force: true }).catch(() => {})));
    throw err;
  }

  // Largest first, so srcset is ordered the way browsers prefer.
  variants.sort((a, b) => b.width - a.width);
  const primary = variants[0];

  const srcset = variants
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");

  return {
    path: primary.url,
    width: primary.width,
    height: primary.height,
    aspect_ratio: `${primary.width} / ${primary.height}`,
    srcset,
    bytes: primary.bytes,
    format: OUTPUT_FORMAT,
    // Reported for transparency: the original's pixel size before resizing.
    source_width: meta.width,
    source_height: meta.height,
    variants,
  };
}

/**
 * Deletes a previously stored upload.
 *
 * Only paths under /uploads/ are accepted, and the resolved path is re-checked
 * against the upload root, so a crafted value such as
 * "../../backend/.env" cannot be used to delete an arbitrary file.
 */
export async function deleteUploaded(publicPath) {
  if (!publicPath || typeof publicPath !== "string") return false;
  if (!publicPath.startsWith("/uploads/")) return false;

  const relative = publicPath.replace(/^\/uploads\//, "");
  const target = path.resolve(config.uploads.dir, relative);
  const root = path.resolve(config.uploads.dir);

  if (!target.startsWith(root + path.sep)) {
    return false;
  }
  try {
    await fsp.unlink(target);
    return true;
  } catch {
    return false;
  }
}

/** Lists stored files, for the uploads listing endpoint. */
export async function listUploads(bucket) {
  const dir = bucketDir(bucket);
  if (!fs.existsSync(dir)) return [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const full = path.join(dir, entry.name);
    const stat = await fsp.stat(full);
    files.push({
      filename: entry.name,
      url: `/uploads/${path.basename(dir)}/${entry.name}`,
      bytes: stat.size,
      modified: stat.mtime.toISOString(),
    });
  }
  return files.sort((a, b) => b.modified.localeCompare(a.modified));
}

export default { uploadSingle, processImage, ensureUploadDirs, deleteUploaded };
