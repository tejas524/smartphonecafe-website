/**
 * Session tokens.
 *
 * A JWT is signed with JWT_SECRET and delivered in an httpOnly cookie, so
 * client-side JavaScript cannot read it and an XSS bug cannot exfiltrate it.
 *
 * Cookie flags:
 *   httpOnly : not readable from JS
 *   sameSite : 'lax' in development (same host, different port), 'none'+Secure
 *              in production when the API is on a different origin than the SPA
 *   secure   : true whenever NODE_ENV=production, so the cookie is never sent
 *              over plain HTTP
 *   path     : '/' so both the API and the SPA can send it
 */

import jwt from "jsonwebtoken";
import config from "../config/env.js";

const ISSUER = "smartphonecafe";
const AUDIENCE = "smartphonecafe-admin";

export function signSession(user) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: `${config.auth.sessionHours}h`,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

/** Returns the decoded payload, or null when the token is absent/invalid/expired. */
export function verifySession(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, config.auth.jwtSecret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch {
    return null;
  }
}

export function cookieOptions() {
  const secure = config.server.isProduction;
  return {
    httpOnly: true,
    secure,
    // Cross-site cookies require SameSite=None together with Secure. In dev the
    // SPA runs on a different port but the same host, so Lax is both sufficient
    // and stricter.
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: config.auth.sessionHours * 60 * 60 * 1000,
  };
}

export function setSessionCookie(res, token) {
  res.cookie(config.auth.cookieName, token, cookieOptions());
}

export function clearSessionCookie(res) {
  const opts = cookieOptions();
  delete opts.maxAge;
  res.clearCookie(config.auth.cookieName, opts);
}

export default { signSession, verifySession, setSessionCookie, clearSessionCookie };
