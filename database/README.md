# database/

MySQL 8 schema and seed data for the SmartphoneCafe CMS.

Planned contents (added in a later phase):

| File | Purpose |
|---|---|
| `schema.sql` | Table definitions for admin users, offers, smartphones, brands, repair services, accessory categories, accessories, gallery, business information and homepage content. |
| `seed.sql` | Seed data migrated from `frontend/src/data/*.js`. |

Conventions intended: InnoDB, `utf8mb4`, an `id` primary key plus
`created_at`/`updated_at` on every table, and portable SQL that does not rely on
MySQL-8-only syntax.

**This directory is intentionally empty of SQL right now.** Restructuring the
project into `frontend/` + `backend/` + `database/` does not create the schema;
that is a separate step.
