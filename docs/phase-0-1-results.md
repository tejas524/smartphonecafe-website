# Phase 0 + Phase 1 — results

**Date:** 2026-09-22
**Repo:** https://github.com/tejas524/smartphonecafe-website (private)
**Status:** Phase 0 and Phase 1 **complete and verified**. Phase 2 not started.

---

## Phase 0 — safety net ✅

| Step | Result |
|---|---|
| `git init -b main` | done |
| Baseline commit | `8072729` — 97 files, 18.71 MB |
| Pushed to GitHub | ✅ verified: local SHA == remote SHA |
| Recovery tag | `pre-restructure-baseline` → `8072729`, **pushed** |
| Remote | `git@github.com:tejas524/smartphonecafe-website.git` (SSH) |
| Working tree | clean |

**Exclusions verified:** 0 files staged from `node_modules/`, `dist/`, `.npm-cache/`,
`_tools/`. **No `.env` file exists yet and none is tracked.**

Added `.gitattributes` — `* text=auto eol=lf` (kills Windows CRLF churn), binary
markers for image/font/PDF types, `*.sql text eol=lf`, and `linguist-generated` on
`package-lock.json` + `public/shop-images/**` so generated files don't pollute diffs.

**Decision taken — the 9 originals in `shop photo/` ARE committed.** They are the
owner's own source files, contain **no GPS EXIF** (verified with sharp across all 9),
and are the irreplaceable masters the published derivatives are generated from. The
published 34 files in `public/shop-images/` already had EXIF/GPS stripped.

### Push obstacle hit and resolved
The first push failed: **HTTP 408** on the 18.7 MB body, and the remote was HTTPS
while `gh` is configured for SSH. Switched the remote to
`git@github.com:...` and pushed over SSH — succeeded (`sfd` verified). Also raised
`http.postBuffer` in case HTTPS is used again later.

---

## Phase 1 — three defects fixed and verified ✅

Commit `6f25640`, pushed and confirmed on the remote.

### 1. React console error on every photo route
`Photo.jsx` passed camelCase **`fetchPriority`**, which React 18 does not recognise,
so it logged *"React does not recognize the `fetchPriority` prop"* on every render.
Now emitted as the lowercase **`fetchpriority`** attribute the HTML spec defines, and
only when the image is above the fold (no attribute at all otherwise). **Verified: 0
console errors on all 6 routes.**

### 2. Hero headline wrapped to 3 lines at ≥1024px
The copy column was **5/12 of a grid with `gap-16`**, leaving ~476px while the type
scaled to 50px. Changed to a **2-column split with `gap-14`** and widened the measure
from `19ch` → `21ch`.

The final size was **chosen empirically, not guessed**: I injected four candidate
class strings into the live DOM and measured line counts at five widths. One candidate
kept 52px type at xl while holding 2 lines; a narrower one wrapped. **Verified: 2 lines
at 390 / 768 / 1024 / 1440 / 1920px.** (320px still wraps to 3 — intentional at that
width, and the only width where it does.)

### 3. Horizontal overflow on narrow viewports
Two **independent** causes, both found by isolating the true min-width source:

- **`Button.jsx`** had `whitespace-nowrap` with fixed heights, so a long label like
  *"Check availability on WhatsApp"* enforced a **~298px min-content width**. Buttons
  now use `min-h` + padding and relax `nowrap` below 360px, so a wrapping label grows
  the *button* instead of the *page*. Desktop appearance is unchanged.
- **The Google Place ID** `ChIJ2XFWXZOxwjsRI58KTN0N4JY` is a single **27-character
  token with no break opportunity**, which forced its flex row — and every ancestor —
  wider than the viewport. Its cell now has `min-w-0` + `overflow-wrap:anywhere`. The
  same hardening was applied to the plus-code row in `LocationSection.jsx`.

---

## ⚠️ Important correction: my earlier measurement was wrong

My previous inspection reported **"0 overflow at 320px"** on the homepage. **That was a
false negative.** The harness measured before web fonts and lazy images had settled, so
text had not yet reflowed to its final width.

The rewritten harness now waits for `document.readyState === 'complete'`,
`document.fonts.ready`, and all images settled before measuring. Under the corrected
harness the real overflow was **+38px on `/` and +22px on `/repairs` at 320px**. Had I
trusted the first reading, the bug would have shipped. This is flagged because it
changes a claim I made in the inspection report.

---

## Verification evidence

`_tools/phase1-verify.mjs` — load-aware CDP harness, exit code 0/1 for CI use.

**Overflow sweep (homepage), all PASS:**

| width | 320 | 360 | 375 | 390 | 430 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|---|---|---|
| overflow | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Route health (all 6 routes), all PASS** — asserting 0 overflow, 0 console errors,
0 exceptions, single `<h1>`, no broken images, no image missing `alt`, meta description
present.

**Build:** passes — 65 modules, `index.html` 4.92 kB, CSS 48.31 kB (gzip 9.11),
app JS 124.27 kB (gzip 31.87), router 164.40 kB (gzip 53.79).

Artifacts: `_tools/phase1-verification.json`, `_tools/overflow-deep.json`.

---

## Files changed in Phase 1

- `src/components/ui/Photo.jsx` — `fetchpriority` casing
- `src/components/sections/Hero.jsx` — grid split, measure, type scale
- `src/components/ui/Button.jsx` — min-height + narrow-screen wrapping
- `src/pages/Home.jsx` — Place ID cell break opportunity
- `src/components/sections/LocationSection.jsx` — plus-code cell hardening

---

## Not done, and not claimed

- **Phase 2 (restructure) has not started.** No `frontend/`, `backend/`, `database/`
  or `uploads/` directory exists yet. Nothing was moved.
- **No database, no API, no admin.** Unchanged from the inspection.
- **`backend/.env` does not exist.** I have not created it, and I have no credentials.
  Per your instruction I will not ask for the password in chat — you create it.
- **I still cannot see any image.** The reference images remain unread visually.
- **Visual fidelity to the prototypes is unverified** and needs a human or an
  image-capable model. All verification here is geometric/measured only.

---

## Proposed next step (Phase 2)

Restructure into `frontend/` + `backend/` + `database/` + `uploads/` using **`git mv`
so history is preserved**, in one commit, with the build re-run afterwards to prove
nothing broke. This is the destructive step, and it is now safe because
`pre-restructure-baseline` is on the remote.

**Awaiting your go-ahead before Phase 2**, per your instruction to report before
continuing.
