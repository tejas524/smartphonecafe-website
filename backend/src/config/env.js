/**
 * Environment configuration.
 *
 * Loads backend/.env, validates it, and exports a frozen config object.
 *
 * SECURITY RULES APPLIED HERE
 *  - backend/.env is never committed (see .gitignore) and its values are never
 *    logged. Validation errors name the offending KEY but never echo a value,
 *    so a malformed password cannot leak into a log or a 500 response.
 *  - Required values are checked at startup so the server fails loudly instead
 *    of running with a silently missing secret.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** <repo>/backend */
export const BACKEND_ROOT = path.resolve(HERE, "..", "..");
/** <repo> */
export const REPO_ROOT = path.resolve(BACKEND_ROOT, "..");

const ENV_PATH = path.join(BACKEND_ROOT, ".env");
const envFileExists = fs.existsSync(ENV_PATH);

if (envFileExists) {
  // `quiet` suppresses dotenv's promotional banner on recent versions.
  dotenv.config({ path: ENV_PATH, quiet: true });
}

const problems = [];

function required(key, { minLength = 1 } = {}) {
  const raw = process.env[key];
  if (raw === undefined || String(raw).trim() === "") {
    problems.push(`${key} is missing`);
    return "";
  }
  const value = String(raw).trim();
  if (value.length < minLength) {
    problems.push(`${key} must be at least ${minLength} characters (value not shown)`);
  }
  return value;
}

function optional(key, fallback) {
  const raw = process.env[key];
  if (raw === undefined || String(raw).trim() === "") return fallback;
  return String(raw).trim();
}

function integer(key, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = optional(key, String(fallback));
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    problems.push(`${key} must be a whole number (got a non-numeric value)`);
    return fallback;
  }
  if (n < min || n > max) {
    problems.push(`${key} must be between ${min} and ${max}`);
    return fallback;
  }
  return n;
}

const nodeEnv = optional("NODE_ENV", "development");
const isProduction = nodeEnv === "production";

// ---------------------------------------------------------------- database --
const db = {
  host: required("DB_HOST"),
  port: integer("DB_PORT", 3306, { min: 1, max: 65535 }),
  user: required("DB_USER"),
  password: required("DB_PASSWORD"),
  database: required("DB_NAME"),
  connectionLimit: integer("DB_POOL_SIZE", 3, { min: 1, max: 20 }),
};

// -------------------------------------------------------------------- auth --
const jwtSecret = required("JWT_SECRET", { minLength: 32 });
if (jwtSecret && /^(replace|changeme|secret|your_)/i.test(jwtSecret)) {
  problems.push(
    "JWT_SECRET still looks like the .env.example placeholder; generate a real random value"
  );
}

const auth = {
  jwtSecret,
  sessionHours: integer("SESSION_HOURS", 12, { min: 1, max: 24 * 30 }),
  bcryptRounds: integer("BCRYPT_ROUNDS", 12, { min: 10, max: 15 }),
  cookieName: optional("SESSION_COOKIE_NAME", "sc_session"),
};

// ----------------------------------------------------------------- server ---
const server = {
  port: integer("PORT", 4000, { min: 1, max: 65535 }),
  nodeEnv,
  isProduction,
  frontendUrl: optional("FRONTEND_URL", "http://localhost:5173"),
  // Public canonical origin used to build absolute URLs in robots.txt and
  // sitemap.xml. Must be the real production HTTPS origin in production; the
  // dev default is only a placeholder. No trailing slash.
  publicSiteUrl: optional("PUBLIC_SITE_URL", "http://localhost:5173").replace(/\/+$/, ""),
  // Comma-separated list, so both the dev origin and a deployed origin can be
  // allowed at once without a code change.
  allowedOrigins: optional("FRONTEND_URL", "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

// ---------------------------------------------------------------- uploads ---
const uploadDirRaw = optional("UPLOAD_DIR", "../uploads");
const uploadDir = path.isAbsolute(uploadDirRaw)
  ? uploadDirRaw
  : path.resolve(BACKEND_ROOT, uploadDirRaw);

const uploads = {
  dir: uploadDir,
  maxBytes: integer("MAX_UPLOAD_MB", 5, { min: 1, max: 25 }) * 1024 * 1024,
  maxPixels: integer("MAX_UPLOAD_PIXELS", 40, { min: 1, max: 100 }) * 1_000_000,
  // Widths written for each upload, mirroring the frontend photo pipeline.
  widths: [2000, 1200, 700],
};

// ------------------------------------------------------------------ checks --

if (isProduction) {
  try {
    const origin = new URL(server.publicSiteUrl);
    if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) throw new Error();
  } catch {
    problems.push("PUBLIC_SITE_URL must be an HTTPS origin without credentials or a path in production");
  }
}

if (problems.length) {
  const lines = problems.map((p) => `  - ${p}`).join("\n");
  throw new Error(
    `Invalid backend configuration in ${ENV_PATH}` +
      (envFileExists ? "" : " (file not found)") +
      `:\n${lines}\n\n` +
      `Copy backend/.env.example to backend/.env and fill it in.\n` +
      `No secret value is ever printed.`
  );
}

// Fail fast in production if the cookie would not be Secure.
if (isProduction && !optional("FRONTEND_URL", "").startsWith("https://")) {
  // Not fatal: the operator may terminate TLS at a proxy. Warn instead.
  console.warn(
    "[config] NODE_ENV=production but FRONTEND_URL is not https. " +
      "Session cookies will be marked Secure regardless."
  );
}

export const config = Object.freeze({
  envFileExists,
  envPath: ENV_PATH,
  db: Object.freeze(db),
  auth: Object.freeze(auth),
  server: Object.freeze(server),
  uploads: Object.freeze(uploads),
});

export default config;
