# Phase 5 — public website redesign

**Status:** complete. The public homepage was rebuilt to the approved prototype's
13-section structure and visual direction, using only SmartphoneCafe's verified
content and existing photos. A 91-assertion headless-browser harness passes with
**0 failures**.

**Scope kept:** no `/admin` UI, no API/database changes. Local verified data only
(`data/*.js`), exactly as this phase required.

---

## Homepage section order (now matches the prototype)

| # | Section | Source |
|---|---|---|
| 1 | Top bar — `Smartphones · Repairs · Accessories` + phone + hours | `layout/TopBar.jsx` (new) |
| 2 | Navigation | `layout/Header.jsx` |
| 3 | Hero | `sections/Hero.jsx` |
| 4 | Trust / features | `sections/TrustBar.jsx` (new) |
| 5 | Offers — "Current offers" | `sections/OffersSection.jsx` (new) |
| 6 | Brands — "Shop by brand" | `sections/BrandGrid.jsx` |
| 7 | Smartphones | `pages/Home.jsx` |
| 8 | Repairs — "Mobile repair services" | `pages/Home.jsx` |
| 9 | Accessories — "Everything you need" | `pages/Home.jsx` |
| 10 | Gallery — "Inside SmartphoneCafe" | `pages/Home.jsx` |
| 11 | About — "About SmartphoneCafe" | `pages/Home.jsx` |
| 12 | Store + Map — "Visit our store" | `sections/LocationSection.jsx` |
| 13 | Footer | `layout/Footer.jsx` |

A closing WhatsApp / call band (`CtaBand`) sits just above the footer.

---

## What changed and why

- **Header re-architected to the prototype.** The old transparent overlay header
  became a slim dark **TopBar** (in normal flow, scrolls away) above a **solid
  white sticky navigation** that stays pinned. Because the nav is `sticky` it
  occupies real layout space, so the manual `pt-16` offset in `Layout` was
  removed and the hero uses ordinary top padding. Desktop actions now include the
  phone number (from `xl`) and the WhatsApp button.
- **Hero** follows the prototype's direction — headline *"Your trusted mobile
  shop in Talegaon Dabhade"* with a sub-line that reuses the shop's **own Google
  listing wording** ("latest smartphones, reliable accessories … quick repairs"),
  two CTAs (Explore Smartphones + WhatsApp), and the real interior photograph.
- **New Trust / features strip** — four evidence-backed reasons (open all 7 days,
  on-site repairs, sales·service·accessories, easy EMI in store). No rating,
  review count, years-in-business or "No. 1" claim.
- **New Offers section** — the prototype's "Special Deals / Current Offers" done
  **honestly**. It mirrors the three `offers` rows the Phase 3 seed built from
  verified evidence. The prototype's mock figures (₹499, 20% Off, Up to ₹10,000
  Off) are **deliberately not reproduced**; every card is an enquiry prompt that
  routes to WhatsApp or a call, with a source note and an explicit "no price /
  discount / expiry is shown" disclaimer.
- **Sections reordered** to the prototype sequence; About was moved from the top
  into position 11 and now folds in the verified Google-listing description as an
  attributed blockquote. LocationSection retitled to "Visit our store".

---

## Constraints honoured

- **Real branding + verified content only.** All copy comes from `data/site.js`,
  `data/brands.js`, `data/repairs.js`, `data/accessories.js`, `data/photos.js`
  and the new `data/offers.js` (which mirrors the seed). No business fact was
  invented.
- **Reference branding/content not copied.** The prototype's mock prices and
  offer text were not used; brands remain **typographic wordmarks**, never
  manufacturer logos, so no authorised-dealer relationship is implied.
- **Existing photos + Phase 1 fixes preserved.** Same processed WebP/JPEG set,
  same `Photo` component (lowercase `fetchpriority`), same overflow guards.
- **732×660 storefront never upscaled.** Its data caps at a 700px source and the
  harness explicitly asserts no image is ever rendered wider than its intrinsic
  width, on every route and every width.
- **All public routes kept working and consistent** — they share the new
  Header/TopBar/Footer and were re-verified.
- **Responsive from 320px.** Verified at 320–1920.
- **No API/database change, no `/admin`.**

---

## Verification — `_tools/phase5-verify.mjs` (headless Edge over CDP)

Serves the production `frontend/dist` build through a self-contained static
server with SPA fallback, waits for `readyState=complete` + `fonts.ready` + all
images settled before measuring, then asserts. **Result: 91 passed, 0 failed.**

- **Production build:** clean (`vite build`, 69 modules, no errors).
- **Horizontal overflow:** 0 at **320, 360, 375, 390, 430, 768, 1024, 1280,
  1440, 1920** on the homepage (a 1024px lg-breakpoint overflow was found and
  fixed by deferring the header phone-number text to `xl`).
- **No image upscaling:** asserted at every width and every route, including the
  732×660 storefront.
- **Hero h1** wraps to ≤ 3 lines at every width ≥ 768.
- **Console:** 0 errors and 0 uncaught exceptions on all six routes; the harness
  also fails on any React `fetchPriority` / hydration warning — none occurred.
- **Images:** 0 broken, every `<img>` has `alt`, on all six routes.
- **Structure:** exactly one h1 per route; meta description present; homepage
  contains all ten prototype landmarks; footer shows a copyright year.
- **Sticky nav:** confirmed still pinned to the top (`top ≈ 0`) after scrolling.
- **Banned claims:** a text scan of every route found **none** of "No. 1", "best
  in Talegaon", "N years", "N repairs", "100% genuine", "authorised service
  centre/dealer", star glyphs or "x/5"-style ratings.

`_tools/phase5-verification.json` holds the full per-route/per-width record.

---

## Files

**New:**
- `frontend/src/components/layout/TopBar.jsx`
- `frontend/src/components/sections/TrustBar.jsx`
- `frontend/src/components/sections/OffersSection.jsx`
- `frontend/src/data/offers.js` (honest offers + trust features, mirrors the seed)

**Changed:**
- `frontend/src/components/layout/Header.jsx` — TopBar + sticky solid nav
- `frontend/src/components/layout/Layout.jsx` — removed the fixed-header offset
- `frontend/src/components/sections/Hero.jsx` — prototype direction + normal padding
- `frontend/src/components/sections/LocationSection.jsx` — retitled "Visit our store"
- `frontend/src/pages/Home.jsx` — rebuilt to the 13-section prototype order

**Not committed (git-ignored):** `frontend/dist/`, `_tools/`.

---

## Unverified / carried forward

- **Pixel-level fidelity to `prototype of smartphonecafe.png` remains unverified**
  — no image is viewable in this environment. The redesign follows the
  prototype's OCR'd **structure, section order and visual direction**; a final
  visual sign-off needs a human or an image-capable reviewer.
- The homepage still uses **local verified data**; repointing it at the Phase 4
  API (MySQL as the source of truth) is Phase 6.
- A **repair-bench photograph** still does not exist, so the repairs section is
  illustrated with the counter-service frame, captioned as the counter — not a
  repair bench.
