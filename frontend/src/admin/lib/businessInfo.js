/**
 * Business-info helpers for the simplified admin screens.
 *
 * The `business_info` table is a flat key/value store and remains the single
 * source of truth (Admin → API → MySQL → public bootstrap). These helpers let a
 * focused form edit a curated subset of rows *by info_key* without touching the
 * generic CRUD table or duplicating any data source.
 */
import { adminApi } from "../../lib/api.js";

/** Fetch every business_info row (there are only a few dozen). */
export async function fetchBusinessInfoRows() {
  const payload = await adminApi.list("business-info", { limit: 100 });
  return payload?.data || [];
}

/** Index rows by their stable info_key for O(1) lookup. */
export function indexByKey(rows) {
  const map = {};
  for (const row of rows || []) map[row.info_key] = row;
  return map;
}

/**
 * Persist a set of `{ info_key, value }` changes. Only rows that exist and whose
 * value actually changed are PATCHed, so a no-op save issues no requests.
 * Returns the number of rows written.
 */
export async function saveBusinessInfoValues(byKey, updates) {
  const ops = [];
  for (const { info_key, value } of updates) {
    const row = byKey[info_key];
    if (!row) continue;
    const next = value == null ? "" : String(value);
    if (String(row.info_value ?? "") === next) continue;
    ops.push(adminApi.update("business-info", row.id, { info_value: next }));
  }
  await Promise.all(ops);
  return ops.length;
}
