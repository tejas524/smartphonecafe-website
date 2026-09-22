# catalog-src — raw owner-supplied catalog imagery (source, not served)

These are the original images the shop owner supplied for the Latest Smartphones
and Accessories sections. They live **outside** `public/` on purpose, so they are
never served to visitors or copied into the production build.

`npm run catalog` (from `frontend/`) re-encodes/rescales them into the served
assets — it only optimises; it never composites, combines or invents content:

| source folder | → generated (served) | used by |
|---|---|---|
| `catalog-src/smartphone-images/` | `public/product-images/<slug>.webp` | Latest Smartphones |
| `catalog-src/accessory-image/`   | `public/accessory-images/<slug>.webp` | Accessories |

Slug mapping lives in `scripts/process-catalog-images.mjs`. Offer banners are
**not** processed here — they are used exactly as supplied from
`public/offers-images/`.

## Provenance

- Smartphone renders: official manufacturer product images supplied by the owner.
  Model identities were confirmed by the owner:
  iPhone 16, Samsung Galaxy S26 FE, Motorola Edge 60, Redmi Note 14, OPPO Reno 16 5G.
- Accessory category banners: promotional artwork supplied by the owner
  (covers, chargers & cables, tempered glass, earphones & audio, power banks,
  other accessories).

Nothing here is presented on the site as confirmed live stock or with a price.
