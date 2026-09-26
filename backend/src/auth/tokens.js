/**
 * Session tokens.
 *
 * A JWT is signed with JWT_SECRET and delivered in an httpOnly cookie, so
 * client-side JavaScript cannot read it and an XSS bug cannot exfiltrate it.
 *
 * Cookie flags:
 *   httpOnly : not readable from JS
 *   sameSite : 'lax'. In the intended deployment the SPA and the API are served
 *              from the SAME origin (Express serves the built SPA), and in dev
 *              they are same-site (localhost, different port), so 'lax' is
 *              correct in both and is stricter than 'none'. 'lax' still sends
 *              the cookie on the admin's own top-level navigations and on the
 *              same-origin fetch()/XHR the admin SPA makes.
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
    // The SPA and API share an origin (prod) / are same-site (dev), so Lax is
    // both sufficient and a meaningful CSRF mitigation. It replaces the former
    // cross-site 'none', which is no longer needed for a same-origin deploy.
    sameSite: "lax",
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
