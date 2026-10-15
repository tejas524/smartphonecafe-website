# SmartphoneCafe

For the current Vercel website preview and later Hostinger deployment, see
[deployment instructions](docs/deployment.md). The older status notes below
describe the initial project phase; the repository now includes the CMS/API.

Website and CMS for **SmartphoneCafe**, a smartphone sales and repair shop on
Station Road, Talegaon Dabhade, Maharashtra.

The site is a real business site built from the shop's own photographs and its
publicly listed business details. It does not display ratings, review text,
prices, stock levels or offers unless those are genuinely available.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6, React Router 6, Tailwind CSS v4 |
| Backend | Node.js + Express (REST API, bcrypt auth) |
| Database | MySQL 8 |
| Uploads | Files on disk; MySQL stores only the paths |

No Supabase, Firebase, Vercel/Netlify functions or other serverless dependency.
MySQL is the single persistent source of truth.

## Repository layout

```
.
|-- frontend/          React + Vite public site
|   |-- src/           application source (components, pages, data, utils)
|   |-- public/        static files served as-is (shop images, icons, manifest)
|   |-- scripts/       asset pipelines (photo processing, brand assets)
|   |-- index.html     Vite entry document
|   |-- vite.config.js
|   `-- package.json
|-- backend/           Express API and admin auth          (not built yet)
|-- database/          MySQL schema and seed SQL            (not built yet)
|-- uploads/           runtime CMS uploads (git-ignored, kept via .gitkeep)
|-- shop photo/        the owner's original photographs (source material)
|-- docs/              verified findings, inspection report, phase reports
|-- package.json       convenience scripts delegating into frontend/
`-- _tools/            local scratch tooling (git-ignored)
```

`shop photo/` deliberately sits at the repository root rather than inside
`frontend/`: those nine files are the owner's unretouched originals and are
source material, not part of the deployed site. The processed derivatives that
the site actually serves live in `frontend/public/shop-images/`.

## Requirements

- Node.js 20 or newer
- MySQL 8 (only needed once the backend and database phases land)

## Getting started

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Or use the root convenience scripts, which delegate into `frontend/`:

```bash
npm run dev      # start the Vite dev server
npm run build    # production build into frontend/dist
npm run preview  # serve the production build locally
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Serve the built output locally |
| `npm run photos` | Regenerate responsive shop images from `shop photo/` |
| `npm run assets` | Regenerate favicons and the social share card |
| `npm run ocr` | Dev-only: OCR the shop photos to check signage text |

`npm run photos` reads the originals from `shop photo/`, writes optimised WebP
and JPEG files into `frontend/public/shop-images/`, and regenerates
`frontend/src/data/photos.js` so image dimensions can never drift out of sync
with the files on disk. It strips EXIF and GPS metadata from everything it
publishes.

## Configuration

Configuration is environment-based and host-agnostic. The backend will read its
settings from `backend/.env`, which is never committed; `backend/.env.example`
will list the variable names with placeholder values.

## Status

- Public website: built and working
- Admin CMS, REST API, MySQL schema and authentication: **not yet implemented**

The `backend/` and `database/` directories currently contain only a README
describing what will go in them. Nothing in the running site reads from a
database yet, and no placeholder or mock data is presented as real.
