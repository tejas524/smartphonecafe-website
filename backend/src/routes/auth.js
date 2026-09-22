/**
 * Authentication routes.
 *
 *   POST   /api/auth/login     sign in, sets the httpOnly session cookie
 *   POST   /api/auth/logout    clear the cookie
 *   GET    /api/auth/me        the current session's user
 *
 * Login answers with the same generic message and the same rough timing whether
 * the email is unknown or the password is wrong, so the endpoint cannot be used
 * to enumerate which accounts exist.
 */

import express from "express";
import rateLimit from "express-rate-limit";
import config from "../config/env.js";
import { query, queryOne } from "../db/pool.js";
import { verifyPassword } from "../auth/password.js";
import { signSession, setSessionCookie, clearSessionCookie } from "../auth/tokens.js";
import { requireAuth } from "../auth/middleware.js";
import { badRequest, unauthorized, tooManyRequests } from "../lib/errors.js";
import { ok } from "../lib/respond.js";

const router = express.Router();

/**
 * A bcrypt hash of a value no user will supply. Comparing against this when the
 * email is unknown keeps the response time close to the real path.
 * Cost 12 to match the configured default.
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7ZBq0Yk8Er1F5eGm4h0h6bJm3q8sQnK";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Successful logins must not count towards the limit, or a busy operator
  // could lock themselves out.
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) => {
    next(tooManyRequests("Too many sign-in attempts. Please wait 15 minutes and try again."));
  },
});

/** Trims and lowercases for lookup. Never used to build SQL - always bound. */
function normaliseEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = normaliseEmail(body.email);
    // A password is NOT trimmed: leading/trailing spaces are legitimate
    // characters in a password.
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      throw badRequest("Both email and password are required.");
    }
    if (email.length > 190) {
      throw badRequest("That email address is too long.");
    }
    if (password.length > 200) {
      throw badRequest("That password is too long.");
    }

    const user = await queryOne(
      `SELECT id, name, email, password_hash, role, is_active
         FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    // Always perform a bcrypt comparison, even with no user row.
    const hash = user ? user.password_hash : DUMMY_HASH;
    const passwordOk = await verifyPassword(password, hash);

    if (!user || !passwordOk) {
      throw unauthorized("Incorrect email or password.");
    }
    if (!Number(user.is_active)) {
      throw unauthorized("This account has been deactivated.");
    }

    // Record the sign-in. Failures here must not block a valid login.
    query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]).catch(() => {});

    const token = signSession(user);
    setSessionCookie(res, token);

    return ok(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  return ok(res, { signedOut: true });
});

router.get("/me", requireAuth, (req, res) => {
  return ok(res, {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

/**
 * Changes the signed-in user's own password. Requires the current password, so
 * a stolen session cookie alone cannot lock the owner out of their account.
 */
router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const next_ = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!current || !next_) {
      throw badRequest("Both currentPassword and newPassword are required.");
    }

    // Imported here to keep the module graph shallow at boot.
    const { checkPasswordPolicy, hashPassword } = await import("../auth/password.js");

    const problems = checkPasswordPolicy(next_);
    if (problems.length) {
      throw badRequest(`The new password ${problems.join(", ")}.`, {
        errors: [{ field: "newPassword", message: problems.join(", ") }],
      });
    }

    const row = await queryOne(`SELECT password_hash FROM users WHERE id = ? LIMIT 1`, [
      req.user.id,
    ]);
    const okCurrent = await verifyPassword(current, row?.password_hash);
    if (!okCurrent) {
      throw unauthorized("The current password is incorrect.");
    }

    const newHash = await hashPassword(next_);
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, req.user.id]);

    // Invalidate the existing cookie; the client must sign in again.
    clearSessionCookie(res);
    return ok(res, { changed: true, signedOut: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
