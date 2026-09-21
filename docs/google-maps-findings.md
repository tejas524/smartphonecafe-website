# Google Maps Extraction — Verified Findings

Source: https://maps.app.goo.gl/XwvLKCfxm1MawvcT8
Resolved to: https://www.google.com/maps/place/Smart+Phone+Cafe/@18.7333126,73.5256342,12z/data=!4m7!3m6!1s0x3bc2b1935d5671d9:0x96e00ddd4c0a9f23!8m2!3d18.7333126!4d73.6780695!16s%2Fg%2F11dftbwglj
Retrieved: 2026-09-20 (via Google Maps' own public `tbm=map` search surface)

## VERIFIED — safe to publish

| Field | Value | Source |
|---|---|---|
| Profile name | Smart Phone Cafe | Maps listing |
| Also rendered as | SmartphoneCafe / Smart Phone Cafe | supplied brief + listing |
| Place ID | ChIJ2XFWXZOxwjsRI58KTN0N4JY | listing |
| CID | 0x3bc2b1935d5671d9:0x96e00ddd4c0a9f23 (dec 10871704744587075363) | listing |
| Coordinates | 18.7333126, 73.6780695 | Maps URL |
| Plus code | PMMH+86 Talegaon Dabhade R, Maharashtra | listing |
| Phone | 09922599577 / +91 9922599577 | listing (= supplied brief) |
| Address | shop no 7, samrthchaya apartment, Talegaon Station Rd, near umang medical, Vatan Nagar, Talegaon Dabhade R, Maharashtra 410507 | listing (= supplied brief) |
| Status | Open · Closes 9:30 pm | listing |
| Hours | Sunday–Saturday 10:00 am – 9:30 pm (all 7 days) | listing encoded `[[10],[21,30]]` |
| Timezone | India Standard Time | listing |

### Categories (all confirmed on the listing)
- Primary: **Mobile phone repair shop**
- Also listed: Phone repair service · Cell phone store · Cell phone accessory store · Data recovery service

### Official business description (verbatim, business-authored)
> "Discover the ultimate mobile experience at Smart Phone Cafe! Whether you're looking for the latest
> smartphones, reliable accessories, or expert advice, our friendly team is here to help you find exactly
> what you need. Enjoy exclusive deals, quick repairs, and personalized service—all in one stop.
> Visit Smart Phone Cafe today and let us upgrade your digital lifestyle!"

This is the only business-authored copy. It confirms, as first-party claims:
smartphones · accessories · advice · deals · quick repairs · one-stop shop.

### Accessibility attributes listed
Wheelchair-accessible car park (YES). Entrance / seating / toilet attributes are
contradictory in the payload (both "Wheelchair-accessible entrance" and
"No wheelchair-accessible entrance" appear), so they are **excluded** as unverified.

### Reviews
- Aggregate rating value **4.9** appears in the payload; the review count is **not**
  present in the accessible response.
- Three review snippets are visible: "Very good service and very competitive staff.",
  "Good quality accessories and Services", "This shop really impressed me with their
  selection and financing options."
- **Decision: NOT used on the website.** The count is unknown, attribution cannot be
  independently confirmed, and the brief forbids fabricated review data. The site
  links to the Google listing instead.

## COULD NOT ACCESS

### Photos — the key limitation
The Google Maps **Photos** section could not be extracted.

- `maps/place/...` desktop + Android + iOS user agents return a JavaScript shell
  (~205 KB) with **no** place data server-side.
- The public `tbm=map` search surface returns full business data but only Google's
  **generic default blue business avatar** — verified programmatically as a 720×720,
  13-colour flat placeholder icon, not a photograph.
- Photo listing/streaming lives behind Google's internal batchexecute RPC and requires
  session tokens. Per the brief, this was **not** bypassed; no anti-bot system,
  auth wall or CAPTCHA was circumvented.

**Conclusion: 0 real SmartphoneCafe photographs available. No stock imagery substituted.**

### Also unavailable
- Review count / review dates
- Menu, price list, stock, offers detail
- Verified brand partnerships or authorized-dealer status
- Instagram or any social profile (none listed — none invented)