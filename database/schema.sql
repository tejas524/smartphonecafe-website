-- ============================================================================
--  SmartphoneCafe - MySQL 8 schema
-- ============================================================================
--  Creates the `smartphonecafe` database and its twelve tables
--  (ten public/CMS tables plus the private sales + expenses analytics ledgers).
--
--  Design rules applied throughout:
--
--  1. InnoDB + utf8mb4/utf8mb4_unicode_ci so Marathi/Devanagari and the rupee
--     sign store correctly.
--  2. Every table has `id`, `created_at` and `updated_at`.
--  3. Commercial values (price, discount, warranty, stock) are NULLABLE and are
--     deliberately left NULL by the seed. The shop has not published prices,
--     stock levels or offers, so the schema must be able to represent "unknown"
--     rather than forcing a fabricated value. A NULL here means "not stated",
--     which is honest; a 0 would be a false claim.
--  4. No MySQL-8-only syntax, so the file also loads on MariaDB and 5.7.
--  5. `display_order` columns let the CMS control presentation order without
--     relying on insertion order.
--  6. Images are referenced by path (VARCHAR), never stored as BLOBs.
--
--  Usage:
--     mysql --defaults-extra-file=<cnf> < database/schema.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `smartphonecafe`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `smartphonecafe`;

-- Tables are dropped child-first so foreign keys never block the drop, which
-- makes this file safely re-runnable during development.
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `homepage_content`;
DROP TABLE IF EXISTS `gallery`;
DROP TABLE IF EXISTS `accessories`;
DROP TABLE IF EXISTS `accessory_categories`;
DROP TABLE IF EXISTS `repair_services`;
DROP TABLE IF EXISTS `smartphones`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `offers`;
DROP TABLE IF EXISTS `business_info`;
DROP TABLE IF EXISTS `users`;


-- ---------------------------------------------------------------------------
-- 1. users - admin accounts for the CMS
-- ---------------------------------------------------------------------------
-- Only bcrypt hashes are stored; there is no plaintext column by design.
-- The seed creates no account: the first admin is created explicitly by the
-- operator, so no default credential can leak into the repository.
CREATE TABLE `users` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(120)  NOT NULL,
  `email`          VARCHAR(190)  NOT NULL,
  `password_hash`  VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash, cost >= 10',
  `role`           VARCHAR(32)   NOT NULL DEFAULT 'admin',
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `last_login_at`  DATETIME      NULL DEFAULT NULL,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS admin accounts. Password stored as a bcrypt hash only.';


-- ---------------------------------------------------------------------------
-- 2. offers - promotional cards
-- ---------------------------------------------------------------------------
-- IMPORTANT: the shop publishes no verifiable current offers. The seed inserts
-- only the factual, source-backed statements that already appear on the site
-- (store-advertised deals and the in-store Bajaj Finserv EMI signage), each
-- explicitly labelled as unconfirmed / in-store information. No discount
-- percentage or rupee amount is invented.
CREATE TABLE `offers` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`          VARCHAR(160)  NOT NULL,
  `subtitle`       VARCHAR(200)  NULL DEFAULT NULL,
  `description`    TEXT          NULL,
  -- Money as DECIMAL, never FLOAT: 10,2 holds paise without rounding drift.
  `discount_label` VARCHAR(80)   NULL DEFAULT NULL COMMENT 'e.g. "20% off" - NULL when not stated',
  `price_amount`   DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'NULL = not published',
  `price_currency` CHAR(3)       NOT NULL DEFAULT 'INR',
  `badge`          VARCHAR(40)   NULL DEFAULT NULL,
  `image_path`     VARCHAR(255)  NULL DEFAULT NULL,
  `cta_label`      VARCHAR(80)   NULL DEFAULT NULL,
  `cta_url`        VARCHAR(500)  NULL DEFAULT NULL,
  `starts_on`      DATE          NULL DEFAULT NULL,
  `ends_on`        DATE          NULL DEFAULT NULL,
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `is_featured`    TINYINT(1)    NOT NULL DEFAULT 0,
  `needs_confirmation` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = not independently verified, label in the UI',
  `source_note`    VARCHAR(255)  NULL DEFAULT NULL COMMENT 'where this claim came from',
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_offers_active_order` (`is_active`, `display_order`),
  KEY `idx_offers_dates` (`starts_on`, `ends_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Promotional cards. Price/discount stay NULL unless the shop states them.';


-- ---------------------------------------------------------------------------
-- 3. brands - browse-by-brand shortcuts
-- ---------------------------------------------------------------------------
-- Typographic wordmarks only. `logo_path` exists for the day authorised assets
-- are supplied, but the seed leaves it NULL and no manufacturer logo is used,
-- so nothing implies an authorised dealership.
CREATE TABLE `brands` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(80)   NOT NULL,
  `slug`           VARCHAR(80)   NOT NULL,
  `note`           VARCHAR(120)  NULL DEFAULT NULL COMMENT 'series hint, e.g. "Y & V series"',
  `category`       VARCHAR(40)   NULL DEFAULT NULL COMMENT 'premium | mainstream | value',
  `logo_path`      VARCHAR(255)  NULL DEFAULT NULL COMMENT 'NULL = render as a wordmark',
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_brands_slug` (`slug`),
  KEY `idx_brands_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Brand shortcuts (wordmarks). No logo unless authorised assets exist.';


-- ---------------------------------------------------------------------------
-- 4. smartphones - product catalogue
-- ---------------------------------------------------------------------------
-- The seed intentionally inserts NO rows. Every existing page routes the
-- customer to WhatsApp to ask what is available, because no model list, price
-- or stock level has been verified. Creating rows here would mean inventing
-- exactly the commercial data the brief forbids.
--
-- The table exists so the CMS can populate it once the owner supplies real
-- data. `price_amount` and `stock_quantity` stay NULL until then.
CREATE TABLE `smartphones` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `brand_id`       INT UNSIGNED NULL DEFAULT NULL,
  `model_name`     VARCHAR(160)  NOT NULL,
  `slug`           VARCHAR(190)  NOT NULL,
  `summary`        VARCHAR(255)  NULL DEFAULT NULL,
  `description`    TEXT          NULL,
  `price_amount`   DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'NULL = price not published',
  `price_currency` CHAR(3)       NOT NULL DEFAULT 'INR',
  `mrp_amount`     DECIMAL(10,2) NULL DEFAULT NULL,
  `stock_quantity` INT           NULL DEFAULT NULL COMMENT 'NULL = not tracked/stated',
  `stock_status`   VARCHAR(24)   NULL DEFAULT NULL COMMENT 'in_stock | out_of_stock | unknown',
  `is_5g`          TINYINT(1)    NULL DEFAULT NULL COMMENT 'NULL = not stated',
  `colour`         VARCHAR(60)   NULL DEFAULT NULL,
  `storage`        VARCHAR(60)   NULL DEFAULT NULL,
  `ram`            VARCHAR(60)   NULL DEFAULT NULL,
  `image_path`     VARCHAR(255)  NULL DEFAULT NULL,
  `warranty_note`  VARCHAR(160)  NULL DEFAULT NULL COMMENT 'NULL = no warranty claim made',
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `is_featured`    TINYINT(1)    NOT NULL DEFAULT 0,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_smartphones_slug` (`slug`),
  KEY `idx_smartphones_brand` (`brand_id`),
  KEY `idx_smartphones_active_order` (`is_active`, `display_order`),
  CONSTRAINT `fk_smartphones_brand`
    FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Phone catalogue. Empty until the owner supplies verified stock/prices.';


-- ---------------------------------------------------------------------------
-- 5. repair_services - repair issues the shop assesses
-- ---------------------------------------------------------------------------
-- Grounded in the listing's own categories ("Mobile phone repair shop",
-- "Phone repair service", "Data recovery service") and its published promise of
-- "quick repairs". No price or turnaround is stated anywhere on the site, so
-- both columns stay NULL.
CREATE TABLE `repair_services` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`            VARCHAR(80)   NOT NULL,
  `title`           VARCHAR(160)  NOT NULL,
  `description`     TEXT          NULL,
  `price_from`      DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'NULL = no price published',
  `price_currency`  CHAR(3)       NOT NULL DEFAULT 'INR',
  `turnaround_note` VARCHAR(160)  NULL DEFAULT NULL COMMENT 'NULL = no turnaround promised',
  `warranty_note`   VARCHAR(160)  NULL DEFAULT NULL COMMENT 'NULL = no warranty promised',
  `tags`            VARCHAR(255)  NULL DEFAULT NULL COMMENT 'comma-separated, mirrors the UI tags',
  `icon`            VARCHAR(40)   NULL DEFAULT NULL COMMENT 'key into the site icon set',
  `is_enquiry_only` TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '1 = assessment only, no quote implied',
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`   INT           NOT NULL DEFAULT 0,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_repair_services_slug` (`slug`),
  KEY `idx_repair_services_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Repair issues offered for assessment. No prices or warranties claimed.';


-- ---------------------------------------------------------------------------
-- 6. accessory_categories
-- ---------------------------------------------------------------------------
-- Supported by the listing's "Cell phone accessory store" category and the
-- business's own description ("reliable accessories"). Stock is never asserted.
CREATE TABLE `accessory_categories` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`           VARCHAR(80)   NOT NULL,
  `title`          VARCHAR(160)  NOT NULL,
  `description`    TEXT          NULL,
  `icon`           VARCHAR(40)   NULL DEFAULT NULL,
  `image_path`     VARCHAR(255)  NULL DEFAULT NULL,
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_accessory_categories_slug` (`slug`),
  KEY `idx_accessory_categories_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Accessory groupings. Membership is an enquiry topic, not a stock claim.';


-- ---------------------------------------------------------------------------
-- 7. accessories - individual accessory products
-- ---------------------------------------------------------------------------
-- Empty by design: no accessory product list or price exists to migrate.
CREATE TABLE `accessories` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id`    INT UNSIGNED NULL DEFAULT NULL,
  `brand_id`       INT UNSIGNED NULL DEFAULT NULL,
  `name`           VARCHAR(160)  NOT NULL,
  `slug`           VARCHAR(190)  NOT NULL,
  `summary`        VARCHAR(255)  NULL DEFAULT NULL,
  `description`    TEXT          NULL,
  `price_amount`   DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'NULL = not published',
  `price_currency` CHAR(3)       NOT NULL DEFAULT 'INR',
  `mrp_amount`     DECIMAL(10,2) NULL DEFAULT NULL,
  `stock_quantity` INT           NULL DEFAULT NULL,
  `stock_status`   VARCHAR(24)   NULL DEFAULT NULL,
  `colour`         VARCHAR(60)   NULL DEFAULT NULL,
  `compatibility`  VARCHAR(255)  NULL DEFAULT NULL,
  `image_path`     VARCHAR(255)  NULL DEFAULT NULL,
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `is_featured`    TINYINT(1)    NOT NULL DEFAULT 0,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_accessories_slug` (`slug`),
  KEY `idx_accessories_category` (`category_id`),
  KEY `idx_accessories_brand` (`brand_id`),
  CONSTRAINT `fk_accessories_category`
    FOREIGN KEY (`category_id`) REFERENCES `accessory_categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_accessories_brand`
    FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Accessory products. Empty until real stock/prices are supplied.';


-- ---------------------------------------------------------------------------
-- 8. gallery - real photographs of the store
-- ---------------------------------------------------------------------------
-- Seeded from the nine processed images in frontend/public/shop-images/. Only
-- the path is stored; the files themselves live on disk.
CREATE TABLE `gallery` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`           VARCHAR(120)  NOT NULL,
  `title`          VARCHAR(160)  NULL DEFAULT NULL,
  `caption`        VARCHAR(255)  NULL DEFAULT NULL,
  `alt_text`       VARCHAR(500)  NOT NULL COMMENT 'required - the site never ships an image without alt text',
  `image_path`     VARCHAR(255)  NOT NULL COMMENT 'web path, e.g. /shop-images/x.webp',
  `srcset`         TEXT          NULL COMMENT 'responsive candidate list, generated by the photo pipeline',
  `width`          INT           NULL DEFAULT NULL,
  `height`         INT           NULL DEFAULT NULL,
  `aspect_ratio`   VARCHAR(24)   NULL DEFAULT NULL COMMENT 'CSS aspect-ratio value, e.g. "2000 / 1125"',
  `category`       VARCHAR(60)   NULL DEFAULT NULL COMMENT 'interior | store | smartphones',
  `source_width`   INT           NULL DEFAULT NULL COMMENT 'original pixel width before resize',
  `source_height`  INT           NULL DEFAULT NULL COMMENT 'original pixel height before resize',
  `is_featured`    TINYINT(1)    NOT NULL DEFAULT 0,
  `is_hero`        TINYINT(1)    NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gallery_slug` (`slug`),
  KEY `idx_gallery_active_order` (`is_active`, `display_order`),
  KEY `idx_gallery_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Store photographs. Paths only; image files live on disk.';


-- ---------------------------------------------------------------------------
-- 9. business_info - key/value store for verified business facts
-- ---------------------------------------------------------------------------
-- Modelled as key/value because these facts are heterogeneous (a phone number,
-- a latitude, a long description) and the CMS edits them one field at a time.
-- `is_public` lets internal notes live here without being rendered.
CREATE TABLE `business_info` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `info_key`       VARCHAR(80)   NOT NULL COMMENT 'stable machine key',
  `info_value`     TEXT          NULL COMMENT 'NULL = genuinely not published',
  `info_group`     VARCHAR(40)   NOT NULL DEFAULT 'general' COMMENT 'identity | contact | address | hours | location | listing',
  `label`          VARCHAR(120)  NULL DEFAULT NULL COMMENT 'human label for the admin form',
  `value_type`     VARCHAR(20)   NOT NULL DEFAULT 'text' COMMENT 'text | email | tel | url | number | textarea',
  `source_note`    VARCHAR(255)  NULL DEFAULT NULL COMMENT 'where the value was verified from',
  `is_public`      TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_business_info_key` (`info_key`),
  KEY `idx_business_info_group` (`info_group`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Verified business facts as editable key/value pairs.';


-- ---------------------------------------------------------------------------
-- 10. homepage_content - section copy and ordering
-- ---------------------------------------------------------------------------
-- Every row is seeded from copy that already exists on the live site, so the
-- CMS starts from the real wording rather than placeholder lorem ipsum.
CREATE TABLE `homepage_content` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_key`    VARCHAR(60)   NOT NULL COMMENT 'hero | trust | offers | brands | smartphones | repairs | accessories | gallery | about | visit',
  `eyebrow`        VARCHAR(120)  NULL DEFAULT NULL,
  `heading`        VARCHAR(255)  NULL DEFAULT NULL,
  `subheading`     VARCHAR(255)  NULL DEFAULT NULL,
  `body`           TEXT          NULL,
  `cta_label`      VARCHAR(80)   NULL DEFAULT NULL,
  `cta_url`        VARCHAR(500)  NULL DEFAULT NULL,
  `image_path`     VARCHAR(255)  NULL DEFAULT NULL,
  `is_visible`     TINYINT(1)    NOT NULL DEFAULT 1,
  `display_order`  INT           NOT NULL DEFAULT 0,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homepage_content_section` (`section_key`),
  KEY `idx_homepage_content_visible_order` (`is_visible`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Homepage section copy and ordering, seeded from the live site wording.';


-- ---------------------------------------------------------------------------
-- 11. sales - Business Analytics: real transactions entered by the owner
-- ---------------------------------------------------------------------------
-- PRIVATE data, never exposed by the public API. The owner records the ACTUAL
-- money that changed hands. selling_price / cost_price are PER-UNIT amounts and
-- are NEVER derived from the public catalog price/MRP (a sale can be discounted,
-- bundled or exchanged). Revenue for a row is selling_price * quantity.
CREATE TABLE `sales` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_date`     DATE          NOT NULL,
  `type`                 ENUM('smartphone','accessory','repair','other') NOT NULL DEFAULT 'other',
  `product_service_name` VARCHAR(200)  NOT NULL,
  `quantity`             INT UNSIGNED  NOT NULL DEFAULT 1,
  `selling_price`        DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'per-unit amount actually charged',
  `cost_price`           DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'per-unit direct cost',
  `payment_method`       VARCHAR(40)   NULL DEFAULT NULL,
  `notes`                VARCHAR(2000) NULL DEFAULT NULL,
  `created_at`           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sales_date` (`transaction_date`),
  KEY `idx_sales_type` (`type`),
  KEY `idx_sales_date_type` (`transaction_date`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Private sales ledger for Business Analytics. Never served publicly.';


-- ---------------------------------------------------------------------------
-- 12. expenses - Business Analytics: real business expenses entered by the owner
-- ---------------------------------------------------------------------------
-- PRIVATE data, never exposed by the public API.
CREATE TABLE `expenses` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `expense_date` DATE          NOT NULL,
  `category`     VARCHAR(80)   NOT NULL,
  `description`  VARCHAR(255)  NULL DEFAULT NULL,
  `amount`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notes`        VARCHAR(2000) NULL DEFAULT NULL,
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_date` (`expense_date`),
  KEY `idx_expenses_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Private expense ledger for Business Analytics. Never served publicly.';


-- ---------------------------------------------------------------------------
-- Verification query - run manually to confirm the schema landed
-- ---------------------------------------------------------------------------
--   SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
--    WHERE TABLE_SCHEMA = 'smartphonecafe' ORDER BY TABLE_NAME;
