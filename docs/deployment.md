# Vercel website preview, then Hostinger

## What this preview includes

Vercel builds the React website with a static snapshot of the **public** API.
Catalogs, reviews, gallery, offers and referenced uploaded images work without
running MySQL or Express on Vercel. Admin pages explain that editing is local.
The snapshot is public content, not a database backup. No backend environment
variables or database credentials are needed in Vercel.

The preview sends `X-Robots-Tag: noindex, nofollow` to discourage search indexing.
It is still accessible to anyone with its URL.

## Deploy to Vercel

1. Commit and push the website changes, including `vercel.json`,
   `frontend/public/preview-content.json`, `frontend/public/uploads/`, and the
   frontend assets/source. Review all pending changes before committing; this
   working directory already contained substantial uncommitted website work.
2. Go to https://vercel.com/new and import `tejas524/smartphonecafe-website`.
3. Keep **Root Directory** at the repository root (`./`), not `frontend`.
4. The committed root `vercel.json` supplies these settings:

   | Setting | Value |
   | --- | --- |
   | Framework | Vite |
   | Install command | `npm --prefix frontend ci` |
   | Build command | `npm --prefix frontend run build:preview` |
   | Output directory | `frontend/dist` |

5. Deploy and open the assigned `.vercel.app` URL. Check `/`, `/smartphones`,
   `/accessories`, `/gallery`, `/contact`, and refresh a nested page directly.
   `/admin` should explain that this is a website preview.

SPA rewrites follow [Vercel's Vite deployment documentation](https://vercel.com/docs/frameworks/frontend/vite).

## Refresh preview content

With local MySQL running, start the backend:

```sh
npm --prefix backend start
```

In a second terminal:

```sh
npm --prefix frontend run preview:export
npm --prefix frontend run build:preview
npm --prefix frontend run preview
```

Commit and push the refreshed snapshot and any new exported images to redeploy.
Local CMS edits do not automatically change the Vercel snapshot. The export
uses only `/api/public/bootstrap` and copies only uploaded images referenced
there. If public content is removed, also remove its old exported image from
`frontend/public/uploads/` before committing: old exported files are not
automatically deleted. Source assets remain part of the static website too.

## Move the full site to Hostinger later

Use a plan that supports Node.js apps, MySQL and persistent writable uploads.
Verify upload persistence across redeployments on the chosen plan; a VPS allows
you to manage the application's persistent directory explicitly. See
[Hostinger's Node.js deployment guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

1. Install frontend and backend dependencies (`npm --prefix frontend ci` and
   `npm --prefix backend ci`).
2. Migrate the **current MySQL database** using a proper private database backup,
   rather than importing seed data over current content. Transfer the original
   runtime `uploads/` directory separately. The Vercel snapshot is not a backup.
3. Configure the backend using `backend/.env.example` as a reference. Set
   `NODE_ENV=production`, the real database credentials, a strong `JWT_SECRET`,
   HTTPS `FRONTEND_URL` and `PUBLIC_SITE_URL`, and a persistent `UPLOAD_DIR`.
4. Run `npm run build` (the normal build, **without** preview mode). Start
   `npm --prefix backend start` under the host's process manager. Route the HTTPS
   domain to Express, which already serves the built frontend, `/api`, and
   `/uploads` together. Ensure the deployment includes `frontend/dist` alongside
   the backend in the expected repository layout.
5. Remove the obsolete static snapshot and its exported images from the new
   production frontend. Configure database/upload backups, then verify admin
   login, content changes, uploads, and the public pages before switching DNS.

The root `vercel.json` applies only to Vercel. Normal local development and the
normal production build continue to call the live same-origin API.
