/**
 * Express application assembly.
 *
 * Mount order matters:
 *   1. security headers and CORS
 *   2. body parsing (with explicit size caps)
 *   3. static file serving for /uploads
 *   4. session attachment, then public routes
 *   5. health check
 *   6. authenticated admin routes
 *   7. 404, then the error handler (always last)
 */

import path from "node:path";
import fs from "node:fs";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import config, { REPO_ROOT, BACKEND_ROOT } from "./config/env.js";
import { checkConnection } from "./db/pool.js";
import { attachUser } from "./auth/middleware.js";
import { requestId, notFoundHandler, errorHandler } from "./middleware/errors.js";
import { ensureUploadDirs } from "./lib/upload.js";
import { tooManyRequests } from "./lib/errors.js";
import authRoutes from "./routes/auth.js";
import adminCrudRoutes, { resolveResource } from "./routes/adminCrud.js";
import publicRoutes from "./routes/public.js";

export async function createApp() {
  const app = express();

  // Behind a reverse proxy (Hostinger terminates TLS), trust one hop so
  // rate-limiting sees the real client IP rather than the proxy's.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Used by the multer guard to report the configured limit.
  app.set("uploadMaxBytes", config.uploads.maxBytes);

  /* ------------------------------------------------------------ security -- */

  app.use(
    helmet({
      // The API returns JSON, so most browser-oriented policies are irrelevant.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // Uploaded images are meant to be embedded by the website.
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin/server-to-server requests have no Origin header.
        if (!origin) return cb(null, true);
        if (config.server.allowedOrigins.includes(origin)) return cb(null, true);
        // Not an exception: the callback receives false, so no CORS headers are
        // added and the browser blocks the read.
        return cb(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
      exposedHeaders: ["X-Request-ID"],
    })
  );

  // A blunt ceiling across the whole API, on top of the tighter per-route limits.
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_req, _res, next) => next(tooManyRequests("Too many requests. Please slow down.")),
    })
  );

  /* --------------------------------------------------------------- parsing -- */

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestId);

  /* --------------------------------------------------------------- uploads -- */

  await ensureUploadDirs();

  // Serve uploaded images. `index: false` stops directory listings, and dotfiles
  // are ignored so a stray .env dropped in the folder is not downloadable.
  app.use(
    "/uploads",
    express.static(config.uploads.dir, {
      index: false,
      dotfiles: "ignore",
      maxAge: "7d",
      setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    })
  );

  /* ----------------------------------------------------------- diagnostics -- */

  app.get("/api/health", async (_req, res) => {
    const db = await checkConnection();
    // A failing database is a real outage, so report 503 rather than a 200 that
    // claims everything is fine.
    res.status(db.ok ? 200 : 503).json({
      status: db.ok ? "ok" : "degraded",
      uptimeSeconds: Math.round(process.uptime()),
      environment: config.server.nodeEnv,
      database: db,
    });
  });

  /* ----------------------------------------------------------------- routes -- */

  app.use(attachUser);

  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);

  // All eight CMS sections share this router, guarded by requireAuth.
  const { requireAuth } = await import("./auth/middleware.js");
  app.use(
    "/api/admin/:resource",
    (req, res, next) => {
      requireAuth(req, res, (err) => {
        if (err) return next(err);
        resolveResource(req, res, next);
      });
    },
    adminCrudRoutes
  );

  // A short index of what exists, so the API is discoverable without docs.
  app.get("/api", (_req, res) => {
    res.json({
      name: "SmartphoneCafe API",
      version: "1.0.0",
      endpoints: {
        health: "GET /api/health",
        auth: [
          "POST /api/auth/login",
          "POST /api/auth/logout",
          "GET  /api/auth/me",
          "POST /api/auth/change-password",
        ],
        public: [
          "GET /api/public/home",
          "GET /api/public/business",
          "GET /api/public/brands",
          "GET /api/public/offers",
          "GET /api/public/repairs",
          "GET /api/public/accessories",
          "GET /api/public/gallery",
          "GET /api/public/smartphones",
          "GET /api/public/bootstrap",
        ],
        admin: "GET|POST /api/admin/:resource, GET|PATCH|PUT|DELETE /api/admin/:resource/:id",
        sections: [
          "offers", "smartphones", "brands", "repair-services",
          "accessories", "gallery", "business-info", "homepage-content",
          "accessory-categories",
        ],
      },
    });
  });

  /* ---------------------------------------------------------------- static -- */

  // In production the built SPA is served from the same origin as the API.
  const distDir = path.join(REPO_ROOT, "frontend", "dist");
  const spaIndex = path.join(distDir, "index.html");
  if (fs.existsSync(spaIndex)) {
    app.use(express.static(distDir, { index: false, maxAge: "1h" }));
    // Any non-API GET falls through to the SPA so client-side routes work on a
    // full page load or refresh.
    app.get(/^(?!\/api\/)(?!\/uploads\/).*/, (_req, res) => {
      res.sendFile(spaIndex);
    });
  }

  /* ---------------------------------------------------------------- errors -- */

  app.use(notFoundHandler);
  app.use(errorHandler);

  // Surfaced for the startup log.
  app.locals.backendRoot = BACKEND_ROOT;

  return app;
}

export default createApp;
