/**
 * Generic repository over the resource registry.
 *
 * SAFETY MODEL
 * Table and column identifiers are read ONLY from db/resources.js, never from
 * the request. Every user-supplied value is bound as a `?` placeholder. There is
 * no template literal that interpolates user input into SQL anywhere below.
 */

import { query, queryOne } from "./pool.js";
import {
  editableColumns,
  listableColumns,
  sortableColumns,
} from "./resources.js";
import { coerceFilter, slugify } from "../lib/validate.js";
import { badRequest, conflict, notFound } from "../lib/errors.js";

/** Backtick-quotes an identifier that already came from the registry. */
const ident = (name) => `\`${name}\``;

/** Maps a MySQL driver error to a clear API error. */
function translateDriverError(err, resource, values) {
  switch (err.code) {
    case "ER_DUP_ENTRY": {
      const match = /Duplicate entry '(.+?)' for key '(.+?)'/.exec(err.message || "");
      const field = match ? match[2].split(".").pop() : "value";
      return conflict(
        `A record with that ${field.replace(/_/g, " ")} already exists.`,
        { constraint: "unique", field }
      );
    }
    case "ER_NO_REFERENCED_ROW_2":
      return badRequest(
        "A referenced record does not exist. Check any brand or category selection.",
        { constraint: "foreign_key" }
      );
    case "ER_ROW_IS_REFERENCED_2":
      return conflict(
        "This record is still referenced by other records and cannot be deleted yet.",
        { constraint: "foreign_key" }
      );
    case "ER_DATA_TOO_LONG":
      return badRequest("One of the values is longer than its column allows.", {
        constraint: "length",
      });
    case "ER_BAD_NULL_ERROR": {
      const m = /Column '(.+?)'/.exec(err.message || "");
      return badRequest(
        `A required field is missing${m ? `: ${m[1]}` : ""}.`,
        { constraint: "not_null" }
      );
    }
    case "WARN_DATA_TRUNCATED":
    case "ER_TRUNCATED_WRONG_VALUE":
      return badRequest("One of the values is not valid for its column.");
    default:
      return null; // Not a recognised client error -> becomes a 500 upstream.
  }
}

/**
 * Verifies every foreign-key field points at a row that exists.
 * Done explicitly so the API returns a helpful 400 rather than a raw FK error.
 */
async function assertReferences(resource, values) {
  if (!resource.references) return;
  for (const [field, ref] of Object.entries(resource.references)) {
    const value = values[field];
    if (value === undefined || value === null) continue;
    const row = await queryOne(
      `SELECT ${ident(ref.column)} AS id FROM ${ident(ref.table)} WHERE ${ident(ref.column)} = ? LIMIT 1`,
      [value]
    );
    if (!row) {
      throw badRequest(
        `The selected ${ref.label} does not exist (${field} = ${value}).`,
        { field }
      );
    }
  }
}

/**
 * Ensures a unique slug, appending -2, -3, ... when needed.
 * `excludeId` lets an update keep its own slug.
 */
async function uniqueSlug(resource, base, excludeId = null) {
  const root = slugify(base) || "item";
  let candidate = root.slice(0, resource.columns.slug?.max ?? 190);

  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const params = [candidate];
    let sql = `SELECT \`id\` FROM ${ident(resource.table)} WHERE \`slug\` = ?`;
    if (excludeId !== null) {
      sql += " AND `id` <> ?";
      params.push(excludeId);
    }
    sql += " LIMIT 1";
    const existing = await queryOne(sql, params);
    if (!existing) return candidate;
    const tag = `-${suffix + 1}`;
    candidate = `${root.slice(0, 190 - tag.length)}${tag}`;
  }
  throw conflict("Could not generate a unique slug; please adjust the title.");
}

/**
 * Builds a slug for a resource that has one, from its natural title field.
 * Resources without a generated slug (e.g. repair-services) keep the slug the
 * editor supplied, because it is a stable key used by the frontend.
 */
async function withSlug(resource, values, existing = null) {
  if (!("slug" in resource.columns)) return values;
  const slugDef = resource.columns.slug;

  // Generated slugs: derive from the title and ignore client input.
  if (slugDef.editable === false) {
    const source =
      values.model_name || values.name || values.title || existing?.model_name ||
      existing?.name || existing?.title || "item";
    const base = `${source}`;
    values.slug = await uniqueSlug(resource, base, existing?.id ?? null);
    return values;
  }

  // Editor-supplied slugs (repair-services): normalise, then de-duplicate.
  if (values.slug !== undefined && values.slug !== null) {
    values.slug = await uniqueSlug(resource, values.slug, existing?.id ?? null);
  }
  return values;
}

/* ------------------------------------------------------------------ reads -- */

export async function list(resource, { limit, offset, search, filters = {}, order }) {
  const where = [];
  const params = [];

  for (const [field, raw] of Object.entries(filters)) {
    const def = resource.columns[field];
    if (!def || !def.listable) continue;
    const value = coerceFilter(def, field, raw);
    if (value === null) {
      where.push(`${ident(field)} IS NULL`);
    } else {
      where.push(`${ident(field)} = ?`);
      params.push(value);
    }
  }

  if (search) {
    const fields = (resource.searchable || []).filter((f) => f in resource.columns);
    if (fields.length) {
      // LIKE with a bound parameter. `%` and `_` are escaped so a search for
      // "50%" cannot turn into a wildcard sweep.
      const escaped = search.replace(/[\\%_]/g, (c) => `\\${c}`);
      const clause = fields.map((f) => `${ident(f)} LIKE ?`).join(" OR ");
      where.push(`(${clause})`);
      fields.forEach(() => params.push(`%${escaped}%`));
    }
  }

  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";

  // ORDER BY: column must be sortable per the registry, else fall back.
  let orderColumn = resource.defaultOrder.column;
  let direction = resource.defaultOrder.direction || "asc";
  if (order && order.column) {
    if (!sortableColumns(resource).includes(order.column)) {
      throw badRequest(`Cannot sort by "${order.column}".`);
    }
    orderColumn = order.column;
  }
  if (order && order.direction) {
    const dir = String(order.direction).toLowerCase();
    if (!["asc", "desc"].includes(dir)) {
      throw badRequest('Sort direction must be "asc" or "desc".');
    }
    direction = dir;
  }

  const totalRow = await queryOne(
    `SELECT COUNT(*) AS n FROM ${ident(resource.table)}${whereSql}`,
    params
  );

  // A stable secondary sort on id keeps pages from overlapping when the primary
  // sort column has ties (e.g. every display_order = 0).
  const rows = await query(
    `SELECT * FROM ${ident(resource.table)}${whereSql}` +
      ` ORDER BY ${ident(orderColumn)} ${direction.toUpperCase()}, \`id\` ASC` +
      ` LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const total = Number(totalRow?.n ?? 0);
  return {
    rows,
    meta: {
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      pages: limit > 0 ? Math.ceil(total / limit) : 0,
      hasMore: offset + rows.length < total,
    },
  };
}

export async function findById(resource, id) {
  const row = await queryOne(
    `SELECT * FROM ${ident(resource.table)} WHERE \`id\` = ? LIMIT 1`,
    [id]
  );
  return row || null;
}

export async function findBySlug(resource, slug) {
  if (!("slug" in resource.columns)) return null;
  const row = await queryOne(
    `SELECT * FROM ${ident(resource.table)} WHERE \`slug\` = ? LIMIT 1`,
    [slug]
  );
  return row || null;
}

export async function countAll(resource, extraWhere = "", params = []) {
  const row = await queryOne(
    `SELECT COUNT(*) AS n FROM ${ident(resource.table)}${extraWhere}`,
    params
  );
  return Number(row?.n ?? 0);
}

/* ----------------------------------------------------------------- writes -- */

export async function create(resource, values) {
  const editable = editableColumns(resource);
  const payload = {};
  for (const [k, v] of Object.entries(values)) {
    if (editable.includes(k) && v !== undefined) payload[k] = v;
  }

  // Apply declared defaults for anything the client omitted.
  for (const [field, def] of Object.entries(resource.columns)) {
    if (def.default !== undefined && payload[field] === undefined && def.editable !== false) {
      payload[field] = def.type === "bool" ? (def.default ? 1 : 0) : def.default;
    }
  }

  await withSlug(resource, payload, null);
  await assertReferences(resource, payload);

  const fields = Object.keys(payload);
  if (!fields.length) throw badRequest("No writable fields were supplied.");

  const sql =
    `INSERT INTO ${ident(resource.table)} (${fields.map(ident).join(", ")})` +
    ` VALUES (${fields.map(() => "?").join(", ")})`;

  try {
    const result = await query(sql, fields.map((f) => payload[f]));
    return await findById(resource, result.insertId);
  } catch (err) {
    const mapped = translateDriverError(err, resource, payload);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function update(resource, id, values) {
  const existing = await findById(resource, id);
  if (!existing) throw notFound(`${resource.label} record ${id} was not found.`);

  const editable = editableColumns(resource);
  const payload = {};
  for (const [k, v] of Object.entries(values)) {
    if (editable.includes(k) && v !== undefined) payload[k] = v;
  }

  await withSlug(resource, payload, existing);
  await assertReferences(resource, payload);

  const fields = Object.keys(payload);
  if (!fields.length) throw badRequest("No writable fields were supplied.");

  const sql =
    `UPDATE ${ident(resource.table)} SET ${fields.map((f) => `${ident(f)} = ?`).join(", ")}` +
    ` WHERE \`id\` = ?`;

  try {
    await query(sql, [...fields.map((f) => payload[f]), id]);
  } catch (err) {
    const mapped = translateDriverError(err, resource, payload);
    if (mapped) throw mapped;
    throw err;
  }

  return await findById(resource, id);
}

export async function remove(resource, id) {
  const existing = await findById(resource, id);
  if (!existing) throw notFound(`${resource.label} record ${id} was not found.`);

  try {
    await query(`DELETE FROM ${ident(resource.table)} WHERE \`id\` = ?`, [id]);
  } catch (err) {
    const mapped = translateDriverError(err, resource, {});
    if (mapped) throw mapped;
    throw err;
  }
  return existing;
}

/** Reorders records by writing display_order for the given ids. */
export async function reorder(resource, order) {
  if (!Array.isArray(order) || !order.length) {
    throw badRequest('Body must be { "order": [ { "id": 1, "display_order": 10 } ] }.');
  }
  if (order.length > 500) {
    throw badRequest("Cannot reorder more than 500 records at once.");
  }
  const def = resource.columns.display_order;
  if (!def || def.editable === false) {
    throw badRequest(`${resource.label} records cannot be reordered.`);
  }

  for (const item of order) {
    if (!item || typeof item !== "object") {
      throw badRequest("Each order entry must be an object.");
    }
    const id = Number.parseInt(item.id, 10);
    const position = Number.parseInt(item.display_order, 10);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw badRequest("Each order entry needs a valid numeric id.");
    }
    if (!Number.isSafeInteger(position) || position < 0 || position > 100000) {
      throw badRequest("Each order entry needs a display_order between 0 and 100000.");
    }
  }

  // One statement, wrapped in a transaction so a partial reorder cannot happen.
  const { getPool } = await import("./pool.js");
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    for (const item of order) {
      await conn.execute(
        `UPDATE ${ident(resource.table)} SET \`display_order\` = ? WHERE \`id\` = ?`,
        [Number.parseInt(item.display_order, 10), Number.parseInt(item.id, 10)]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const ids = order.map((o) => Number.parseInt(o.id, 10));
  const placeholders = ids.map(() => "?").join(", ");
  return query(
    `SELECT * FROM ${ident(resource.table)} WHERE \`id\` IN (${placeholders})` +
      ` ORDER BY \`display_order\` ASC, \`id\` ASC`,
    ids
  );
}

export default { list, findById, findBySlug, create, update, remove, reorder, countAll };