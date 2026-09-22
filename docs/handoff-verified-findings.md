# Handoff — Verified Findings

> **NOTE (added in Phase 2):** the project was restructured after this document
> was written. Paths here that begin with `src/`, `public/` or `scripts/` now
> live under `frontend/` (e.g. `src/data/site.js` is now
> `frontend/src/data/site.js`). `shop photo/` is unchanged at the repository
> root. See `docs/phase-2-restructure.md` for the full mapping. The findings
> themselves are unaffected.

**Author:** the DeepSeek Harness agent (`deepseek-v4.1-flash:free`)
**Status:** stood down. A concurrent agent (Claude Code) owns the build in this folder.
**Purpose:** preserve everything this agent verified so none of it is re-derived or contradicted.

No application code was written after the stand-down. The only files this agent
touched are listed under "Artifacts left behind" at the end.

---

## 1. Google Maps profile — VERIFIED, use freely

Resolved from `https://maps.app.goo.gl/XwvLKCfxm1MawvcT8` to the canonical place
URL, then read from Google Maps' own public `tbm=map` search surface. Full detail
in `docs/google-maps-findings.md`.

| Field | Verified value |
|---|---|
| Listing name | **Smart Phone Cafe** (profile renders it "SmartphoneCafe" too) |
| Place ID | `ChIJ2XFWXZOxwjsRI58KTN0N4JY` |
| CID | `0x3bc2b1935d5671d9:0x96e00ddd4c0a9f23` (dec `10871704744587075363`) |
| Coordinates | `18.7333126, 73.6780695` |
| Plus code | `PMMH+86 Talegaon Dabhade R, Maharashtra` |
| Phone | `09922599577` / `+91 99225 99577` — matches the brief |
| Address | `shop no 7, samrthchaya apartment, Talegaon Station Rd, near umang medical, Vatan Nagar, Talegaon Dabhade R, Maharashtra 410507` — matches the brief |
| Status | Open · Closes 9:30 pm |
| Hours | **Sunday–Saturday, 10:00 am – 9:30 pm — identical all 7 days** (encoded `[[10],[21,30]]`) |
| Timezone | India Standard Time |

**Listing categories (all confirmed):** Mobile phone repair shop (primary) ·
Phone repair service · Cell phone store · Cell phone accessory store ·
Data recovery service

**Business-authored description, published on the listing (verbatim):**

> "Discover the ultimate mobile experience at Smart Phone Cafe! Whether you're
> looking for the latest smartphones, reliable accessories, or expert advice, our
> friendly team is here to help you find exactly what you need. Enjoy exclusive
> deals, quick repairs, and personalized service—all in one stop. Visit Smart
> Phone Cafe today and let us upgrade your digital lifestyle!"

This is the only business-authored copy that exists. It first-party confirms:
smartphones · accessories · advice · deals · quick repairs · one-stop shop.

---

## 2. Google Maps photos — NOT extractable (do not waste time re-trying)

- `maps/place/...` (desktop, Android and iOS user agents) returns a **JavaScript
  shell** (~205 KB) with no place data server-side.
- The public `tbm=map` surface returns full business data but only Google's
  **generic default blue business avatar** — verified programmatically as a
  720×720, 13-colour flat placeholder icon, **not** a photograph.
- Photo listing/streaming sits behind Google's internal authenticated
  `batchexecute` RPC. This was **not** bypassed: no auth wall, CAPTCHA or
  anti-bot control was circumvented.

**Conclusion: 0 photographs obtainable from Google. The owner supplied 9 real
photos separately, which are now processed and in use.**

### Deliberately NOT published
- **Aggregate rating 4.9** appears in the payload, but the **review count is
  absent**. Three review snippets are visible ("Very good service and very
  competitive staff.", "Good quality accessories and Services", "This shop really
  impressed me with their selection and financing options."). All were
  **excluded** — the count is unknown, attribution is unverifiable, and the brief
  forbids fabricated review data. The site links to the Google listing instead.
- **Wheelchair-accessibility attributes were excluded** as unverified: the payload
  contains both "Wheelchair-accessible entrance" and "No wheelchair-accessible
  entrance". Only "Wheelchair-accessible car park" is unambiguous.

---

## 3. Shop photographs — processed and verified

9 owner-supplied originals in `./shop photo/` → **34 published files** in
`public/shop-images/` (25 WebP responsive variants + 9 JPEG fallbacks).

- Pipeline: `scripts/process-shop-photos.mjs` (`npm run photos`)
- Generated data module: `src/data/photos.js`
- **EXIF/GPS stripped — verified: 0 of 34 published files retain camera metadata.**
- Total published weight: 6.06 MB across all variants.

Technical triage of the originals:

| Original | Source size | Crop | Sharpness | Notes |
|---|---|---|---|---|
| `store photo from inside.jpg` | 4000×2250 | 16:9 | very sharp | Best frame — used as hero |
| `shop owners photo with customer.jpg` | 4000×1800 | 20:9 | very sharp | |
| `shop owner with customer 4.jpg` | 4000×1893 | 20:9 | very sharp | |
| `shop interior 2.jpg` | 3264×1472 | 20:9 | very sharp | |
| `selling items photo.jpg` | 4000×3000 | 4:3 | very sharp | |
| `shop owner with customer 3.jpg` | 4000×1800 | 20:9 | very sharp | |
| `shop owner with customer 2.jpg` | 4000×3000 | 4:3 | sharp | |
| `customer with phone.jpg` | 3000×4000 | 3:4 portrait | sharp | |
| `store photo from outside.jpg` | **732×660** | ~1:1 | sharp | **Low resolution — cannot be shown large; never upscale it** |

All are well-exposed with acceptable contrast. **No image-viewing capability
existed in this session** (the model does not accept image input), so content
identification rests on the owner's own filenames plus the OCR evidence below —
not on visual inspection by this agent.

---

## 4. OCR evidence from the shop photographs — high value, use with care

A concurrent agent OCR'd the originals into `_tools/ocr-shop-photos.txt`. This is
**genuine primary evidence of what the shop actually displays**, because it reads
the shop's own wall posters, display signage and the signboard.

### Confirmed legible
- **The signboard reads `SMART PHONE CAFE`** (from `store photo from outside.jpg`) —
  independent confirmation of the exact trading name on the shop front.
- **Bajaj Finserv EMI financing is offered in store.** Repeated clearly across
  multiple photos: `BAJAJ FINSERV`, `EMIS STARTING`, `AVAILABLE ON EASY EMIs`,
  `EMIS STARTING R500*`, `₹2500*`, `5% CASHBACK`, and what reads as `NO COST EMI`.
  This **corroborates the public review** mentioning "financing options".
- `MNP` — Mobile Number Portability appears, suggesting that service is offered.

### Brand and model evidence (signage/posters in the shop)
- **OPPO** — heavily represented: A15, A33, A53, A54, F17, F19 Pro, F19 Pro+, F19s,
  Reno 8 Series, Reno 12 Series
- **vivo** — V20, Y17, Y20, Y21, Y30, Y33, Y91/Y91i/Y91J, plus "Y Series"
- **Samsung** — Galaxy A14 5G (OCR renders it `calaxyA14 5G`; clearly Galaxy A14 5G)
- **Realme** — narzo 20A (`narz020A` in OCR)
- **Tecno** — Spark
- **HMD** — HMD 105
- `INDIA'S FIRST … EYE AUTOFOCUS SELFIE` alongside `vivo V20` is vivo's own V20
  marketing copy (44MP eye-autofocus selfie).

### Important caveats — do not overclaim
- **OCR output is noisy.** Readings like `dDP0`, `ezEåköNtcs`, `PAI-IO`, `Wiroloss`,
  `spoakor`, `Segrtwnes Slirrtmøe` are garbage and must not be quoted.
- Model strings above are **photographed promotional posters**, so they evidence
  *what the shop advertises*, **not verified current stock or pricing**. Treat as
  "brands the shop deals in", never as a live inventory or price list.
- **No evidence appeared for Apple/iPhone, Motorola, POCO, Redmi/Xiaomi or Lava**
  in the OCR, even though the brief lists them. The brief's brand list is therefore
  *broader* than what these photographs evidence. If brand presence must be
  evidence-backed, the photographed set is the defensible one.
- `10 -IOS. 10 LAKHS` is unreadable in context — do not interpret it.

---

## 5. MySQL availability — CHECKED, one action needed

The new brief requires Node + Express + MySQL. Findings:

- **MySQL Server 8.0.46 is installed and running.**
  - `mysqld` is listening on **`127.0.0.1:3306`** (pid 5388). TCP connect: **success**.
  - X Protocol also listening on `33060`.
  - Client: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`
  - Also present: MySQL Workbench 8.0.
- **No `mysql`/`mysqld`/`mysqladmin`/`mariadb` on `PATH`** — use the full path above
  or add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to `PATH`.
- **Authentication is NOT available to this agent.** `mysql -u root` without a
  password returns:
  `ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)`
- No MySQL/MariaDB **Windows service** is registered (the server is running as a
  bare `mysqld` process), and no XAMPP/WAMP/Laragon install was found.

**Action required from the owner:** provide the MySQL username/password (and, if
not `root`, confirm it can `CREATE DATABASE`). Put them in `backend/.env` only —
never in frontend code, and never committed. Until credentials exist, the
admin → API → MySQL → public-site persistence flow **cannot be verified end to
end**, and that must be stated plainly rather than simulated with localStorage.

### Hostinger-compatibility notes worth honouring
- MySQL 8.0 locally vs Hostinger's MySQL/MariaDB: stick to portable SQL
  (`utf8mb4`, `InnoDB`, standard `AUTO_INCREMENT`) and avoid 8.0-only syntax.
- `caching_sha2_password` is the MySQL 8 default; older `mysql2`/PHP clients on
  shared hosting can fail against it. Prefer an app user created with
  `mysql_native_password` if a client proves incompatible — or confirm the
  Hostinger client version first.

---

## 6. Environment / toolchain facts

- Node **v24.13.0**, npm **11.6.2**. No `pnpm`.
- Git **2.52.0**, **not yet initialised in this folder** (`git status` → "not a git repository").
- GitHub CLI authenticated as **`tejas524`** via SSH; token scopes include `repo`.
- Target repo already exists and is **empty + private**:
  `https://github.com/tejas524/smartphonecafe-website`
- `gh repo list tejas524` shows no other repo matching this project.
- **npm global cache is write-blocked** by the sandbox. Use a workspace-local cache:
  `npm install --cache ".npm-cache"`. (`EPERM` on
  `C:\Users\…\AppData\Local\npm-cache\_cacache\tmp\…` otherwise.)
- **`npm install` lifecycle scripts can fail with `spawn EPERM`** under the
  restricted sandbox. `--ignore-scripts` works, because esbuild / `@tailwindcss/oxide`
  / sharp ship their Windows binaries as optional platform packages.
- Browsers available for headless testing: **Microsoft Edge only**
  (`C:\Program Files (x86)\Microsoft Edge\Application\msedge.exe`). No Chrome.
- **Vite/esbuild requires spawning a service child process with piped stdio**,
  which the workspace-write sandbox blocked with `spawn EPERM`. Builds need the
  wider file policy.

---

## 7. Things that must NOT be claimed (verified as unverifiable)

The brief forbids unsupported claims, and these specifically remain unverified:

- Years in business, number of repairs completed, staff count
- "No. 1", "best in Talegaon", "most trusted", "100% genuine"
- Authorised dealer / authorised service centre status for **any** brand
- Warranty terms of any kind
- Certifications, awards, partnerships
- Prices, current stock, model variants, colours, storage options
- Instagram or any social profile — **none is published; none was invented**
- An email address — **none published; the field is intentionally `null`**

Google Maps is the authoritative source for reviews and current status; the site
should link out to it rather than reproduce rating or review data.

---

## 8. Artifacts left behind by this agent

### Reconnaissance & evidence (throwaway, `_tools/` is gitignored)
`fetch-maps.mjs` · `probe-endpoints.mjs` · `parse-tbm.mjs` · `parse-reviews.mjs` ·
`parse-rating.mjs` · `probe-photos{,2,3}.mjs` · `fetch-avatar.mjs` ·
`analyze-image.mjs` · `triage-photos.mjs` · `verify-assets.mjs` ·
`ascii-preview.mjs` · `browser-test.mjs`
plus captured payloads (`probe-tbm-map-search.txt`, `tbm-parsed.json`,
`photo-triage.json`, `browser-report.json`).

### Genuinely reusable
- **`_tools/browser-test.mjs`** — headless CDP smoke test over every route. Reports
  console errors, uncaught exceptions, failed requests, **broken `<img>` elements**,
  missing `alt`, horizontal overflow, H1 count, meta description and thin content.
  Needs no Puppeteer/Playwright. Run: `node _tools/browser-test.mjs <origin>`.
  It caught a real `/gallery` crash (`ReferenceError: photos is not defined`).
  **Lesson encoded in it: open a tab at `about:blank` first, attach the debugger,
  then navigate — otherwise a module error fires before listeners exist and the
  failure is invisible.**
- **`_tools/ascii-preview.mjs`** — renders a PNG as ANSI art, so an image can be
  sanity-checked from a terminal when the model cannot accept image input.
- **`scripts/process-shop-photos.mjs`** — the image pipeline; idempotent, emits
  `src/data/photos.js`, strips EXIF/GPS.
- **`scripts/generate-brand-assets.ps1`** — generates `apple-touch-icon.png`,
  `icon-192/512.png` and the 1200×630 `og-image.png` via `System.Drawing`
  (no image toolchain dependency). Verified correct by ASCII preview.
- **`docs/google-maps-findings.md`** — the Maps evidence in full.

---

## 9. Design and content decisions worth preserving

- **Palette was derived from the shop's own material:** near-black "ink" surfaces
  + a single cobalt accent (`#2f6bff`/`#0b53e8`, matching the blue in the shop's
  signage) + WhatsApp green **reserved exclusively for WhatsApp actions** so it
  never becomes decorative.
- **Brand names are rendered as wordmarks, not manufacturer logos.** Because
  authorised-dealer status is unverified, reproducing brand logos would imply a
  relationship that has not been confirmed. Text is also crisper and free to load.
- **No stock photography anywhere.** Where a real photo was missing, the design
  used a deliberate, self-documenting photo slot rather than a random stock image.
- **Verified figures are separated from interpretation in the UI.** A "Straight
  facts" section on the About page lists only listing-derived data and says
  explicitly that ratings, review counts and authorised-dealer status are not
  claimed.
- **Open/closed is computed in `Asia/Kolkata`** (`src/utils/hours.js`) rather than
  from the visitor's clock, so "Open now" is never wrong for local customers.
  Computed after mount, so no stale status is baked into static HTML.
- **The repair enquiry form has no backend by design.** It validates, then hands off
  to WhatsApp with a fully composed message, and says so plainly. A fake
  "submission received" state would both lie and lose the enquiry. The file upload
  was **omitted rather than faked** (a file input that silently discards its file is
  a fake submission system); the form tells customers to attach photos in the chat,
  which genuinely works.
- **Footer carries a brand-name disclaimer:** brand names belong to their owners,
  are listed only to indicate the kinds of phones customers ask about, and nothing
  states or implies authorised dealership.