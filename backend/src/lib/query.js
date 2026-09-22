/**
 * Query-string helpers for list endpoints.
 *
 * Fixed caps on page size protect the database from a request like ?limit=1e9.
 */

import { badRequest } from "./errors.js";

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function parsePagination(qs) {
  let limit = DEFAULT_LIMIT;
  if (qs.limit !== undefined && qs.limit !== "") {
    const raw = String(qs.limit).trim();
    if (!/^\d+$/.test(raw)) {
      throw badRequest("Query parameter \"limit\" must be a whole number.");
    }
    limit = Number.parseInt(raw, 10);
    if (limit < 1) throw badRequest("Query parameter \"limit\" must be at least 1.");
    if (limit > MAX_LIMIT) {
      throw badRequest(`Query parameter "limit" must be at most ${MAX_LIMIT}.`);
    }
  }

  let offset = 0;
  if (qs.offset !== undefined && qs.offset !== "") {
    const raw = String(qs.offset).trim();
    if (!/^\d+$/.test(raw)) {
      throw badRequest("Query parameter \"offset\" must be a whole number.");
    }
    offset = Number.parseInt(raw, 10);
    if (offset < 0) throw badRequest("Query parameter \"offset\" must not be negative.");
  }

  // `page` is a convenience alias: page=2&limit=20 means offset 20.
  if (qs.page !== undefined && qs.page !== "") {
    const raw = String(qs.page).trim();
    if (!/^\d+$/.test(raw)) {
      throw badRequest("Query parameter \"page\" must be a whole number.");
    }
    const page = Number.parseInt(raw, 10);
    if (page < 1) throw badRequest("Query parameter \"page\" must be at least 1.");
    offset = (page - 1) * limit;
  }

  let search = null;
  if (qs.q !== undefined && String(qs.q).trim() !== "") {
    search = String(qs.q).trim();
    if (search.length > 120) {
      throw badRequest("Search term must be 120 characters or fewer.");
    }
  }

  return { limit, offset, search };
}

export default parsePagination;