/**
 * Response helpers.
 *
 * Keeps every success payload the same shape:
 *   { data: ... }                     single record
 *   { data: [...], meta: {...} }      collection
 */

export function ok(res, data, meta) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

export function created(res, data) {
  return res.status(201).json({ data });
}

export function noContent(res) {
  return res.status(204).end();
}

export default { ok, created, noContent };
