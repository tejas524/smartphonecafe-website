/**
 * Server entry point.
 *
 * Validates configuration, verifies the database, then listens. A missing or
 * broken database is reported clearly at boot instead of surfacing later as a
 * confusing 500 on the first request.
 */

import config from "./config/env.js";
import { createApp } from "./app.js";
import { checkConnection, closePool } from "./db/pool.js";
import { ensureUploadDirs } from "./lib/upload.js";

async function main() {
  console.log(`[boot] SmartphoneCafe API - ${config.server.nodeEnv}`);

  if (!config.envFileExists) {
    console.warn(
      `[boot] WARNING: ${config.envPath} was not found. Values came from the ` +
        `process environment only.`
    );
  }

  // Directories first: the API cannot accept an upload if they are missing.
  await ensureUploadDirs();
  console.log(`[boot] uploads directory: ${config.uploads.dir}`);

  const db = await checkConnection();
  if (!db.ok) {
    // Deliberately fatal. Starting up without a database would leave every
    // request failing and could hide a misconfiguration behind a retry loop.
    console.error(
      `[boot] FATAL: cannot reach MySQL at ${config.db.host}:${config.db.port} ` +
        `as "${config.db.user}" (database "${config.db.database}").`
    );
    console.error(`[boot] reason: ${db.error} ${db.message || ""}`);
    console.error(
      `[boot] Check backend/.env and confirm database/schema.sql has been applied. ` +
        `The password is never printed.`
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[boot] MySQL ${db.version} via ${config.db.host}:${config.db.port} ` +
      `-> ${db.database} (${db.charset}, ${db.tables} tables, ${db.latencyMs}ms)`
  );

  if (db.tables < 10) {
    console.warn(
      `[boot] WARNING: expected 10 tables in "${config.db.database}" but found ` +
        `${db.tables}. Apply database/schema.sql.`
    );
  }

  const app = await createApp();

  const server = app.listen(config.server.port, "0.0.0.0", () => {
    console.log(`[boot] listening on 0.0.0.0:${config.server.port} (PORT from environment, or development fallback)`);
    console.log(`[boot] health path: /api/health`);
    console.log(`[boot] cors origins: ${config.server.allowedOrigins.join(", ")}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[boot] FATAL: port ${config.server.port} is already in use. ` +
          `Set PORT in backend/.env to a free port.`
      );
    } else {
      console.error("[boot] FATAL: server error:", err);
    }
    process.exitCode = 1;
  });

  /* ------------------------------------------------------------- shutdown -- */

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[shutdown] ${signal} received, closing…`);

    // Stop accepting new connections, then drain.
    server.close(async () => {
      try {
        await closePool();
        console.log("[shutdown] database pool closed");
      } catch (err) {
        console.error("[shutdown] error closing pool:", err.message);
      }
      process.exit(0);
    });

    // Do not hang forever if a connection refuses to end.
    setTimeout(() => {
      console.error("[shutdown] forced exit after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("[fatal] unhandled promise rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[fatal] uncaught exception:", err);
    shutdown("uncaughtException");
  });
}

main().catch((err) => {
  console.error("[boot] FATAL:", err.message);
  process.exit(1);
});
