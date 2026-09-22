/**
 * Generic authenticated CRUD router.
 *
 * One implementation serves every CMS section. The section is chosen by the
 * `:resource` path parameter, which is resolved through the registry in
 * db/resources.js. An unknown resource is a 404 before any SQL is built.
 *
 * Mounted at /api/admin/:resource behind requireAuth.
 *
 *   GET    /api/admin/offers?limit=20&page=2&q=emi&is_active=1
 *   POST   /api/admin/offers
 *   GET    /api/admin/offers/:id
 *   PATCH  /api/admin/offers/:id
 *   PUT    /api/admin/offers/:id
 *   DELETE /api/admin/offers/:id
 *   POST   /api/admin/offers/reorder        { order: [{ id, display_order }] }
 *   POST   /api/admin/offers/:id/image      multipart field "image"
 *   DELETE /api/admin/offers/:id/image
 */

import express from "express";
import {
  getResource,
  listableColumns,
  resourceKeys,
} from "../db/resources.js";
import * as repo from "../db/repository.js";
import { validateBody } from "../lib/validate.js";
import { parsePagination } from "../lib/query.js";
import { badRequest, notFound, payloadTooLarge } from "../lib/errors.js";
import { ok, created } from "../lib/respond.js";
import {
  uploadSingle,
  processImage,
  bucketFor,
  deleteUploaded,
  listUploads,
} from "../lib/upload.js";

const router = express.Router();

/* ------------------------------------------------------- resource resolver -- */

/** Rejects an unknown section before any query is attempted. */
function resolveResource(req, _res, next) {
  const resource = getResource(req.params.resource);
  if (!resource) {
    return next(
      notFound(
        `Unknown section "${req.params.resource}". ` +
          `Available: ${resourceKeys().join(", ")}.`
      )
    );
  }
  req.resource = resource;
  req.resourceKey = req.params.resource;
  return next();
}

/** Parses and validates :id once, so every handler gets a clean integer. */
function resolveId(req, _res, next) {
  const raw = req.params.id;
  if (!/^\d+$/.test(String(raw))) {
    return next(badRequest("The record id must be a whole number."));
  }
  const id = Number.parseInt(raw, 10);
  if (id < 1) return next(badRequest("The record id must be at least 1."));
  req.recordId = id;
  return next();
}

/** Collects only registry-approved filter values from the query string. */
function buildFilters(resource, qs) {
  const allowed = new Set(listableColumns(resource));
  const filters = {};
  for (const [key, value] of Object.entries(qs)) {
    if (!allowed.has(key)) continue;
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      // Repeated params are ambiguous for an equality filter; take the last.
      filters[key] = value[value.length - 1];
    } else {
      filters[key] = value;
    }
  }
  return filters;
}

/** Suggests free filter keys when a caller uses a non-filterable one. */
function rejectUnknownFilters(resource, qs) {
  const reserved = new Set(["limit", "offset", "page", "q", "sort", "order", "direction"]);
  const allowed = new Set(listableColumns(resource));
  const unknown = Object.keys(qs).filter((k) => !reserved.has(k) && !allowed.has(k));
  if (unknown.length) {
    throw badRequest(
      `Cannot filter by: ${unknown.join(", ")}. ` +
        `Filterable fields: ${[...allowed].join(", ")}.`,
      { unknown, allowed: [...allowed] }
    );
  }
}

/**
 * Multipart sends every non-file field as a string. Booleans and numbers must be
 * converted back before validation, and JSON-encoded arrays/objects are parsed.
 * Values that are not valid JSON are left as plain strings.
 */
function parseMultipartFields(body) {
  const out = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") {
        out[key] = "";
        continue;
      }
      // Only attempt JSON for values that clearly look like JSON, so a plain
      // string such as "true story" is not mangled.
      if (/^(true|false|null|-?\d+(\.\d+)?|\[.*\]|\{.*\})$/is.test(trimmed)) {
        try {
          out[key] = JSON.parse(trimmed);
          continue;
        } catch {
          /* fall through to the raw string */
        }
      }
      out[key] = value;
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Chooses the single image column a resource stores, if any. */
function imageColumnFor(resource) {
  if ("image_path" in resource.columns) return "image_path";
  if ("logo_path" in resource.columns) return "logo_path";
  return null;
}

/**
 * Writes a processed image's details onto a record, filling the size columns on
 * resources that have them so the frontend never has to re-measure the file.
 */
async function applyImageToRecord(resource, id, processed) {
  const imageField = imageColumnFor(resource);
  if (!imageField) return repo.findById(resource, id);

  const patch = { [imageField]: processed.path };
  if ("width" in resource.columns) patch.width = processed.width;
  if ("height" in resource.columns) patch.height = processed.height;
  if ("aspect_ratio" in resource.columns) patch.aspect_ratio = processed.aspect_ratio;
  if ("srcset" in resource.columns) patch.srcset = processed.srcset;
  if ("source_width" in resource.columns) patch.source_width = processed.source_width;
  if ("source_height" in resource.columns) patch.source_height = processed.source_height;

  return repo.update(resource, id, patch);
}

/* -------------------------------------------------------------------- list -- */
router.get("/", async (req, res, next) => {
  try {
    const resource = req.resource;
    rejectUnknownFilters(resource, req.query);
    const { limit, offset, search } = parsePagination(req.query);

    const order = {};
    if (req.query.sort) order.column = String(req.query.sort);
    if (req.query.direction) order.direction = String(req.query.direction);

    const { rows, meta } = await repo.list(resource, {
      limit,
      offset,
      search,
      filters: buildFilters(resource, req.query),
      order: Object.keys(order).length ? order : undefined,
    });

    return ok(res, rows, meta);
  } catch (err) {
    return next(err);
  }
});

/** Section summary used by the dashboard tiles. */
router.get("/stats/summary", async (req, res, next) => {
  try {
    const resource = req.resource;
    const total = await repo.countAll(resource);
    const summary = { total };

    // "active" only means something where the column exists.
    if ("is_active" in resource.columns) {
      summary.active = await repo.countAll(resource, " WHERE `is_active` = ?", [1]);
      summary.inactive = total - summary.active;
    }
    if ("is_featured" in resource.columns) {
      summary.featured = await repo.countAll(resource, " WHERE `is_featured` = ?", [1]);
    }
    if ("is_visible" in resource.columns) {
      summary.visible = await repo.countAll(resource, " WHERE `is_visible` = ?", [1]);
    }
    if ("needs_confirmation" in resource.columns) {
      summary.needsConfirmation = await repo.countAll(
        resource,
        " WHERE `needs_confirmation` = ?",
        [1]
      );
    }
    return ok(res, summary);
  } catch (err) {
    return next(err);
  }
});

/**
 * Relaxes a NOT NULL image column when an image is supplied in the same request.
 *
 * gallery.image_path is NOT NULL in the Phase 3 schema, so a create that omits
 * it would fail before the image could be attached. Rather than weaken the
 * schema, the create route processes the image FIRST and includes the resulting
 * path in the INSERT, so the column is never missing.
 */
function relaxRequiredImage(resource, hasFile) {
  if (!resource.imageRequired || !hasFile) return resource;
  const field = resource.imageField || "image_path";
  if (!resource.columns[field]?.required) return resource;
  return {
    ...resource,
    columns: {
      ...resource.columns,
      [field]: { ...resource.columns[field], required: false },
    },
  };
}

/* ------------------------------------------------------------------ create -- */

/**
 * Creates a record. Accepts either JSON or multipart/form-data.
 *
 * Multipart is supported so a section whose image column is NOT NULL (gallery)
 * can be created together with its image in one request. In that case the image
 * is processed AFTER the row exists, and the row is removed again if processing
 * fails, so a failed upload never leaves an image-less record behind.
 */
router.post(
  "/",
  (req, res, next) => {
    // Only parse multipart when the client actually sent it; a JSON body would
    // otherwise be consumed by multer and appear empty.
    const type = req.get("content-type") || "";
    if (/^multipart\/form-data/i.test(type)) {
      return multerGuard(req, res, next);
    }
    return next();
  },
  async (req, res, next) => {
    const written = [];
    try {
      const resource = req.resource;
      // With multipart the scalar fields arrive as strings in req.body.
      const rawBody = req.file ? parseMultipartFields(req.body) : req.body;

      // Validate against a copy whose NOT NULL image column is only relaxed when
      // an image is actually present in this request.
      const validated = relaxRequiredImage(resource, Boolean(req.file));
      const { values, skipped } = validateBody(validated, rawBody, { partial: false });

      // Process the image BEFORE inserting, so a resource with a NOT NULL
      // image_path is never inserted without one. If image processing fails, no
      // row is ever created - which is why this order is required.
      let image = null;
      if (req.file) {
        const bucket = bucketFor(req.resourceKey);
        const baseName =
          values.model_name || values.name || values.title ||
          values.info_key || values.section_key || "image";
        image = await processImage(req.file.buffer, { bucket, baseName });
        written.push(...image.variants.map((v) => v.url));

        const imageField = imageColumnFor(resource);
        if (imageField) {
          values[imageField] = image.path;
          if ("width" in resource.columns) values.width = image.width;
          if ("height" in resource.columns) values.height = image.height;
          if ("aspect_ratio" in resource.columns) values.aspect_ratio = image.aspect_ratio;
          if ("srcset" in resource.columns) values.srcset = image.srcset;
          if ("source_width" in resource.columns) values.source_width = image.source_width;
          if ("source_height" in resource.columns) values.source_height = image.source_height;
        }
      }

      const row = await repo.create(resource, values);
      const payload = skipped.length ? { ...row, _ignoredServerFields: skipped } : row;
      return created(res, image ? { record: payload, image } : payload);
    } catch (err) {
      // A failed create must not leave stray image files behind.
      for (const url of written) {
        deleteUploaded(url).catch(() => {});
      }
      return next(err);
    }
  }
);

/* -------------------------------------------------------------- reorder -- */

router.post("/reorder", async (req, res, next) => {
  try {
    const rows = await repo.reorder(req.resource, req.body?.order);
    return ok(res, rows);
  } catch (err) {
    return next(err);
  }
});

/** Lists stored files for the section's bucket. */
router.get("/meta/uploads", async (req, res, next) => {
  try {
    const bucket = bucketFor(req.resourceKey);
    const files = await listUploads(bucket);
    return ok(res, files, { bucket, count: files.length });
  } catch (err) {
    return next(err);
  }
});

/* -------------------------------------------------------------------- read -- */
// NOTE: every literal path above must stay above "/:id", otherwise Express
// matches the literal segment as an id and the request becomes a 400.

router.get("/:id", resolveId, async (req, res, next) => {
  try {
    const row = await repo.findById(req.resource, req.recordId);
    if (!row) throw notFound(`${req.resource.label} record ${req.recordId} was not found.`);
    return ok(res, row);
  } catch (err) {
    return next(err);
  }
});

/* ------------------------------------------------------------------ update -- */

async function handleUpdate(req, res, next) {
  try {
    const { values, skipped } = validateBody(req.resource, req.body, { partial: true });
    const row = await repo.update(req.resource, req.recordId, values);
    return ok(res, skipped.length ? { ...row, _ignoredServerFields: skipped } : row);
  } catch (err) {
    return next(err);
  }
}

router.patch("/:id", resolveId, handleUpdate);
router.put("/:id", resolveId, handleUpdate);

/* ------------------------------------------------------------------ delete -- */

router.delete("/:id", resolveId, async (req, res, next) => {
  try {
    const row = await repo.remove(req.resource, req.recordId);

    // Best-effort cleanup of the associated file. A failure here must not fail
    // the delete: the row is already gone, and an orphaned file is recoverable.
    if (row.image_path && req.query.deleteImage !== "false") {
      deleteUploaded(row.image_path).catch(() => {});
    }
    return ok(res, { deleted: true, id: req.recordId });
  } catch (err) {
    return next(err);
  }
});

/* ------------------------------------------------------------------ images -- */

/**
 * Wraps multer so its own errors become ApiErrors with useful status codes
 * (size limit -> 413, wrong field -> 400) rather than a raw 500.
 */
function multerGuard(req, res, next) {
  uploadSingle(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      const mb = Math.round((req.app.get("uploadMaxBytes") || 0) / 1024 / 1024);
      return next(
        payloadTooLarge(`That image is too large. The maximum size is ${mb || 5} MB.`)
      );
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        badRequest('Unexpected file field. Send the image as the "image" field.')
      );
    }
    return next(err);
  });
}

/**
 * Uploads an image and writes the resulting path onto the record.
 * The record must exist first, so the image belongs to something real.
 */
router.post("/:id/image", resolveId, multerGuard, async (req, res, next) => {
  try {
    const existing = await repo.findById(req.resource, req.recordId);
    if (!existing) {
      throw notFound(`${req.resource.label} record ${req.recordId} was not found.`);
    }
    if (!req.file) {
      throw badRequest('No file was uploaded. Send it as the "image" field.');
    }

    const bucket = bucketFor(req.resourceKey);
    const baseName =
      existing.model_name || existing.name || existing.title ||
      existing.info_key || existing.section_key || "image";

    const processed = await processImage(req.file.buffer, { bucket, baseName });
    const previous = imageColumnFor(req.resource)
      ? existing[imageColumnFor(req.resource)]
      : null;

    const row = await applyImageToRecord(req.resource, req.recordId, processed);

    // Remove the previous file only after the new path is committed.
    if (previous && previous !== processed.path) {
      deleteUploaded(previous).catch(() => {});
    }

    return created(res, { record: row, image: processed });
  } catch (err) {
    return next(err);
  }
});

/** Detaches the image from the record and deletes the file. */
router.delete("/:id/image", resolveId, async (req, res, next) => {
  try {
    const resource = req.resource;
    const existing = await repo.findById(resource, req.recordId);
    if (!existing) {
      throw notFound(`${resource.label} record ${req.recordId} was not found.`);
    }

    const imageField = imageColumnFor(resource);
    if (!imageField || !existing[imageField]) {
      throw badRequest("That record has no image to remove.");
    }

    // gallery.image_path is NOT NULL in the Phase 3 schema, so an image cannot be
    // detached from a gallery entry: the entry itself must go. Enforced here
    // rather than by weakening the column, and explained in the response so the
    // admin UI can offer the right action.
    if (resource.columns[imageField]?.required) {
      throw badRequest(
        `A ${resource.label} entry cannot exist without an image. ` +
          `Delete the entry instead, or replace the image by uploading a new one.`,
        { field: imageField, action: "delete_record_instead" }
      );
    }

    const removed = existing[imageField];
    const patch = { [imageField]: null };
    if ("srcset" in resource.columns) patch.srcset = null;
    if ("width" in resource.columns) patch.width = null;
    if ("height" in resource.columns) patch.height = null;

    const row = await repo.update(resource, req.recordId, patch);
    const deleted = await deleteUploaded(removed);

    return ok(res, { record: row, fileDeleted: deleted });
  } catch (err) {
    return next(err);
  }
});

export { resolveResource };
export default router;
