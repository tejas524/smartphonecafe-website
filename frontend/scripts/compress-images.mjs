import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

// Compress deployed assets, keeping URLs, dimensions and transparency intact.
// Camera/source folders and the backend's runtime uploads are never modified.
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(frontend, "public");
const backupRoot = path.resolve(frontend, "../_tools/image-compression");
const reportPath = path.join(backupRoot, "latest.json");
const run = new Date().toISOString().replace(/[:.]/g, "-");
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
let previous = { files: {} };
try { previous = JSON.parse(await fs.readFile(reportPath, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const report = { run, beforeBytes: 0, afterBytes: 0, changed: 0, files: {} };

const entries = (await fs.readdir(publicDir, { recursive: true })).sort();
for (const relative of entries) {
  // These files have content hashes in their names and are generated separately.
  if (relative.split(path.sep)[0] === "optimized-images") continue;
  if (!/\.(png|jpe?g|webp|avif)$/i.test(relative)) continue;
  const file = path.join(publicDir, relative);
  const input = await fs.readFile(file);
  const inputHash = hash(input);
  const old = previous.files[relative];
  report.beforeBytes += input.length;

  // Avoid degrading images again when this command is run repeatedly.
  if (old?.outputHash === inputHash) {
    report.afterBytes += input.length;
    report.files[relative] = old;
    continue;
  }
  const meta = await sharp(input).metadata();
  if ((meta.pages || 1) > 1) throw new Error(`Animated image requires separate handling: ${relative}`);
  let pipeline = sharp(input);
  if (meta.format === "png") {
    pipeline = pipeline.png({ palette: true, quality: 90, effort: 10, dither: 0.5, compressionLevel: 9 });
  } else if (meta.format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  } else if (meta.format === "webp") {
    pipeline = pipeline.webp({ quality: 80, alphaQuality: 100, effort: 6 });
  } else if (meta.format === "avif") {
    pipeline = pipeline.avif({ quality: 55, effort: 6 });
  } else {
    throw new Error(`Unsupported format for ${relative}: ${meta.format}`);
  }
  let candidate = await pipeline.toBuffer();
  // PNG palette optimisation can discard an unused alpha channel. Keep icon
  // channel structure too, using lossless compression in that case.
  if (meta.format === "png" && meta.hasAlpha && !(await sharp(candidate).metadata()).hasAlpha) {
    candidate = await sharp(input).png({ palette: false, compressionLevel: 9, effort: 10 }).toBuffer();
  }
  const output = candidate.length < input.length ? candidate : input;
  // Decode the complete output, then check its geometry and alpha channel.
  await sharp(output).raw().toBuffer();
  const result = await sharp(output).metadata();
  if (result.width !== meta.width || result.height !== meta.height ||
      result.format !== meta.format || (meta.hasAlpha && !result.hasAlpha)) {
    throw new Error(`Image properties changed unexpectedly: ${relative}`);
  }
  if (output !== input) {
    const backup = path.join(backupRoot, run, relative);
    await fs.mkdir(path.dirname(backup), { recursive: true });
    await fs.writeFile(backup, input);
    await fs.writeFile(file, output);
    report.changed++;
  }
  report.afterBytes += output.length;
  report.files[relative] = {
    originalBytes: input.length, bytes: output.length,
    width: meta.width, height: meta.height, format: meta.format,
    outputHash: hash(output),
  };
  console.log(`${relative}: ${input.length} -> ${output.length} bytes`);
}
await fs.mkdir(backupRoot, { recursive: true });
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  images: Object.keys(report.files).length, changed: report.changed,
  beforeBytes: report.beforeBytes, afterBytes: report.afterBytes,
  reduction: `${(100 * (1 - report.afterBytes / report.beforeBytes)).toFixed(1)}%`,
  backups: backupRoot,
}, null, 2));
