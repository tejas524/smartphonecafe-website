/**
 * Authentication middleware.
 *
 * The token is read from the httpOnly cookie first. A Bearer header is also
 * accepted so the API can be exercised from curl or a test script; both paths
 * end in the same verification.
 *
 * `requireAuth` re-reads the user from the database on every request rather than
 * trusting the JWT payload alone. That way deactivating or deleting an account
 * takes effect immediately instead of waiting for the token to expire.
 */

import config from "../config/env.js";
import { queryOne } from "../db/pool.js";
import { verifySession } from "./tokens.js";
import { unauthorized, forbidden } from "../lib/errors.js";

function extractToken(req) {
  if (req.cookies && req.cookies[config.auth.cookieName]) {
    return req.cookies[config.auth.cookieName];
  }
  const header = req.get("authorization");
  if (header && /^Bearer\s+/i.test(header)) {
    return header.replace(/^Bearer\s+/i, "").trim();
  }
  return null;
}

/** Attaches req.user when a valid session exists; never rejects. */
export async function attachUser(req, _res, next) {
  try {
    const token = extractToken(req);
    const payload = verifySession(token);
    if (!payload) {
      req.user = null;
      return next();
    }

    const user = await queryOne(
      `SELECT id, name, email, role, is_active
         FROM users WHERE id = ? LIMIT 1`,
      [payload.sub]
    );

    if (!user) {
      req.user = null;
      return next();
    }
    if (!Number(user.is_active)) {
      req.user = null;
      req.authError = "This account has been deactivated.";
      return next();
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Rejects the request unless a verified, active user is attached. */
export function requireAuth(req, _res, next) {
  if (!req.user) {
    return next(unauthorized(req.authError || "Authentication required."));
  }
  return next();
}

/** Rejects the request unless the user holds one of the given roles. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden("Your account does not have permission for this action."));
    }
    return next();
  };
}

export default { attachUser, requireAuth, requireRole };
