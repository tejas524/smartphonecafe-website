# Project inspection — pre-implementation report

**Date:** 2026-09-22
**Scope:** read-only inspection. **No application file was modified.**
**Purpose:** establish the true current state before the redesign + admin/CMS brief.

---

## 0. Two corrections to the brief

1. **`svgdocs/handoff-verified-findings.md` does not exist.** There is no `svgdocs/`
   directory anywhere in the project. The handoff is at
   **`docs/handoff-verified-findings.md`** (14,867 bytes), alongside
   `docs/google-maps-findings.md` (3,880 bytes). Both were read.

2. **The two reference images are not in this project.** They are at
   `D:\smartPhone cafe 2\shop photo\` — a *separate* folder, not this workspace:
   - `prototype of smartphonecafe.png` — 745 × 2110
   - `admin dashboard.png` — 1536 × 1024

   This workspace (`D:\SmartPhone Cafe`) contains only the 9 original shop photos.
   I could not view either reference (this model accepts no image input), so I
   **OCR'd both** to extract their structure as text. Results in §6 — this turned
   out to be the single most useful output of the inspection.

---

## 1. Current project status

A complete, working **static React SPA**. No backend, no database, no admin.

| Aspect | State |
|---|---|
| Stack | React 18.3.1 + Vite 6.4.3 + React Router 6.28 + Tailwind **v4** |
| Tailwind | CSS-first `@theme` in `src/index.css`. **No `tailwind.config.js`** |
| Modules | 65 transformed |
| Build | Passes clean: `dist/index.html` 4.92 kB, CSS 47.95 kB (gzip 9.01), app JS 124.15 kB (gzip 31.80), router chunk 164.40 kB (gzip 53.79) |
| Routes | 6 + 404 — `/`, `/smartphones`, `/repairs`, `/about`, `/gallery`, `/contact` |
| Backend | **None.** No `backend/`, `server/`, `api/`, `database/`, `uploads/` |
| DB deps | **None installed** — no express, mysql2, bcrypt, jsonwebtoken, cors, dotenv, multer |
| Env files | **None** — no `.env`, no `.env.example` |
| Git | **Not a repository in this folder.** `git rev-parse` → "not a git repository" |
| Assets | 34 files in `public/shop-images/` (responsive WebP + JPEG) |
| Data | 6 static modules in `src/data/` — `site`, `brands`, `repairs`, `accessories`, `gallery`, `photos` |

**Everything the public site shows is hardcoded in `src/data/*.js`.** That is the
central architectural fact for this brief: the "admin edits content" requirement
means these six modules must become API-backed.

### Architecture reviews
- `src/App.jsx` — flat `<Routes>` inside a `Layout`. No lazy loading, no `/admin`.
- `src/components/layout/Layout.jsx` — Header + `main#main` + Footer + `MobileActionBar`.
  Padding hacks (`h-[4.25rem]`) reserve space for the fixed mobile bar.
- `src/data/site.js` — genuinely good single-source-of-truth. Business values are
  centralised, so **wiring it to an API is a contained change**, not a rewrite.
- `src/index.css` — a real design-token system (`ink-*`, `paper*`, `line`, `accent-*`,
  `wa-*`, radii, shadows, easing) plus `.shell`, `.eyebrow`, `.grid-veil`, `.reveal`.
  **This is the brand system the admin UI should reuse to look like the same product.**

---

## 2. What existing work can be preserved

**Preserve nearly all of it.** This is a solid foundation, not something to rebuild.

| Asset | Verdict |
|---|---|
| Design tokens (`src/index.css` `@theme`) | **Keep as-is.** Admin reuses them |
| `src/components/ui/*` — Button, Reveal, SectionHeading, Photo, PhotoSlot | **Keep.** Reusable in admin |
| `src/components/Icon.jsx` — ~40 hand-built SVG glyphs | **Keep and extend** for sidebar icons |
| `src/components/Logo.jsx` | **Keep** — needed for admin sidebar branding |
| All 6 public pages + sections | **Keep the content, restyle to the prototype** |
| `scripts/process-shop-photos.mjs` | **Keep** — becomes the upload-optimisation pipeline |
| `public/shop-images/` (34 files) | **Keep** — seed data for the gallery table |
| `src/data/site.js` business facts | **Keep** — seed for `business_info` |
| `src/utils/hours.js` | **Keep** — move behind an API field |
| `src/utils/whatsapp.js` | **Keep** — contextual messages are a real feature |
| `src/utils/usePageMeta.js` | **Keep** |
| `docs/google-maps-findings.md` | **Keep** — the evidence record |
| `.gitignore` | **Keep** — already correct (`.env` ignored, `!.env.example`) |

**Zero brand, content or photo work is wasted.** The redesign is a presentation
change over verified data.

---

## 3. What needs to change

1. **Restructure to `frontend/` + `backend/` + `database/` + `uploads/`.** This is
   the disruptive step — it moves every existing file. Must be done as a **single
   `git mv` commit on a clean tree**, never as a copy-and-delete.
2. **Create the MySQL schema** — 10 tables per the brief.
3. **Build the Express API** — auth, CRUD, uploads, validation.
4. **Seed the DB from the existing `src/data/*.js`** so nothing verified is lost.
5. **Repoint the public site at the API.** `src/data/site.js` becomes one of ten
   API-backed resources. Public pages must render from `GET /api/*`.
6. **Build `/admin`** — login + 9 sidebar sections.
7. **Restyle the public pages** to match the prototype's structure (§6).
8. **Add `start` script** and production static-serving from Express.
9. **Fix the 3 confirmed defects** in §7.

---

## 4. MySQL connection status

**Installed, running, and reachable — but NOT yet authenticated.**

| Check | Result |
|---|---|
| Server | **MySQL 8.0.46** Community Server (Win64 x64) |
| Listening | **`127.0.0.1:3306`** ✅ TCP connect succeeds (also `33060`, X Protocol) |
| Process | `mysqld`, pid 5388 |
| Client | `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe` ✅ |
| Workbench | MySQL Workbench 8.0 ✅ (`C:\Program Files\MySQL\MySQL Workbench 8.0`) |
| Config | `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini` — `port=3306`, `datadir=C:/ProgramData/MySQL/MySQL Server 8.0\Data` |
| Auth as `root` (no password) | ❌ **`ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)`** |
| `.mylogin.cnf` login-path | none |
| `datadir` listing | permission denied (correct — needs service account) |

**So: the server works; I simply have no credentials.** I will not ask you to paste
them into source or commit them. Options, in order of preference:

- **(a)** You create `backend/.env` yourself (copy from `.env.example`) and tell me
  when done — I never see the secret. Best.
- **(b)** You create a dedicated app user and give me a non-root credential over a
  channel you consider acceptable, for local dev only.
- **(c)** I write the schema + code and you run the migration.

**Until credentials exist, the admin → API → MySQL → public-site persistence chain
cannot be verified end to end**, and I will report it as unverified rather than
simulate it with localStorage. Note for Hostinger later: MySQL 8 defaults to
`caching_sha2_password`; if an older client on shared hosting fails, the app user
may need `mysql_native_password`.

---

## 5. Conflicts found

### 🔴 Conflict 1 — Two agents edited one folder (now stopped)
Per the previous turn: a concurrent **Claude Code** agent rewrote `Hero.jsx`,
`Home.jsx`, `CtaBand.jsx`, regenerated `photos.js`, added `photos`/`ocr` scripts to
`package.json`, and created `_tools/verify-layout.mjs`. **That agent is now idle**
(verified via `list_agents` — its only status is `ready`). Only one dropped dev
server remains. **No conflict is live.** But this is exactly why step 1 below must
happen on an untouched tree.

### 🔴 Conflict 2 — No git repo, yet a repo exists on GitHub
- This folder: **no `.git`**.
- `D:\smartPhone cafe 2\`: has an **empty `.git`** (no commits, no remotes) — merely
  `git init`'d, containing only `shop photo/`.
- GitHub `tejas524/smartphonecafe-website`: **exists, PRIVATE, `isEmpty: true`**,
  created 2026-09-20, **default branch is empty string (no commits)**.

So there is **no version-control safety net on the actual code.** Before any
restructure I must `git init` here and commit the current state as a baseline —
otherwise step 3's file moves are unrecoverable.

### 🟠 Conflict 3 — Brief vs. this workspace re: reference images
The brief says "I have provided two reference images." They are **not in this
project's folder**; they sit in `D:\smartPhone cafe 2\shop photo\`. I OCR'd them
from there (§6). I have **not** copied or modified that folder.

### 🟠 Conflict 4 — The admin reference shows features the brief forbids
`admin dashboard.png` contains **Contact Messages**, **Site Analytics**, **Settings**,
and a fake **Recent Updates** feed with named people ("Rahul Sharma", "Priya
Deshmukh", "Amit Patil") and invented messages ("Hi, is iPhone 13 available in
stock?"). The brief explicitly says **do NOT add** analytics, contact messages, CRM,
orders, payments, settings, or customer management — and forbids invented data.
**The written brief wins over the image.** I will build the 8 permitted sections and
exclude all of that. The reference supplies *visual language only*.

### 🟡 Conflict 5 — Data-integrity constraints the admin design must respect
The existing code is careful never to claim a price, offer, stock level or warranty
(documented in-file: *"The listing publishes no product catalogue, brand list or
price list"*, *"never states a price, a turnaround promise, a warranty"*). The new
admin introduces editable **price**, **availability** and **offers** fields. Those
must start **empty**, not pre-filled with plausible values. `brands.js` already uses
price *bands* ("under ₹10,000") rather than product prices — keep that distinction.

### 🟢 Non-conflict — the DB is empty
No databases are reachable to enumerate, but nothing suggests prior CMS work. A
fresh schema will not collide.

---

## 6. Reference-image structure (extracted by OCR)

Because I cannot see images, I OCR'd both references (Windows OCR, tiled and
upscaled 2× so small UI text survived). This is **machine-read pixel text**, so
wording is noisy in places — I flag uncertainty.

### `prototype of smartphonecafe.png` — homepage, 745×2110 (mobile-ish, full page)
Section order, which matches your brief's 13-point list:

1. Top bar — `SMARTPHONES • REPAIRS • ACCESSORIES`
2. Hero — "Your Trusted Mobile Destination … in Talegaon Dabhade"; sub: "Latest
   smartphones, genuine accessories and reliable repair services — all under one
   roof"; **two CTAs** (one reads like "Get a …"; the other an outline button)
3. **SPECIAL DEALS → "Current Offers"** — several offer cards; readable fragments
   include "Up to … Off", "Buy Any … Get 20% Off", "Reliable & Original Chargers
   Starting at ₹499", "Flat Off"
4. **"Shop by Brand"** — "Choose favourite brand and check availability at our
   store"; brand logos visible: **vivo, TECNO, SAMSUNG, mi/redmi, oppo, LAVA** (and
   likely realme/POCO)
5. **SMARTPHONES → "Latest Smartphones"** — "Explore some of latest models at store";
   a card reads **"vivo … Redmi Note 13"**
6. **OUR SERVICES → "Mobile Repair Services"** — "Get your phone repaired by our
   experienced technicians"
7. **ACCESSORIES → "Everything You Need"** — "range of … to keep you …"
8. **OUR STORE → "Inside SmartphoneCafe"** — "Take a look at our store, products and
   services"
9. **"About SmartphoneCafe"** — "your trusted local destination for smartphones,
   accessories and mobile repair services in Talegaon Dabhade…" + "More"
10. **"Visit Our Store"** — address (matches `site.js`), `+91 99225 99577`,
    "10:00 AM – 9:30 PM (All days)"
11. Footer — logo, "your local smartphone store and repair partner in Talegaon
    Dabhade", **© 2024**, "Links", "Accessories", "Sales | Service | Accessories",
    "Contact Info", full address, phone, hours, "Built with … for Talegaon Dabhade"

**Three cautions.** The prototype's offer text is **mock content** — "₹499",
"20% Off", "Up to ₹10,000 Off" are placeholder copy and the brief forbids copying
them. The prototype matches the existing Instagram-handle-free, phone-number-correct
branding, so it is consistent with verified data. And it shows brand **logos**, which
the current site deliberately avoids (§9).

### `admin dashboard.png` — 1536×1024 (desktop)
- **Left sidebar (dark, ~12 items):** Dashboard · Home Content · Offers ·
  Smartphones · Brands · Repair Services · Accessories · Gallery · About Us · Store
  Information · Contact Messages · Settings, plus **View Website** and a user block
  ("Owner", `admin@smartphonecafe.in`, Logout).
- **Top:** "SmartphoneCafe / ADMIN DASHBOARD"
- **Main:** "Welcome Back!" + stat cards — **12 Smartphones**, **4 Active Offers**
  ("2 this week"), **8 Repair Services** ("No change"), **6 Gallery Images** ("+2 new")
- **Quick Actions:** cards for Edit Home Section · Manage Offers · Manage
  Smartphones · Manage Brands · Manage Repairs · Manage Accessories · Gallery ·
  Store Information
- **Website Preview** panel with "Open Website" / "Edit Home Section"
- **Recent Updates** feed, **Contact Messages** list, **Site Analytics (Last 30
  Days)** with a bar chart (Total Visitors 1,248, Product Views 386, Contact Clicks
  42, 25%)

**Mapping to your brief:** sidebar → keep **Dashboard, Home Content, Offers,
Smartphones, Brands, Repair Services, Accessories, Gallery** (renaming "About Us" +
"Store Information" → your "Business Information"). **Drop** Contact Messages,
Settings, and Site Analytics. Stat cards are legitimate because the brief asks for
*real database counts* — so 12/4/8/6 become live `COUNT(*)` values. Note the invented
email `admin@smartphonecafe.in` is **not verified**; I'll use it as a login username
only if you confirm, never as a public business contact.

---

## 7. Confirmed defects (measured, not guessed)

Measured with a CDP harness across 9 widths and all 6 routes:

1. **React console error on every route that renders a photo.** `Photo.jsx:37` passes
   `fetchPriority` (camelCase) to `<img>`. React 18 does not recognise it and warns:
   *"React does not recognize the `fetchPriority` prop… spell it as lowercase
   `fetchpriority`"*. **Fix: one character-class change.** Real, reproducible.
2. **Hero headline wraps to 3 lines instead of ≤2** at **1024, 1280, 1440, 1920**
   (50px type in a 5-of-12 column) and at 320/360. Wants `max-w`/size tuning or a
   wider copy column.
3. **35px horizontal overflow at 320px on `/repairs` only.** Isolated to
   `Repairs.jsx:127` — the decorative glow `<div className="absolute -right-32 top-0
   h-[30rem] w-[30rem] rounded-full">` inside a `relative overflow-hidden` section.
   The section clips paint but the element still extends the scroll box. Other pages
   are clean at 320px.

Also noted, low severity: the skip link measures 1×1 when unfocused (expected for
`sr-only`); React Router emits 2 v7 future-flag warnings.

---

## 8. Proposed implementation plan

**Guiding rule: never lose verified data or the working site.** Every phase ends in
a verifiable, committable state.

### Phase 0 — Safety net (do first, nothing else)
1. `git init` here; commit current state as the baseline on `main`.
2. Add remote `origin` → `tejas524/smartphonecafe-website` (existing, empty, private).
3. Push the baseline. **No restructure until this succeeds.**
4. Confirm the 9 originals in `shop photo/` are either committed or ignored
   deliberately — currently untracked and *not* ignored. Decide explicitly.

### Phase 1 — Fix the 3 defects (small, independently verifiable)
`fetchpriority` casing; hero headline width; `/repairs` glow overflow. Re-run the
harness; all 6 routes must be clean at 320→1920.

### Phase 2 — Restructure
`git mv` into `frontend/` (existing site) and create `backend/`, `database/`,
`uploads/`. One commit; build must still pass afterwards.

### Phase 3 — Database
`database/schema.sql` with the 10 tables + FKs + `utf8mb4`/InnoDB. Portable SQL only
(no 8.0-only syntax, so Hostinger's MariaDB is safe). `database/seed.sql` generated
**from the existing `src/data/*.js`** so verified content becomes row data.
**Blocked on credentials.**

### Phase 4 — Backend
Express + `mysql2/promise` pool, `.env.example`, bcrypt auth (httpOnly cookie),
`requireAuth` middleware, Zod/Joi validation, `multer` + **sharp** uploads (reusing
the proven pipeline) writing to `uploads/` with only paths in MySQL, centralised
error handling, `GET /api/health`. REST per the brief. **Every write endpoint
authenticated; public GETs read-only.**

### Phase 5 — Admin UI
`/admin/login` + protected shell (dark sidebar, light content, blue accent — reusing
`index.css` tokens and `Icon.jsx`). The 8 permitted sections, each with list/add/
edit/delete, confirm-before-delete, and empty/loading/error/success states. Dashboard
shows real counts. **Excludes** analytics, messages, settings, CRM.

### Phase 6 — Public site on the API
Add a small data layer with loading/error states — **if the API is down, show an
honest error, never silent fallbacks to stale or fake data.** Then restyle the public
pages to the prototype's section order and visual language.

### Phase 7 — Verify
Rebuild; re-run the CDP harness (6 routes × 9 widths, zero console errors, zero
overflow, zero broken images). **Round-trip test: edit in admin → confirm the change
appears on the public page after a hard refresh.** `npm start` serves the SPA + API
same-origin. Grep the tree for Supabase/Firebase/Vercel/Netlify imports and hardcoded
localhost URLs, and report what is found.

### Phase 8 — Commit
`feat: build SmartphoneCafe standard business website`, push, verify on GitHub.

### Honest limitations I will carry into the final report
- **I cannot see any image.** The redesign follows the prototype's *structure and
  text order* from OCR — **not its visual appearance.** I cannot judge whether the
  result looks premium, and that judgement will need an image-capable model or your
  eyes. I will say so plainly rather than claim a visual match.
- **Photo content is inferred** from the owner's filenames plus OCR of in-store
  signage, never from my own viewing.
- **MySQL persistence stays unverified** until credentials exist.
- `web_search` is broken in this session (`HTTP 401`, invalid API key — a config
  issue, not something I changed), so no external lookups.

---

## 9. Decisions I need from you before Phase 3–4

1. **MySQL credentials** — via option (a), (b) or (c) in §4.
2. **Brand logos** — the prototype shows real manufacturer logos, but the current
   site renders brand *wordmarks* because authorised-dealer status is unverified, and
   the brief forbids that claim. Logos imply a relationship. Keep wordmarks, or
   upload logos yourself in the admin?
3. **Does the shop's own material authorise offer/price content?** The OCR shows the
   shop *does* advertise real promotions in-store (Bajaj Finserv EMIs, cashback, and
   the shop's own offer boards). If you can supply real current offers, the Offers
   section becomes genuine rather than a placeholder — otherwise the section stays
   empty until you add content.
4. **Admin login identity** — is `admin@smartphonecafe.in` real, or should I use a
   username you specify? (It is unverified.)

**Awaiting your approval before any change.**