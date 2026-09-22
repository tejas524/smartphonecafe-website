# Phase 4 — Express REST API + admin authentication

**Status:** complete. The API builds on the Phase 3 MySQL schema, authenticates
admins with bcrypt + a JWT httpOnly cookie, exposes CRUD for all eight CMS
sections, accepts secure image uploads, and persists everything to MySQL. A
145-assertion harness passes with **0 failures**.

**Scope note:** no admin UI and no public-site redesign were built — those are
Phases 5 and 6. The public read-only API added here is data plumbing, not a page.

**Schema note:** the Phase 3 schema was **not changed**. One behaviour was shaped
by it rather than editing it — see "gallery.image_path" below.

---

## Endpoints

### Diagnostics
- `GET /api/health` — MySQL version, database name, charset, table count and
  latency. Returns **503** when the database is unreachable, so it is a real
  liveness signal rather than an always-200.
- `GET /api` — a self-describing index of routes.

### Authentication (`/api/auth`)
- `POST /login` — sets the httpOnly session cookie. Rate-limited (10 / 15 min,
  successful logins not counted).
- `POST /logout` — clears the cookie.
- `GET /me` — the current session's user.
- `POST /change-password` — requires the current password; invalidates the
  session on success.

### Public, read-only (`/api/public`) — no auth
`home`, `business`, `brands`, `offers`, `repairs`, `accessories`, `gallery`,
`smartphones`, `bootstrap`. Each returns only active/visible/public rows and a
safe column list (never `password_hash`).

### Admin CRUD (`/api/admin/:resource`) — auth required
The eight CMS sections — `offers`, `smartphones`, `brands`, `repair-services`,
`accessories`, `gallery`, `business-info`, `homepage-content` — plus
`accessory-categories` (needed because `accessories.category_id` references it).

| Method | Path | Purpose |
|---|---|---|
| GET | `/:resource` | list — pagination, `q=` search, filter by listable columns, `sort`/`direction` |
| GET | `/:resource/stats/summary` | counts for dashboard tiles |
| POST | `/:resource` | create — JSON, or multipart with an `image` field |
| GET | `/:resource/:id` | read one |
| PATCH / PUT | `/:resource/:id` | update |
| DELETE | `/:resource/:id` | delete (also removes the associated file) |
| POST | `/:resource/reorder` | bulk `display_order`, in a transaction |
| POST | `/:resource/:id/image` | upload / replace the image |
| DELETE | `/:resource/:id/image` | detach the image (nullable columns only) |
| GET | `/:resource/meta/uploads` | list stored files for the bucket |

---

## Verification

Run against a live server by `_tools/phase4-verify.mjs` (git-ignored). It uses
Node's built-in `fetch`, handles cookies explicitly so the httpOnly flag can be
inspected on the raw header, and exits non-zero on any failure.

**Result: 145 passed, 0 failed.**

### DB connection
`/api/health` reports MySQL 8.0.46, database `smartphonecafe`, `utf8mb4`, 10
tables — and never leaks a password in an error string.

### Authentication / protected routes
- Protected route with no session → **401**; with a forged-signature JWT → **401**.
- Wrong password and unknown email return the **same** message (verified equal),
  so the endpoint cannot enumerate accounts.
- Correct credentials → **200**, and the login response contains **no hash**.
- Session cookie is **HttpOnly**, carries **SameSite** and **Path=/**, and is
  **not** `Secure` on `http://localhost` (so dev works) — it flips to
  `Secure` + `SameSite=None` under `NODE_ENV=production`.
- The signed-in user is re-read from MySQL on every request, so deactivating an
  account takes effect immediately.

### CRUD → MySQL persistence
- All eight sections list with pagination metadata.
- Full create → read → update → re-read round trip on `brands`, with the slug
  generated server-side and `created_at` set by the DB.
- **Durability across a full server-process restart:** a probe row was created,
  the Node process was killed and started fresh (new PID 16152 confirmed), and
  the row — name, note and `created_at` — was still readable, then cleaned up.
  This proves the data lives in MySQL, not in process memory.

### Validation / errors
Confirmed **400** for: missing required field (named in the response), unknown
field (listed back), object/array where a string is expected (blocks
`{"$ne":...}`-style payloads), invalid enum, over-length string, non-numeric id,
oversized `limit`, sorting by a non-sortable column, filtering by an unknown
column, and a non-existent foreign key. Absent record → **404**. Malformed JSON
→ **400**. A duplicate slug is auto-deduplicated. Injection-shaped input is
handled safely: a `' OR 1=1--` search returns 200 with no leaked rows (bound
parameter), and a `; DROP TABLE` sort is rejected (registry allow-list).

### Uploads
A real in-memory PNG round-trips to a stored **WebP** (RIFF/WEBP magic verified),
different bytes from the input, **no EXIF and no GPS** in the output, multiple
widths written, dimensions/srcset recorded on the row, and the file served over
HTTP with an `image/*` content-type. Rejected: a PHP payload and an `MZ`
executable both disguised as `image/png` (**415** — sharp cannot decode them),
and a genuinely >5 MB upload (**413**). A traversal-shaped delete path cannot
escape the upload root.

### Security headers
`X-Content-Type-Options: nosniff`, a framing/CSP header present, `X-Powered-By`
suppressed, and an `X-Request-ID` returned on every response.

### Data integrity after testing
Seed counts are unchanged (offers 3, brands 10, smartphones 0, repair_services
8, accessory_categories 6, accessories 0, gallery 9, business_info 30,
homepage_content 9). `users` is now **1** — the admin created below. No test
litter remains in the tables, and the test upload files were removed from the
(git-ignored) `uploads/` directory.

---

## Security model (how injection and abuse are prevented)

- **SQL injection is structurally impossible:** table and column identifiers are
  read only from `db/resources.js`; every user value is a bound `?` placeholder.
  There is no SQL string interpolation anywhere. `ORDER BY`, `WHERE` filters and
  search columns are all validated against the registry before a query is built.
- **Auth:** bcrypt cost 12, hash-only storage, httpOnly JWT cookie, per-request
  DB re-check, constant-ish login timing, login rate limiting.
- **Uploads:** memory buffering (no user-named path), mandatory sharp decode +
  re-encode (rejects non-images, strips metadata), server-generated filenames,
  and size + megapixel limits.
- **Errors:** a 500 never exposes its message or stack; it returns a generic
  sentence plus a request id that is logged server-side for correlation.
- **Secrets:** `backend/.env` stays git-ignored; a scan confirmed the DB password
  and JWT secret appear in **no** committed source file.

---

## The admin account

`npm run create-admin` creates or resets an admin. The password is read from
`ADMIN_PASSWORD` or a hidden prompt — **never** from a command-line argument
(argv is world-readable). Only the bcrypt hash is stored; a query confirmed the
stored value is a 60-char `$2b$12$` hash and that the plaintext appears nowhere
in the DB. No credential is committed.

A development admin (`owner@smartphonecafe.local`) was created for verification.
Its password exists only in the local `.env`/session and the git-ignored harness;
it is **not** in any tracked file. Replace it before any real deployment.

---

## gallery.image_path (schema respected, not changed)

`gallery.image_path` is `NOT NULL` in the Phase 3 schema, which is correct — a
gallery entry with no image is meaningless. Two behaviours follow from that,
implemented in code rather than by altering the schema:

1. **Create accepts multipart:** the image is processed *before* the INSERT and
   its path included in the row, so the column is never missing. If processing
   fails, no row is created and any written files are cleaned up.
2. **The image cannot be detached** from a gallery entry (only replaced, or the
   whole entry deleted). `DELETE /:id/image` returns a **400** with an
   `action: "delete_record_instead"` hint. On nullable image columns (offers,
   smartphones, etc.) detaching works normally.

---

## Files changed

**New (`backend/`):**
- `package.json`, `package-lock.json`
- `src/server.js`, `src/app.js`
- `src/config/env.js`
- `src/db/pool.js`, `src/db/resources.js`, `src/db/repository.js`
- `src/auth/password.js`, `src/auth/tokens.js`, `src/auth/middleware.js`
- `src/lib/validate.js`, `src/lib/query.js`, `src/lib/upload.js`,
  `src/lib/errors.js`, `src/lib/respond.js`
- `src/middleware/errors.js`
- `src/routes/auth.js`, `src/routes/adminCrud.js`, `src/routes/public.js`
- `src/scripts/create-admin.js`

**Changed:**
- `backend/README.md` — real run/layout/endpoint/security docs
- `backend/.env.example` — added `BCRYPT_ROUNDS`, `MAX_UPLOAD_PIXELS`,
  `SESSION_HOURS`, `NODE_ENV` alongside the existing keys
- `package.json` (root) — added `api`, `dev:api`, `create-admin` scripts
- `backend/.env` — Phase 4 keys appended locally; **git-ignored**, DB values
  preserved byte-for-byte, `JWT_SECRET` generated locally (never committed)

**Not committed (git-ignored):** `backend/node_modules/`, `uploads/*`,
`backend/.env`, `_tools/phase4-verify.mjs`.

---

## Issues encountered and fixed

1. **`in` operator on `undefined` → 500 on every JSON POST.** The first pass of
   `validateBody` was called before the multipart/JSON body branch was settled,
   so `body` could be `undefined`. Fixed by only relaxing the image requirement
   when a file is actually present and always validating a real body object;
   re-verified all POST paths return proper 4xx, not 500.
2. **`gallery` create failed with `image_path doesn't have a default value`.**
   The initial design inserted the row first and attached the image second,
   which cannot work for a NOT NULL column. Reordered to process the image first
   and include its path in the INSERT (see above).
3. **Two harness false-reads corrected, not worked around.** The cookie jar was
   overwriting a deliberately forged token (so the 401 test passed for the wrong
   reason), and the oversized-upload test used a flat-colour PNG that deflates to
   a few KB (never exceeding 5 MB). Both were real test bugs: the jar now yields
   to an explicit cookie header, and the size test uses incompressible random
   bytes. After fixing them the assertions genuinely pass.

## Unverified / carried forward

- **HTTPS/production cookie flags** were reasoned about and coded
  (`Secure` + `SameSite=None` when `NODE_ENV=production`) but only the
  development path (`http://localhost`, no `Secure`) was exercised here.
- **Concurrent-load and connection-pool exhaustion** were not stress-tested;
  the pool is capped at 10 connections.
- **Visual fidelity to the two prototype images remains unverified** — no image
  is viewable in this project. That gap is unchanged from Phase 3 and belongs to
  Phases 5–6.
- `MAX_UPLOAD_PIXELS` guards decode dimensions; an extremely crafted format-bomb
  in an exotic codec was not specifically tested beyond sharp's own limits.
