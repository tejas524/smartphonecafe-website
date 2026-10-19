# Website launch checklist

Reviewed 19 October 2026. Vercel is a public website preview using exported content; the full backend is intended for Hostinger.

| Item from the reference | Implementation / status |
| --- | --- |
| Privacy policy | Public page updated to match maps, preference storage, hosting logs and optional analytics. Owner contact/entity/retention details remain clearly marked for later editing. |
| Terms and conditions | Public page present. Owner return/exchange and repair-warranty details remain marked for later editing. |
| Frontend secrets | Public frontend uses no database/password/JWT variables. Checked tracked environment files and common secret markers in source/public/build output; no matches in frontend. Backend `.env` stays private. All `VITE_` values are public. |
| HTTPS | Vercel TLS plus HSTS/security headers configured. Express production redirects HTTP to the configured HTTPS origin, with production origin validation. Hostinger must terminate TLS and forward the protocol header through its trusted proxy. |
| Cookie consent | Optional maps and configured analytics start off. Essential only, Allow optional and individual preferences persist on the device. Footer Privacy settings reopens choices; withdrawing map consent removes the iframe. |
| Meta titles/descriptions | Existing per-route metadata retained; canonical/OG origins now use `VITE_SITE_URL`. Social crawlers that do not execute JavaScript receive the default site metadata. |
| Social preview image | Existing local 1200 x 630 OG image retained, with deployment-correct absolute URL. |
| Favicon | Existing SVG favicon, Apple icon and manifest retained. |
| Sitemap / robots | Generated in both builds. Preview explicitly disallows crawling/noindex; production allows public pages and excludes admin/API. Backend production endpoints remain authoritative and exclude the obsolete offers redirect. |
| Image alt text | Browser scan found no missing alt attributes or broken rendered images on tested routes. |
| Image compression | Existing responsive WebP generation, lazy loading, content-hashed variants and immutable caching retained. See loading-performance.md for earlier asset reductions. |
| Load speed | Two local cold mobile measurements: LCP 2.06 / 2.14 s; FCP 1.69 / 1.70 s; CLS 0.00025. Simulated 150 ms latency, 250 KB/s download, 4x CPU slowdown, 390 x 844 at DPR 2. Lab measurements, not real-user field scores. |
| Color contrast | Darker WhatsApp controls; readable muted text on light/dark backgrounds. Browser accessibility scan passed the tested public pages. |
| Mobile responsiveness | Tested at 320 and 1440 px, including loaded below-fold content, product detail, legal pages, admin preview and 404. No page overflow. Earlier responsive work covers additional breakpoints. |
| Custom 404 | Built 404.html renders the existing helpful React 404. Selective Vercel rewrites preserve unknown-path/missing-asset HTTP 404; Express does the same. Unknown product IDs still use the catalog's client-side empty state. |
| Broken links | 26 distinct internal URLs, including fragment targets, checked successfully. External phone/WhatsApp links were inspected without sending messages. |
| Form validation | Required name/Indian mobile/problem, field length limits, associated errors and focus on first invalid field. Valid enquiry prepares a WhatsApp draft; website does not send it. |
| Spam protection | Offscreen honeypot and 30-second repeat-draft guard. These are client deterrents, not a replacement for server protection. Backend login rate limiter verified with invalid empty requests; public enquiry flow has no server submission endpoint. |
| Analytics | Optional consent-gated Vercel Web Analytics integration ready; disabled by default. Query strings/fragments removed, private/unknown paths excluded, browser opt-out respected. Tested opt-in and withdrawal using a mocked SDK script, without sending real visits. |
| Clear primary CTA | WhatsApp Us is first and visually primary in the hero; catalog is secondary. |

## Owner details to add later

Edit `frontend/src/pages/PrivacyPolicy.jsx` and `TermsAndConditions.jsx` when the shop's final legal contact, retention, return/exchange and repair-warranty terms are available. They have deliberately not been invented.

## Enable analytics when ready

In the Vercel project dashboard, enable Web Analytics. Set public build variable `VITE_ENABLE_ANALYTICS=true` and redeploy. Visitors must then opt in; Essential only does not load analytics. This integration uses Vercel's same-origin analytics endpoints. Keep it disabled on Hostinger unless a working analytics service is configured there.

## Hostinger handoff

Use the normal build and set frontend `VITE_SITE_URL` and backend `PUBLIC_SITE_URL` to the same final HTTPS origin. Configure HTTPS and the reverse proxy correctly (the app trusts one proxy hop). Do not copy Vercel's preview noindex header to the final production server. See deployment.md for database, uploads and Node hosting instructions.

## Verification

- Normal and preview builds passed; generated robots.txt, sitemap.xml and 404.html checked.
- Frontend dependency audit: zero known vulnerabilities after compatible package updates.
- Browser checks: consent persistence/revocation, no initial third-party requests, banner accessibility, form errors/success/cooldown, honeypot, internal links, images and runtime errors.
- Automated axe WCAG A/AA scan at 320/1440 px: zero violations on 11 tested routes per size. Automated checks do not constitute a full accessibility certification.
- Local production server: fixed-origin HTTPS redirect, security headers, nested routes, missing assets, authentication guard and login rate limit passed without database writes.
