# Loading improvements

The homepage now paints its hero and store highlights without waiting for the
carousel and lower-page module. Static Vercel previews initialise public data
from their build snapshot, avoiding a separate bootstrap request and moving
header/rating text. Normal production builds still fetch the live API.
The admin application is also loaded separately when opening `/admin`, keeping
admin UI and authentication code out of the public site's initial bundle.
The normal production entry chunk decreased from 121.19 KB to 62.25 KB
(33.78 KB to 19.61 KB gzip) after this split.

Product, accessory and offer artwork uses responsive WebP variants. New CMS
upload URLs fall back to their existing files. Generated filenames contain a
content hash, allowing immutable caching without showing old images after
changes. Vercel also caches the hashed JavaScript/CSS assets. Images are never
cropped by the generator; existing lazy loading is retained.

The hero photograph is visible immediately rather than fading in over 1.3
seconds. Intro text retains a shorter animation. Local production previews also
serve exported uploaded files correctly instead of proxying them to an offline
development backend.

## Local verification

Two cold mobile runs per build in headless Edge: 390 × 844 CSS pixels, DPR 2,
150 ms simulated latency, 250,000 bytes/second download, 4× CPU slowdown, cache
disabled. Measurements cover 12 seconds after DOMContentLoaded, without scrolling.

| Measurement | Before | After |
| --- | ---: | ---: |
| Completed resource body bytes | ~2.10 MB | 0.85 MB |
| Layout shift score (CLS) | 0.325 | 0.00005 |
| Three offer banners requested on mobile | 1.49 MB | 0.159 MB |
| Median first contentful paint | 1.69 s | 1.84 s |
| Largest contentful paint after changes | — | 2.10 s |

The transfer and layout improvements are measured; first-paint time did not
improve in this local test. The former hero opacity animation makes its earlier
LCP result unsuitable for an equivalent visible-hero comparison. These are local
Vite preview measurements, not live Vercel Core Web Vitals; Vercel's response
compression and real visitor connections will differ. The baseline also had two
failed local upload requests; the after result includes their repaired image
responses (about 76 KB), making the reported byte reduction conservative.

Browser checks covered home, smartphones, product detail, accessories, gallery,
about, contact, legal pages, the preview admin notice and direct offers anchors
at 390 px and 1440 px widths. No broken images, missing responses, horizontal
overflow or JavaScript page errors were found.

## Maintaining the improvements

Builds automatically run `images:responsive`. This updates the manifest and
generated WebP files when source artwork changes, and reuses unchanged outputs.
Commit the generated manifest and assets with the relevant source changes.
Use `npm --prefix frontend run images:responsive` when changing images during
local development. The in-place compression script skips content-hashed output
files. Original URLs remain available for compatibility and CMS editing.
