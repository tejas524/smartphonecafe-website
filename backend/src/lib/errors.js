/**
 * Typed API errors.
 *
 * Every expected failure is raised as an ApiError so the central error handler
 * can turn it into a consistent JSON body with a correct status code. Anything
 * that is NOT an ApiError is treated as a genuine bug and reported as a generic
 * 500 - its message is never echoed to the client, because a raw driver error
 * can disclose table names or query fragments.
 */

export class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.expected = true;
  }
}

export const badRequest = (message, details) =>
  new ApiError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "Authentication required.") =>
  new ApiError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "You do not have access to this resource.") =>
  new ApiError(403, "FORBIDDEN", message);

export const notFound = (message = "Not found.") =>
  new ApiError(404, "NOT_FOUND", message);

export const conflict = (message, details) =>
  new ApiError(409, "CONFLICT", message, details);

export const payloadTooLarge = (message) =>
  new ApiError(413, "PAYLOAD_TOO_LARGE", message);

export const unsupportedMedia = (message, details) =>
  new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", message, details);

export const tooManyRequests = (message) =>
  new ApiError(429, "TOO_MANY_REQUESTS", message);

export const serverError = (message = "Something went wrong on the server.") =>
  new ApiError(500, "INTERNAL_ERROR", message);

export const unavailable = (message = "A required service is unavailable.") =>
  new ApiError(503, "SERVICE_UNAVAILABLE", message);

export default ApiError;
