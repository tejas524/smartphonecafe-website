/**
 * Extends the `accessories` table into a full product catalog and seeds a small
 * set of clearly-DEMO accessory products.
 *
 * WHY THIS SCRIPT EXISTS
 * The Phase 3 `accessories` table only carried enough columns for a name, a
 * price and a category. The Accessories catalog (matching the Smartphones
 * catalog) needs the same product fields smartphones already have — summary,
 * MRP, stock status, featured flag — plus two accessory-specific fields
 * (colour / variant and compatibility). Rather than create a duplicate table,
 * this migration ADDS the missing columns to the existing table, so the single
 * `accessories` resource in db/resources.js remains the source of truth.
 *
 * It is safe to run repeatedly:
 *   - columns are only added when missing (checked against information_schema);
 *   - demo products are only inserted when their slug is not already present.
 *
 * The seeded products carry realistic-but-EDITABLE demo prices and stock so the
 * catalog, homepage and admin CMS can be exercised end to end. They are ordinary
 * CMS rows: the shop owner edits or deletes them from Admin → Accessories. They
 * are not fixed SmartphoneCafe price/stock claims.
 *
 * Usage:  npm run extend-accessories
 */

import { query, queryOne, closePool } from "./../db/pool.js";

/** Columns to guarantee on `accessories`, mirroring the smartphones product shape. */
const COLUMN_DEFS = [
  ["summary", "VARCHAR(255) NULL AFTER slug"],
  ["mrp_amount", "DECIMAL(10,2) NULL AFTER price_currency"],
  ["stock_status", "VARCHAR(24) NULL AFTER stock_quantity"],
  ["colour", "VARCHAR(60) NULL AFTER stock_status"],
  ["compatibility", "VARCHAR(255) NULL AFTER colour"],
  ["is_featured", "TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active"],
];

/**
 * Demo products. category_slug is resolved to an id at run time so the seed does
 * not hard-code fragile numeric ids. Prices/MRPs are demo values, freely edited
 * in the CMS.
 */
const DEMO = [
  { name: "Premium Silicone Back Cover", cat: "protection", summary: "Soft-touch silicone case with raised camera guard and a snug, precise fit.", description: "A slim demo silicone cover with a soft microfibre lining, raised edges to protect the screen and camera, and precise cut-outs for ports and buttons. Availability and exact models are confirmed in store.", price: 349, mrp: 599, stock: "in_stock", qty: 25, colour: "Midnight Black", compat: "Most popular models", image: "/accessory-images/covers.webp", featured: 1 },
  { name: "9H Tempered Glass Screen Guard", cat: "glass", summary: "Edge-to-edge 9H tempered glass with oleophobic, fingerprint-resistant coating.", description: "Demo full-cover tempered glass with case-friendly edges, high transparency and a smooth oleophobic layer. Fitted and bubble-checked at the counter.", price: 199, mrp: 399, stock: "in_stock", qty: 40, colour: "Clear", compat: "Most popular models", image: "/accessory-images/tempered-glass.webp", featured: 1 },
  { name: "25W USB-C Fast Charger", cat: "power", summary: "Compact 25W USB-C power adapter for fast, safe top-ups.", description: "A demo 25W Type-C fast charging adapter with over-current protection. Cable sold separately. Confirm compatibility for your phone in store.", price: 899, mrp: 1299, stock: "in_stock", qty: 18, colour: "White", compat: "USB-C fast charging phones", image: "/accessory-images/chargers-cables.webp", featured: 1 },
  { name: "USB-C Braided Charging Cable", cat: "power", summary: "Durable 1m braided USB-C cable rated for fast charge and data.", description: "Demo 1-metre nylon-braided Type-C cable with reinforced connectors for everyday durability. Supports fast charging on compatible adapters.", price: 249, mrp: 499, stock: "in_stock", qty: 30, colour: "Space Grey", compat: "USB-C devices", image: "/accessory-images/chargers-cables.webp", featured: 0 },
  { name: "TWS Wireless Earbuds", cat: "audio", summary: "True wireless earbuds with deep bass, ENC calls and a charging case.", description: "Demo true-wireless earbuds with low-latency mode, environmental noise cancellation on calls and a pocket charging case. Try the fit at the counter.", price: 1299, mrp: 2499, stock: "in_stock", qty: 12, colour: "Matte Black", compat: "Bluetooth phones & tablets", image: "/accessory-images/earphones-audio.webp", featured: 1 },
  { name: "Wireless Bluetooth Neckband", cat: "audio", summary: "Around-the-neck Bluetooth earphones with magnetic buds and long playtime.", description: "Demo neckband-style Bluetooth earphones with magnetic earbuds, in-line controls and all-day battery. A comfortable everyday audio pick.", price: 799, mrp: 1499, stock: "in_stock", qty: 15, colour: "Blue", compat: "Bluetooth phones & tablets", image: "/accessory-images/earphones-audio.webp", featured: 0 },
  { name: "10,000mAh Power Bank", cat: "backup", summary: "Slim 10,000mAh power bank with dual output and fast charge support.", description: "Demo 10,000mAh power bank with USB-A and USB-C outputs, fast-charge support and multi-layer safety protection. Great backup for a full day out.", price: 1099, mrp: 1799, stock: "in_stock", qty: 10, colour: "Black", compat: "Phones, earbuds & tablets", image: "/accessory-images/power-banks.webp", featured: 1 },
  { name: "128GB microSD Memory Card", cat: "storage", summary: "High-speed 128GB microSD card for extra photo, video and app storage.", description: "Demo 128GB microSD card with fast read speeds, ideal for expanding storage on phones, cameras and other devices that support it.", price: 999, mrp: 1599, stock: "unknown", qty: 0, colour: null, compat: "microSD-capable devices", image: "/accessory-images/other-accessories.webp", featured: 0 },
];

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 190);

async function columnExists(name) {
  const row = await queryOne(
    `SELECT 1 AS present FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'accessories' AND COLUMN_NAME = ?`,
    [name]
  );
  return Boolean(row);
}

async function main() {
  // 1. Add any missing columns.
  const toAdd = [];
  for (const [name, def] of COLUMN_DEFS) {
    if (!(await columnExists(name))) toAdd.push(`ADD COLUMN \`${name}\` ${def}`);
  }
  if (toAdd.length) {
    await query(`ALTER TABLE \`accessories\` ${toAdd.join(", ")}`);
    console.log(`Added ${toAdd.length} column(s) to accessories.`);
  } else {
    console.log("accessories already has all catalog columns.");
  }

  // 2. Resolve category slugs -> ids.
  const cats = await query(`SELECT id, slug FROM accessory_categories`);
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  // 3. Seed demo products (idempotent by slug).
  let inserted = 0;
  let order = 1;
  for (const p of DEMO) {
    const slug = slugify(p.name);
    const existing = await queryOne(`SELECT id FROM accessories WHERE slug = ?`, [slug]);
    if (existing) {
      order += 1;
      continue;
    }
    const categoryId = catBySlug.get(p.cat) ?? null;
    await query(
      `INSERT INTO accessories
         (category_id, name, slug, summary, description, price_amount, price_currency,
          mrp_amount, stock_quantity, stock_status, colour, compatibility, image_path,
          is_active, is_featured, display_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`,
      [
        categoryId, p.name, slug, p.summary, p.description, p.price, "INR",
        p.mrp, p.qty, p.stock, p.colour, p.compat, p.image, p.featured, order,
      ]
    );
    inserted += 1;
    order += 1;
  }
  console.log(
    inserted
      ? `Seeded ${inserted} demo accessory product(s).`
      : "Demo accessory products already present; nothing to seed."
  );

  const total = await queryOne(`SELECT COUNT(*) AS n FROM accessories`);
  console.log(`accessories now holds ${total.n} product(s).`);
}

main()
  .catch((err) => {
    console.error("extend-accessories failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closePool());
