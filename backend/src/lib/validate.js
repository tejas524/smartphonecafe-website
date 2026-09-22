/**
 * Input validation and sanitisation.
 *
 * DESIGN
 *  - Unknown fields are REJECTED, not silently dropped. Silently ignoring a
 *    misspelled field is how a CMS loses an editor's work without telling them.
 *  - Every value is coerced to the exact type the column expects, so the driver
 *    never has to guess.
 *  - Text is trimmed and control characters are stripped. HTML is NOT escaped
 *    on write: the API stores what the editor typed, and the frontend escapes on
 *    render. Escaping on write would double-encode on the next edit.
 *  - `toString`-able objects are rejected outright, so a payload of
 *    {"$gt":""} or {"constructor":{}} cannot masquerade as a string.
 */

import { badRequest } from "./errors.js";

/** 4-byte-safe slug from a human title. */
export function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190);
}

/** Removes control characters that would corrupt a log or a CSV export. */
function stripControl(value) {
  // Keep tab and newline (legitimate in textarea content); drop the rest.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function ensurePrimitive(value, field) {
  if (value === null) return null;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") return value;
  if (Array.isArray(value)) {
    throw badRequest(`Field "${field}" must be a single value, not an array.`);
  }
  if (t === "object") {
    throw badRequest(
      `Field "${field}" must be a single value, not an object.`
    );
  }
  throw badRequest(`Field "${field}" has an unsupported type.`);
}

/* --------------------------------------------------------------- coercers -- */

function toOutputString(value, field, def) {
  const prim = ensurePrimitive(value, field);
  if (prim === null) return null;
  if (typeof prim === "boolean") {
    return prim ? "1" : "0";
  }
  let s = stripControl(String(prim)).trim();
  if (def.max && s.length > def.max) {
    throw badRequest(
      `Field "${field}" is too long: ${s.length} characters, maximum ${def.max}.`
    );
  }
  // Reject a NUL or lone surrogate that survived stripping.
  if (s.includes("\uFFFD")) {
    throw badRequest(`Field "${field}" contains invalid characters.`);
  }
  if (s === "") return def.allowEmpty ? "" : null;
  return s;
}

function toInteger(value, field, def) {
  const prim = ensurePrimitive(value, field);
  if (prim === null || prim === "") return null;
  if (typeof prim === "boolean") return prim ? 1 : 0;
  const s = String(prim).trim();
  if (!/^-?\d+$/.test(s)) {
    throw badRequest(`Field "${field}" must be a whole number.`);
  }
  const n = Number.parseInt(s, 10);
  if (!Number.isSafeInteger(n)) {
    throw badRequest(`Field "${field}" is out of the supported range.`);
  }
  if (def.min !== undefined && n < def.min) {
    throw badRequest(`Field "${field}" must be at least ${def.min}.`);
  }
  if (def.max !== undefined && n > def.max) {
    throw badRequest(`Field "${field}" must be at most ${def.max}.`);
  }
  return n;
}

function toDecimal(value, field, def) {
  const prim = ensurePrimitive(value, field);
  if (prim === null || prim === "") return null;
  if (typeof prim === "boolean") {
    throw badRequest(`Field "${field}" must be a number.`);
  }
  const s = String(prim).trim();
  // Accept an optional sign, digits, and up to two decimal places. Rejecting
  // NaN/Infinity/exponent form here keeps DECIMAL(10,2) from silently rounding.
  if (!/^-?\d+(\.\d{1,2})?$/.test(s)) {
    throw badRequest(
      `Field "${field}" must be a number with at most two decimal places.`
    );
  }
  const n = Number(s);
  if (!Number.isFinite(n)) {
    throw badRequest(`Field "${field}" must be a finite number.`);
  }
  if (def.min !== undefined && n < def.min) {
    throw badRequest(`Field "${field}" must be at least ${def.min}.`);
  }
  if (def.max !== undefined && n > def.max) {
    throw badRequest(`Field "${field}" must be at most ${def.max}.`);
  }
  // Return the normalised string: mysql2 sends it verbatim to INNODB's DECIMAL.
  return n.toFixed(2);
}

function toBoolean(value, field) {
  const prim = ensurePrimitive(value, field);
  if (prim === null || prim === "") return null;
  if (typeof prim === "boolean") return prim ? 1 : 0;
  const s = String(prim).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return 1;
  if (["0", "false", "no", "off"].includes(s)) return 0;
  throw badRequest(`Field "${field}" must be true or false.`);
}

function toDate(value, field) {
  const prim = ensurePrimitive(value, field);
  if (prim === null || prim === "") return null;
  const s = String(prim).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw badRequest(`Field "${field}" must be a date in YYYY-MM-DD format.`);
  }
  const [y, m, d] = s.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  // Catches 2025-02-31 and similar values that a regex alone would allow.
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    throw badRequest(`Field "${field}" is not a real calendar date.`);
  }
  return s;
}

/* ----------------------------------------------------------------- public -- */

/**
 * Validates and coerces a request body against a resource definition.
 *
 * @param {object} resource  entry from db/resources.js
 * @param {object} body      parsed JSON body
 * @param {{partial?: boolean}} opts  partial=true for PATCH-style updates
 * @returns {{values: object, skipped: string[]}}
 */
export function validateBody(resource, body, { partial = false } = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("Request body must be a JSON object.");
  }

  const columns = resource.columns;
  const values = {};
  const skipped = [];
  const errors = [];

  // Reject unknown keys. This is deliberate: a typo should be reported, not
  // silently discarded.
  const unknown = Object.keys(body).filter((k) => !(k in columns));
  if (unknown.length) {
    throw badRequest(
      `Unknown field${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}.`,
      { unknown, allowed: Object.keys(columns) }
    );
  }

  for (const [field, raw] of Object.entries(body)) {
    const def = columns[field];

    if (def.editable === false) {
      // id / created_at / updated_at / generated slugs are server-owned.
      skipped.push(field);
      continue;
    }

    try {
      let out;
      switch (def.type) {
        case "string":
        case "text":
          out = toOutputString(raw, field, def);
          break;
        case "int":
          out = toInteger(raw, field, def);
          break;
        case "decimal":
          out = toDecimal(raw, field, def);
          break;
        case "bool":
          out = toBoolean(raw, field);
          break;
        case "date":
          out = toDate(raw, field);
          break;
        case "enum": {
          const s = toOutputString(raw, field, def);
          if (s !== null && !def.values.includes(s)) {
            errors.push({
              field,
              message: `must be one of: ${def.values.join(", ")}`,
            });
            continue;
          }
          out = s;
          break;
        }
        default:
          errors.push({ field, message: "has an unsupported column type" });
          continue;
      }

      if (out === null && def.required && !partial) {
        errors.push({ field, message: "is required" });
        continue;
      }
      values[field] = out;
    } catch (err) {
      if (err && err.expected) {
        errors.push({ field, message: err.message });
      } else {
        throw err;
      }
    }
  }

  // Required-field check for fields the client omitted entirely.
  if (!partial) {
    for (const [field, def] of Object.entries(columns)) {
      if (def.required && def.editable !== false && !(field in values)) {
        // Not already reported above.
        if (!errors.some((e) => e.field === field)) {
          errors.push({ field, message: "is required" });
        }
      }
    }
  }

  if (errors.length) {
    throw badRequest("Validation failed.", { errors });
  }

  if (!partial && Object.keys(values).length === 0) {
    throw badRequest("No writable fields were supplied.");
  }
  if (partial && Object.keys(values).length === 0) {
    throw badRequest("No writable fields were supplied.");
  }

  return { values, skipped };
}

/** Coerces a query-string value for a filterable column. */
export function coerceFilter(def, field, raw) {
  switch (def.type) {
    case "int": {
      const n = toInteger(raw, field, def);
      return n;
    }
    case "bool": {
      const b = toBoolean(raw, field);
      return b;
    }
    case "decimal":
    case "date":
    case "string":
    case "text":
    case "enum":
      if (def.type === "enum" && !def.values.includes(raw)) {
        throw badRequest(
          `Filter "${field}" must be one of: ${def.values.join(", ")}.`
        );
      }
      return toOutputString(raw, field, { ...def, max: def.max || 255 });
    default:
      return toOutputString(raw, field, { max: 255 });
  }
}

export default validateBody;
