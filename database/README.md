# database/

MySQL 8 schema and seed data for the SmartphoneCafe CMS.

| File | What it is |
|---|---|
| `schema.sql` | Creates the `smartphonecafe` database and its ten tables. Safely re-runnable. |
| `seed.sql` | **Generated.** Migrates the verified data from `frontend/src/data/*.js`. |
| `generate-seed.mjs` | Produces `seed.sql` by importing the real data modules. |

## Tables

| # | Table | Seeded rows | Notes |
|---|---|---|---|
| 1 | `users` | 0 | CMS admins. bcrypt hash only; no plaintext column exists. |
| 2 | `offers` | 3 | Only source-backed statements. No invented discount or price. |
| 3 | `brands` | 10 | Wordmarks; `logo_path` NULL so no dealership is implied. |
| 4 | `smartphones` | **0** | Empty until verified models/prices exist. |
| 5 | `repair_services` | 8 | Issues assessed. No price or turnaround claimed. |
| 6 | `accessory_categories` | 6 | Groupings, not stock claims. |
| 7 | `accessories` | **0** | Empty until a verified product list exists. |
| 8 | `gallery` | 9 | The real store photographs. Paths only, no BLOBs. |
| 9 | `business_info` | 30 | Verified facts as editable key/value pairs. |
| 10 | `homepage_content` | 9 | Section copy migrated from the live pages. |

## Why some tables are deliberately empty

`smartphones` and `accessories` have **no rows on purpose**. The shop has not
published a model list, a price, a stock level or a warranty, and the brief
forbids inventing them. Rather than seed plausible-looking fake products, the
tables are created empty and every existing page routes the customer to WhatsApp
to ask what is genuinely available today.

For the same reason, on `offers` the `discount_label` and `price_amount` columns
are **NULL on every row** — the shop's published material contains no discount
percentage or rupee amount.

**NULL here means "not stated". A `0` would be a false claim.**

## Commercial columns

`price_amount`, `mrp_amount`, `price_from`, `discount_label`, `stock_quantity`,
`warranty_note` and `turnaround_note` are all nullable and are left NULL by the
seed. The schema is deliberately able to represent "unknown" rather than forcing
a value.

Money uses `DECIMAL(10,2)`, never `FLOAT`, so paise do not drift.

## Bajaj Finserv EMI signage

Signage for Bajaj Finserv easy-EMI and cashback was photographed **inside the
shop**. It is recorded as verified *in-store* information with
`needs_confirmation = 1` and a `source_note` explaining its origin. It is **not**
presented as a running online promotion.

## The first admin user

No account is seeded. Creating one would put a working credential into the
repository. Create the first admin explicitly, with a bcrypt hash:

```sql
INSERT INTO users (name, email, password_hash) VALUES
  ('Owner', 'owner@example.com', '$2b$10$REPLACE_WITH_A_REAL_BCRYPT_HASH');
```

Use `await bcrypt.hash(password, 12)` to produce the hash. Never store plaintext.

## Applying

Keep the password out of the shell history and out of process listings by using
a credentials file (this one lives in the git-ignored `_tools/`):

```ini
# _tools/.my.cnf
[client]
host=127.0.0.1
port=3306
user=root
password=...
default-character-set=utf8mb4
```

Then:

```bash
mysql --defaults-extra-file=_tools/.my.cnf < database/schema.sql
node database/generate-seed.mjs          # only after changing frontend/src/data
mysql --defaults-extra-file=_tools/.my.cnf < database/seed.sql
```

Both files are re-runnable: `schema.sql` drops tables child-first, and `seed.sql`
truncates before inserting.

## Verification

```sql
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
 WHERE TABLE_SCHEMA = 'smartphonecafe' ORDER BY TABLE_NAME;

-- Should return 0: no fabricated commercial figure anywhere.
SELECT COUNT(*) AS invented_figures FROM offers WHERE price_amount IS NOT NULL;

-- Every image must have alt text.
SELECT COUNT(*) AS missing_alt FROM gallery WHERE alt_text IS NULL OR alt_text = '';
```
