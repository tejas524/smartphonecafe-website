/**
 * Creates the Business Analytics tables: `sales` and `expenses`.
 *
 * WHY THIS SCRIPT EXISTS
 * The store owner records the ACTUAL money that changed hands — the real selling
 * price and the real cost of each sale, and each business expense. These figures
 * are never derived from the catalog price/MRP: the catalog is a public price
 * list, whereas a sale can be discounted, bundled or exchanged. So analytics gets
 * its own two tables, entered by hand from Admin → Business Analytics.
 *
 * DESIGN
 *   - selling_price / cost_price are PER-UNIT amounts. Revenue for a row is
 *     selling_price * quantity; cost is cost_price * quantity. For a repair the
 *     "quantity" is normally 1, selling_price is what the customer paid and
 *     cost_price is the parts/other direct cost.
 *   - DECIMAL(10,2) keeps money exact (no binary-float drift).
 *   - Date indexes make the month/year analytics queries fast.
 *
 * It is safe to run repeatedly: tables are only created when missing.
 *
 * Usage:  npm run analytics-tables
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

const SALES_DDL = `
  CREATE TABLE \`sales\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`transaction_date\` DATE NOT NULL,
    \`type\` ENUM('smartphone','accessory','repair','other') NOT NULL DEFAULT 'other',
    \`product_service_name\` VARCHAR(200) NOT NULL,
    \`quantity\` INT UNSIGNED NOT NULL DEFAULT 1,
    \`selling_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    \`cost_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    \`payment_method\` VARCHAR(40) NULL,
    \`notes\` VARCHAR(2000) NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_sales_date\` (\`transaction_date\`),
    KEY \`idx_sales_type\` (\`type\`),
    KEY \`idx_sales_date_type\` (\`transaction_date\`, \`type\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const EXPENSES_DDL = `
  CREATE TABLE \`expenses\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`expense_date\` DATE NOT NULL,
    \`category\` VARCHAR(80) NOT NULL,
    \`description\` VARCHAR(255) NULL,
    \`amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    \`notes\` VARCHAR(2000) NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_expenses_date\` (\`expense_date\`),
    KEY \`idx_expenses_category\` (\`category\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

async function main() {
  if (await tableExists("sales")) {
    console.log("sales table already exists; leaving it untouched.");
  } else {
    await query(SALES_DDL);
    console.log("Created table: sales (with date/type indexes).");
  }

  if (await tableExists("expenses")) {
    console.log("expenses table already exists; leaving it untouched.");
  } else {
    await query(EXPENSES_DDL);
    console.log("Created table: expenses (with date/category indexes).");
  }

  const s = await queryOne(`SELECT COUNT(*) AS n FROM sales`);
  const e = await queryOne(`SELECT COUNT(*) AS n FROM expenses`);
  console.log(`sales holds ${s.n} row(s); expenses holds ${e.n} row(s).`);
}

main()
  .catch((err) => {
    console.error("analytics-tables failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closePool());
