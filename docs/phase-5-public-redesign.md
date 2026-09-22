# Phase 5 — public website redesign (image-led)

**Status:** complete. The public homepage was rebuilt to the approved 13-section
structure with an image-led hero, owner-supplied offer banners, real official
brand logos, an official product-render "Latest Smartphones" section and
image-rich accessory cards. A 96-assertion headless-browser harness passes with
**0 failures**.

**Scope kept:** no `/admin` UI, no API/database changes. Local + owner-supplied
assets only.

---

## Homepage section order

| # | Section | Imagery |
|---|---|---|
| 1 | Top bar — `Smartphones · Repairs · Accessories` + phone/hours | — |
| 2 | Navigation (solid white, sticky) | — |
| 3 | Hero (full-width, image-led) | Real store interior photo + dark gradient |
| 4 | Trust / features | icons |
| 5 | Offers — "Current offers" | 4 owner-supplied banners, as-is |
| 6 | Shop by brand | 10 official brand logos (SVG) |
| 7 | Latest smartphones | 5 official product renders |
| 8 | Repairs | Real counter-service photo |
| 9 | Accessories | 6 owner-supplied category banners |
| 10 | Gallery | Real store photos |
| 11 | About | Real owner+customer photo + listing quote |
| 12 | Store + Map | keyless Google embed |
| 13 | Footer | — |

---

## Sections changed

- **Hero — rebuilt** from the split text/image into a large **full-width,
  image-led** hero: real store photo (`interior`, source 4000×2250) under a dark
  gradient, high-contrast headline "Your trusted mobile destination in Talegaon
  Dabhade", supporting line (reusing the shop's own listing wording), primary
  (Explore Smartphones) + secondary (WhatsApp) CTAs, and a live open-now / hours
  / location trust row.
- **Offers — rebuilt** to show the **four owner-supplied banners as-is** (one
  image = one offer), each tappable to a WhatsApp enquiry. No text is overlaid
  and no figure is asserted in code; an honest disclaimer notes terms are
  confirmed in store.
- **Shop by brand — rebuilt** from text wordmarks into **real official brand
  logos** on clean cards (graceful wordmark fallback if a logo fails).
- **Latest smartphones — new section** (after Brands, before Repairs): 5 cards
  using **official product renders**, each routing to a "Check Availability"
  WhatsApp enquiry. Framed explicitly as representative, not live stock.
- **Accessories — rebuilt** into 6 **image-rich category cards** using the
  owner-supplied banners (covers, chargers & cables, tempered glass, earphones &
  audio, power banks, other accessories), each with an icon fallback.
- **Repairs / Gallery / About / Store** — kept on **real SmartphoneCafe photos**.
- **Header/Layout/TopBar/TrustBar/LocationSection** — carried over from the
  earlier Phase 5 pass (sticky solid nav, no fixed-header offset).

---

## Assets used / sourced

**Hero:** `public/shop-images/smartphonecafe-interior-*` (real store photo, the
sharpest supplied frame; not upscaled).

**Offer banners (owner-supplied, used as-is):** `public/offers-images/`
`offer-accessories.png`, `offer-galaxy-a55.png`, `offer-covers-glass.png`,
`offer-exchange.png` (losslessly renamed from the originals; content unchanged).

**Brand logos (`public/brand-logos/`, separate SVG per brand):**
- Official vector logos: `apple`, `samsung`, `motorola`, `oppo`, `vivo`
  (Simple Icons); `realme`, `poco`, `redmi`, `tecno` (Wikimedia Commons SVG).
  Each fetched as text and verified vector-only (no `<script>`, no raster
  `<image>`, valid `viewBox`).
- `lava` — no clean official SVG was reliably available, so a neutral
  typographic wordmark was authored as a fallback (documented; not presented as
  the official mark).

**Latest smartphones (owner-supplied official renders → `public/product-images/`):**
`iphone-16`, `galaxy-s26-fe`, `motorola-edge-60`, `redmi-note-14`,
`oppo-reno-16-5g` (model identities confirmed by the owner).

**Accessory banners (owner-supplied → `public/accessory-images/`):** `covers`,
`chargers-cables`, `tempered-glass`, `earphones-audio`, `power-banks`,
`other-accessories`.

Raw owner uploads are kept in `frontend/catalog-src/` (outside `public/`, never
served); `npm run catalog` re-encodes them into the served assets. It only
optimises — it never composites, combines or invents content.

---

## Honesty constraints honoured

- **No fabricated commercial facts.** No price, discount, stock level or
  availability is asserted anywhere. Smartphone/accessory cards are
  representative and route to "Check Availability" / "Ask what is in stock".
- **Owner assets used as-is.** Offer banners are shown whole with no overlay;
  nothing generated, combined or replaced.
- **Brand logos are official and verifiable** (SVG source inspected); used
  nominatively to show brands sold — no dealership/partnership implied.
- **Real store photos** power Hero, Repairs, Gallery, About and Store.
- **No image upscaling:** phone renders use `object-contain`, and the harness
  asserts no image is ever rendered wider than its intrinsic width (incl. the
  small 495×330 Galaxy render and the 732×660 storefront).
- **Phase 1 fixes preserved:** overflow guards, lowercase `fetchpriority`,
  keyless Google embed, reduced-motion, focus-visible, `overflow-x:hidden`.
- **No API/DB change, no `/admin`.** All six public routes kept working.

---

## Verification — `_tools/phase5-verify.mjs` (headless Edge/CDP, production build)

**Result: 96 passed, 0 failed.**

- **Build:** clean `vite build`.
- **Horizontal overflow:** 0 at 320/360/375/390/430/768/1024/1280/1440/1920.
- **No upscaled images** at every width and route.
- **Console:** 0 errors, 0 uncaught exceptions on all 6 routes (fails on any
  React `fetchPriority`/hydration warning — none).
- **Images:** 0 broken, every `<img>` has `alt`, on all 6 routes.
- **Asset presence:** hero photo rendered; **4/4** offer banners; **10/10**
  brand logos; **5/5** product renders; **6/6** accessory banners.
- **Structure:** one h1 per route; meta description present; all 10 homepage
  landmarks present; sticky nav pinned after scroll.
- **Banned claims:** none of "No. 1", "best in Talegaon", "N years", "N
  repairs", "100% genuine", "authorised service centre/dealer", star glyphs or
  "x/5" ratings on any route.

`_tools/phase5-verification.json` holds the full per-route/per-width record.

---

## Remaining issues / notes

- **Visual fidelity is unverified against the reference by eye** — this model
  cannot view images. Fidelity was driven by the reference's OCR'd structure and
  by verifying asset *presence, dimensions and format* in a real browser, not by
  visual comparison. A human visual sign-off is still recommended.
- **Lava** uses an authored wordmark (no clean official SVG was reliably
  available); swap in an official SVG at `public/brand-logos/lava.svg` if
  desired.
- **Offer banners are ~0.5 MB PNGs each (~2 MB total)**, used as-is per the
  brief. If page weight matters, they can be re-encoded to WebP later.
- The featured smartphone/accessory sets live in `data/products.js` /
  `data/accessories.js`; drop a new render into the matching `public/*-images/`
  slug (or `catalog-src` + `npm run catalog`) to change them.
- Public site still uses local data; repointing to the Phase 4 API is Phase 6.
