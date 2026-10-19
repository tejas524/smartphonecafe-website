/**
 * SEO endpoints: /robots.txt and /sitemap.xml.
 *
 * Both are generated from `config.server.publicSiteUrl` so the production
 * HTTPS origin is configured through the environment (PUBLIC_SITE_URL) rather
 * than hard-coded. Only public, indexable routes are listed. The admin SPA
 * area and the API are explicitly disallowed and never appear in the sitemap.
 *
 * These are mounted BEFORE the SPA static/catch-all handler so they are served
 * as text/xml instead of falling through to index.html.
 */

import express from "express";
import config from "../config/env.js";

const router = express.Router();

/**
 * Public, indexable client routes. Deliberately excludes:
 *   - /admin and everything under it (private CMS)
 *   - /api/* (JSON API)
 *   - dynamic /smartphones/:id detail pages (content varies; can be added
 *     later from the DB if deep-page indexing is wanted)
 */
const PUBLIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/smartphones", changefreq: "weekly", priority: "0.9" },
  { path: "/accessories", changefreq: "weekly", priority: "0.8" },
  { path: "/gallery", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
];

function base() {
  return config.server.publicSiteUrl.replace(/\/+$/, "");
}

router.get("/robots.txt", (_req, res) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    `Sitemap: ${base()}/sitemap.xml`,
    "",
  ].join("\n");
  res.type("text/plain; charset=utf-8");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(body);
});

router.get("/sitemap.xml", (_req, res) => {
  const b = base();
  const urls = PUBLIC_ROUTES.map(
    (r) =>
      `  <url>\n` +
      `    <loc>${b}${r.path}</loc>\n` +
      `    <changefreq>${r.changefreq}</changefreq>\n` +
      `    <priority>${r.priority}</priority>\n` +
      `  </url>`
  ).join("\n");
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;
  res.type("application/xml; charset=utf-8");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

export default router;
