/**
 * Public + admin API client for the SmartphoneCafe backend.
 *
 * All requests are same-origin relative paths ("/api/..."). In development the
 * Vite dev server proxies "/api" and "/uploads" to the Express backend
 * (see vite.config.js); in production the same Express server serves both the
 * built SPA and the API, so relative paths work everywhere.
 *
 * The backend success envelope is `{ data, meta }`; errors are
 * `{ error: { code, message, requestId } }`. `unwrap()` returns `data` and
 * throws an ApiError on failure so callers can branch on error state.
 */

export class ApiError extends Error {
  constructor(message, { status, code, requestId } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
  const opts = {
    method,
    credentials: "include", // send/receive the httpOnly admin session cookie
    headers: { Accept: "application/json", ...headers },
    signal,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body; // let the browser set the multipart boundary
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(path, opts);
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("Network request failed", { status: 0 });
  }

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const e = payload?.error ?? {};
    throw new ApiError(e.message || `Request failed (${res.status})`, {
      status: res.status,
      code: e.code,
      requestId: e.requestId,
    });
  }

  return payload;
}

/** Returns the `data` field of a successful response. */
async function unwrap(path, opts) {
  const payload = await request(path, opts);
  return payload?.data;
}

/* ------------------------------------------------------------------ public -- */

export const publicApi = {
  /** Everything the public site needs in one call. */
  bootstrap: (signal) => unwrap("/api/public/bootstrap", { signal }),
  home: (signal) => unwrap("/api/public/home", { signal }),
  business: (signal) => unwrap("/api/public/business", { signal }),
  brands: (signal) => unwrap("/api/public/brands", { signal }),
  offers: (signal) => unwrap("/api/public/offers", { signal }),
  repairs: (signal) => unwrap("/api/public/repairs", { signal }),
  accessories: (signal) => unwrap("/api/public/accessories", { signal }),
  gallery: (signal) => unwrap("/api/public/gallery", { signal }),
  smartphones: (brand, signal) =>
    unwrap(
      `/api/public/smartphones${brand ? `?brand=${encodeURIComponent(brand)}` : ""}`,
      { signal }
    ),
};

/* ------------------------------------------------------------------- auth --- */

export const authApi = {
  login: (email, password) =>
    unwrap("/api/auth/login", { method: "POST", body: { email, password } }),
  logout: () => unwrap("/api/auth/logout", { method: "POST" }),
  me: (signal) => unwrap("/api/auth/me", { signal }),
  changePassword: (currentPassword, newPassword) =>
    unwrap("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    }),
};

/* ------------------------------------------------------------------ admin --- */

export const adminApi = {
  list: (resource, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/${resource}${qs ? `?${qs}` : ""}`);
  },
  get: (resource, id) => unwrap(`/api/admin/${resource}/${id}`),
  create: (resource, body) => unwrap(`/api/admin/${resource}`, { method: "POST", body }),
  update: (resource, id, body) =>
    unwrap(`/api/admin/${resource}/${id}`, { method: "PATCH", body }),
  remove: (resource, id, { deleteImage = true } = {}) =>
    unwrap(`/api/admin/${resource}/${id}${deleteImage ? "" : "?deleteImage=false"}`, {
      method: "DELETE",
    }),
  reorder: (resource, order) =>
    unwrap(`/api/admin/${resource}/reorder`, { method: "POST", body: { order } }),
  uploadImage: (resource, id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return unwrap(`/api/admin/${resource}/${id}/image`, { method: "POST", body: fd });
  },
  stats: (resource) => unwrap(`/api/admin/${resource}/stats/summary`),
};

export { request, unwrap };
