# backend/

Node.js + Express REST API and admin authentication for the SmartphoneCafe CMS.

Talks to the Phase 3 MySQL database via `mysql2/promise`. The frontend never
touches the database directly and never receives a database credential.

## Run

```bash
cd backend
npm install
cp .env.example .env      # then fill it in
npm run create-admin -- --email owner@example.com --name "Owner"
npm run dev               # or: npm start
```

- `npm start` — production server (`node src/server.js`)
- `npm run dev` — same, with `--watch` auto-restart
- `npm run create-admin` — create or reset a CMS admin (bcrypt hash only)

The server refuses to start if `backend/.env` is missing required values or if
MySQL is unreachable, so a misconfiguration fails loudly at boot instead of
surfacing as a confusing 500 later.

## Layout

```
src/
  server.js            entry point: validate config, check DB, listen, shut down
  app.js               Express assembly (security, parsing, routes, errors)
  config/env.js        loads + validates .env; never logs a secret
  db/
    pool.js            mysql2 pool, query helpers, health check
    resources.js       registry of the 8 CMS sections (+ accessory-categories)
    repository.js      generic CRUD; identifiers only from the registry
  auth/
    password.js        bcrypt hashing + password policy
    tokens.js          JWT signing + httpOnly cookie options
    middleware.js      attachUser / requireAuth / requireRole
  lib/
    validate.js        input validation + coercion + slugify
    query.js           pagination parsing with hard caps
    upload.js          multer (memory) + sharp re-encode + safe delete
    errors.js          typed ApiError helpers
    respond.js         uniform success envelopes
  middleware/errors.js request id, 404, central error handler
  routes/
    auth.js            /api/auth/*
    adminCrud.js       /api/admin/:resource/*  (behind requireAuth)
    public.js          /api/public/*  (read-only, no auth)
  scripts/
    create-admin.js    operator-run admin creation
```

## Endpoints

`GET /api/health` — DB status (503 when the database is down).

`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`,
`POST /api/auth/change-password`.

`GET /api/public/{home,business,brands,offers,repairs,accessories,gallery,smartphones,bootstrap}`
— only active/visible/public rows, safe columns only.

`/api/admin/:resource` (auth required) for the eight CMS sections
(`offers`, `smartphones`, `brands`, `repair-services`, `accessories`,
`gallery`, `business-info`, `homepage-content`) plus `accessory-categories`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/:resource` | list (paginate, `q=`, filter by listable columns, `sort`/`direction`) |
| GET | `/api/admin/:resource/stats/summary` | counts for dashboard tiles |
| POST | `/api/admin/:resource` | create (JSON, or multipart with an `image`) |
| GET | `/api/admin/:resource/:id` | read one |
| PATCH/PUT | `/api/admin/:resource/:id` | update |
| DELETE | `/api/admin/:resource/:id` | delete |
| POST | `/api/admin/:resource/reorder` | bulk `display_order` |
| POST | `/api/admin/:resource/:id/image` | upload/replace the image |
| DELETE | `/api/admin/:resource/:id/image` | detach the image (nullable columns only) |
| GET | `/api/admin/:resource/meta/uploads` | list stored files for the bucket |

## Security notes

- **SQL injection:** table/column identifiers come only from `db/resources.js`;
  every value is a bound `?` placeholder. There is no SQL string interpolation.
- **Auth:** bcrypt (cost 12) hashes only; JWT in an httpOnly cookie; the user is
  re-read from the DB on each request so deactivation is immediate; login gives
  the same message/timing for unknown-email and wrong-password.
- **Uploads:** multer buffers to memory (no user-named path), sharp decodes and
  re-encodes to WebP (rejecting non-images and stripping EXIF/GPS), filenames
  are generated server-side, and size/pixel limits stop decompression bombs.
- **Errors:** unexpected failures return a generic 500 with a request id; the
  message and stack are logged server-side only.
- **`.env` is never committed.** Only `.env.example` (placeholders) is tracked.

See `../database/README.md` for the schema and `../docs/phase-4-api.md` for the
full verification record.
