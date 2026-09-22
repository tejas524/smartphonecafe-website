# backend/

Node.js + Express REST API and admin authentication for the SmartphoneCafe CMS.

Planned contents (added in a later phase):

- `src/` — Express app, routes, controllers, MySQL access via `mysql2/promise`
- `uploads/` handling — file storage on disk with only the resulting path stored in MySQL
- `.env.example` — placeholder configuration, committed
- `.env` — real configuration, **never committed**

Planned environment variables (names only, placeholders in `.env.example`):
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`,
`UPLOAD_DIR`, `FRONTEND_URL`, `PORT`.

Passwords will be stored as bcrypt hashes. No database credential is ever sent
to the frontend.

**This directory is intentionally empty of application code right now.**
Restructuring the project does not build the API, the database schema or the
admin panel; those are separate steps.
