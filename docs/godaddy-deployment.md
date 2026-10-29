# GoDaddy full website trial

Repository: https://github.com/tejas524/smartphonecafe-website, branch `main`.
Use GoDaddy **Node.js Hosting**, with the repository root as the application root.
The Express server serves the built React website, API, admin and uploads together.

## Application settings

- Runtime: Node.js 22.
- Install: `npm install` (the root postinstall installs both locked dependency sets).
- Build: `npm run build`.
- Start: `npm start`.
- Entry file, if requested instead of a start command: `backend/src/server.js`.
- Health URL: `/api/health`.

Use the normal build, not `build:preview`, which disables live CMS access.
Keep `frontend/dist` in the deployment. The root `vercel.json` is only for Vercel.

## Private configuration

Set these in GoDaddy's application environment settings. Do not commit a real
`.env`, database backup, password or admin credential to GitHub.

```dotenv
NODE_ENV=production
DB_HOST=<GoDaddy MySQL host>
DB_PORT=3306
DB_NAME=<assigned database name>
DB_USER=<assigned database user>
DB_PASSWORD=<database password>
JWT_SECRET=<random secret of at least 32 characters>
FRONTEND_URL=https://your-trial-hostname.example
PUBLIC_SITE_URL=https://your-trial-hostname.example
UPLOAD_DIR=<absolute persistent writable upload directory supplied by the host>
```

Use the actual HTTPS trial hostname for both origins. Set `VITE_SITE_URL` to that
same origin **before building** so canonical URLs and social metadata match.
Let the host supply `PORT`; the server reads it automatically.
Generate JWT_SECRET privately, for example with
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
All DB and JWT values are backend-only; never give them a `VITE_` prefix.

The backend can also read `backend/.env` when placed privately on the server.
If a host only uploads an environment file, confirm it injects the values into
the app process, or place the file at `backend/.env` outside Git.

## Database and images

For existing content, privately export the current MySQL database and import it
into the hosted database. Transfer the original local `uploads/` contents to the
persistent directory separately. The Vercel public snapshot is not a DB backup.

For a **new empty trial database only**, import `database/schema.sql`, then
`database/seed.sql`. These scripts DROP/TRUNCATE tables: never apply them over an
existing database. If GoDaddy assigns a different database name or disallows
CREATE DATABASE, remove CREATE DATABASE and adjust USE in private copies before
importing into the assigned empty database.

On an existing older database, run `npm --prefix backend run db:migrate` once
through the host's terminal/job facility, or from a trusted machine with access
to that database. Do not run schema/seed automatically on application startup.

Create the first admin with:

```sh
npm --prefix backend run create-admin -- --email owner@example.com --name "Owner"
```

The script prompts for a password. If interactive execution is unavailable,
use the script from a trusted machine with the hosted database credentials.
Do not put the password in Git or command-line arguments.

Confirm GoDaddy preserves the chosen upload directory across redeployments;
otherwise external image storage is required before using admin uploads.

## Trial checks

Verify `/api/health`, public catalogs, login at `/admin/login`, analytics,
editing a test item and uploading an image. Restart/redeploy, then check that the
edit and image remain. Refresh nested routes directly and check HTTPS login.
Do not switch the real domain until these checks pass.
