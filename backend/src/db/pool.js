/**
 * MySQL connection pool.
 *
 * Uses mysql2/promise so every query is a real Promise and `async`/`await` works
 * without callbacks. The pool is created once and shared.
 *
 * Identifiers (table and column names) are NEVER taken from user input. They come
 * only from the frozen resource registry in db/resources.js, and every value is
 * sent as a `?` placeholder. That closes off SQL injection entirely: there is no
 * string interpolation of SQL anywhere in this codebase.
 */

import mysql from "mysql2/promise";
import config from "../config/env.js";

let pool = null;

export function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // Return DECIMAL as a string rather than a JS float. Money must not pick up
    // binary floating-point error on the way out of the database.
    decimalNumbers: false,

    // Keep DATETIME/DATE as strings so timezone conversion cannot shift a date
    // by a day depending on the server's locale.
    dateStrings: true,

    charset: "utf8mb4_unicode_ci",
    timezone: "Z",
  });

  return pool;
}

/**
 * Runs a query with placeholder values.
 * @param {string} sql
 * @param {Array} params
 */
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

/** Returns exactly one row, or null. */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length ? rows[0] : null;
}

/**
 * Verifies the database is reachable and is the expected schema.
 * Returns a plain object; never throws, so it is safe for a health endpoint.
 */
export async function checkConnection() {
  const startedAt = Date.now();
  try {
    const row = await queryOne(
      "SELECT VERSION() AS version, DATABASE() AS db, @@character_set_database AS charset"
    );
    const tableCount = await queryOne(
      `SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.db.database]
    );
    return {
      ok: true,
      database: row?.db ?? config.db.database,
      version: row?.version ?? null,
      charset: row?.charset ?? null,
      tables: Number(tableCount?.n ?? 0),
      latencyMs: Date.now() - startedAt,
    };
  } catch (err) {
    return {
      ok: false,
      database: config.db.database,
      error: err.code || err.name,
      // A connection error message can contain the host and user but never the
      // password. Keep it short and strip anything credential-shaped.
      message: String(err.message || "").replace(/password[^,;]*/gi, "password=***"),
      latencyMs: Date.now() - startedAt,
    };
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default getPool;
