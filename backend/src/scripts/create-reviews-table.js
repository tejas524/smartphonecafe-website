/**
 * Creates and seeds the `reviews` table, and registers the two editable
 * review-summary values (`review_count`, `review_rating`) in `business_info`.
 *
 * WHY THIS SCRIPT EXISTS
 * The homepage reviews used to come from a hard-coded static file
 * (frontend/src/data/reviews.js). They are now fully CMS-managed: this script
 * moves the EXISTING, verified reviews into MySQL without altering their text,
 * name or star rating, so nothing is fabricated and nothing is lost.
 *
 * The publicly displayed review COUNT and aggregate RATING are intentionally
 * NOT computed from these rows — the owner may show the real Google totals
 * while curating only selected reviews on the site. They live as ordinary
 * editable business_info values instead of a new table.
 *
 * It is safe to run repeatedly:
 *   - the table is only created when missing;
 *   - reviews are only seeded when the table is empty;
 *   - the business_info values are only inserted when their key is absent.
 *
 * Usage:  node src/scripts/create-reviews-table.js   (or via `npm run db:migrate`)
 */

import { query, queryOne, closePool } from "./../db/pool.js";

async function tableExists(name) {
  const row = await queryOne(
    `SELECT 1 AS present FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [name]
  );
  return Boolean(row);
}

const REVIEWS_DDL = `
  CREATE TABLE \`reviews\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`reviewer_name\` VARCHAR(120) NOT NULL,
    \`review_text\` TEXT NOT NULL,
    \`rating\` TINYINT UNSIGNED NOT NULL DEFAULT 5,
    \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
    \`display_order\` INT NOT NULL DEFAULT 0,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_reviews_active_order\` (\`is_active\`, \`display_order\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * The existing, verified reviews — transcribed exactly as they were in the
 * static file. No review, name or star value is invented or changed.
 */
const SEED_REVIEWS = [
  {
    name: "Sampat Shinde",
    rating: 5,
    text: "This shop really impressed me with their selection and financing options. They had a wide range of brands like Oppo, Vivo, Samsung, iPhone, Realme, Motorola, and Nokia, which made it easy to find exactly what I was looking for. Plus, they …",
  },
  {
    name: "Shivaji Ghardale",
    rating: 5,
    text: "I recently visited this mobile shop, and I have to say, I was really impressed! The owner was super friendly and took the time to help me find exactly what I needed, all at very reasonable prices. It’s definitely my go-to place for anything mobile!",
  },
  {
    name: "Sujata Jadhav",
    rating: 5,
    text: "Very fast service, change my mobile display touch glass in one hour, rate are very reasonable, recommended for mobile repair.",
  },
  {
    name: "Jijaram Kaldoke",
    rating: 5,
    text: "Very nice service and cooperative staff, good product rang also repair service available here, must visit for any mobile phone related problem.",
  },
  {
    name: "Alom Hoque",
    rating: 5,
    text: "Very good service, Repair my OnePlus mobile here, rate are very reasonable, mobile wrap also available here, recommended for your all mobile needs, keep it up 😊 …",
  },
  {
    name: "Pappu",
    rating: 5,
    text: "Good Shop, fast service and owner is also very cooperative.",
  },
];

/**
 * The verified summary figures shown on the store's public Google listing.
 * They are the same values the static file displayed; they now live here so the
 * owner can edit them from Admin → Business info.
 */
const SUMMARY_FACTS = [
  {
    info_key: "review_count",
    info_value: "324",
    info_group: "listing",
    label: "Review count (shown on site)",
    value_type: "number",
    is_public: 1,
    display_order: 90,
    source_note: "Displayed Google review total; edited by the owner, not computed.",
  },
  {
    info_key: "review_rating",
    info_value: "4.9",
    info_group: "listing",
    label: "Review rating (shown on site)",
    value_type: "number",
    is_public: 1,
    display_order: 91,
    source_note: "Displayed Google aggregate rating; edited by the owner.",
  },
];

async function main() {
  // 1) Table
  if (await tableExists("reviews")) {
    console.log("reviews table already exists; leaving it untouched.");
  } else {
    await query(REVIEWS_DDL);
    console.log("Created table: reviews (with active/order index).");
  }

  // 2) Seed reviews only when empty (never duplicates on re-run)
  const countRow = await queryOne(`SELECT COUNT(*) AS n FROM reviews`);
  if (Number(countRow?.n ?? 0) === 0) {
    let order = 0;
    for (const r of SEED_REVIEWS) {
      await query(
        `INSERT INTO reviews (reviewer_name, review_text, rating, is_active, display_order)
         VALUES (?, ?, ?, 1, ?)`,
        [r.name, r.text, r.rating, order]
      );
      order += 10;
    }
    console.log(`Seeded ${SEED_REVIEWS.length} existing review(s) into reviews.`);
  } else {
    console.log(`reviews already holds ${countRow.n} row(s); not seeding.`);
  }

  // 3) Editable summary values in business_info (insert only if the key is new)
  for (const f of SUMMARY_FACTS) {
    const exists = await queryOne(`SELECT id FROM business_info WHERE info_key = ? LIMIT 1`, [
      f.info_key,
    ]);
    if (exists) {
      console.log(`business_info "${f.info_key}" already present; leaving it untouched.`);
      continue;
    }
    await query(
      `INSERT INTO business_info
         (info_key, info_value, info_group, label, value_type, source_note, is_public, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.info_key, f.info_value, f.info_group, f.label, f.value_type, f.source_note, f.is_public, f.display_order]
    );
    console.log(`Added business_info "${f.info_key}" = ${f.info_value}.`);
  }

  const n = await queryOne(`SELECT COUNT(*) AS n FROM reviews`);
  console.log(`reviews now holds ${n.n} row(s).`);
}

main()
  .catch((err) => {
    console.error("create-reviews-table failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closePool());
