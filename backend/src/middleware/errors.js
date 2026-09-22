/**
 * Central error handling.
 *
 * GUARANTEES
 *  - Unexpected errors never leak their message or stack to the client. A raw
 *    driver error can name tables and columns; a stack can reveal file paths.
 *  - Expected (ApiError) failures return a stable machine-readable `code` plus a
 *    human `message`, and field-level detail where useful.
 *  - Every 500 is logged server-side with a request id so an operator can match
 *    a user's report to the exact failure without exposing internals.
 */

import crypto from "node:crypto";
import config from "../config/env.js";
import { ApiError } from "../lib/errors.js";

export function requestId(req, res, next) {
  req.id = req.get("x-request-id") || crypto.randomBytes(8).toString("hex");
  res.setHeader("x-request-id", req.id);
  next();
}

/** 404 for any unmatched route. */
export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, "NOT_FOUND", `No route matches ${req.method} ${req.originalUrl}.`));
}

/** eslint-disable-next-line no-unused-vars -- Express identifies this by arity. */
export function errorHandler(err, req, res, _next) {
  const isApi = err instanceof ApiError;

  // Body-parser signals malformed JSON with these.
  if (!isApi && err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "The request body is not valid JSON.",
        requestId: req.id,
      },
    });
  }
  if (!isApi && err.type === "entity.too.large") {
    return res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "The request body is too large.",
        requestId: req.id,
      },
    });
  }
  // Multer size limit reached before our own guard ran.
  if (!isApi && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "The uploaded file is too large.",
        requestId: req.id,
      },
    });
  }

  const status = isApi ? err.status : 500;
  const code = isApi ? err.code : "INTERNAL_ERROR";

  if (status >= 500) {
    // Full detail on the server only.
    console.error(
      `[error] ${req.id} ${req.method} ${req.originalUrl} -> ${status} ${code}:`,
      err && err.stack ? err.stack : err
    );
  } else if (!config.server.isProduction) {
    // Helpful while developing, and harmless because the status is a 4xx.
    console.warn(`[warn] ${req.id} ${req.method} ${req.originalUrl} -> ${status} ${code}: ${err.message}`);
  }

  const body = {
    error: {
      code,
      // A 500 gets a fixed, generic sentence. Never err.message.
      message: isApi ? err.message : "Something went wrong on the server.",
      requestId: req.id,
    },
  };

  if (isApi && err.details !== undefined) body.error.details = err.details;

  // Stack traces are never sent, in any environment.
  return res.status(status).json(body);
}

/** Wraps an async handler so a rejected promise reaches errorHandler. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export default { requestId, notFoundHandler, errorHandler, asyncHandler };
