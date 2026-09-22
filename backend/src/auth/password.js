/**
 * Password hashing with bcrypt.
 *
 * Only the hash is ever stored. The plaintext exists solely as a local variable
 * inside the request that supplied it, and is never logged, echoed, or written
 * to the database.
 *
 * bcrypt truncates input at 72 BYTES. Rather than silently ignoring everything
 * past that boundary (which would let two different long passwords authenticate
 * the same account), over-long input is rejected explicitly.
 */

import bcrypt from "bcrypt";
import config from "../config/env.js";

export const BCRYPT_MAX_BYTES = 72;
export const PASSWORD_MIN_LENGTH = 10;

/** Byte length, not character length - a multi-byte password hits the limit sooner. */
export function byteLength(s) {
  return Buffer.byteLength(String(s), "utf8");
}

/**
 * Enforces the minimum password policy. Returns an array of human-readable
 * problems; empty means acceptable.
 */
export function checkPasswordPolicy(password) {
  const problems = [];
  const value = String(password ?? "");

  if (value.length < PASSWORD_MIN_LENGTH) {
    problems.push(`must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (byteLength(value) > BCRYPT_MAX_BYTES) {
    problems.push(
      `must be at most ${BCRYPT_MAX_BYTES} bytes when UTF-8 encoded ` +
        `(this one is ${byteLength(value)} bytes)`
    );
  }
  if (!/[a-zA-Z]/.test(value)) problems.push("must contain at least one letter");
  if (!/[0-9]/.test(value)) problems.push("must contain at least one number");

  // A short deny-list of passwords that would be guessed immediately.
  const weak = [
    "password", "password1", "password123", "1234567890", "qwertyuiop",
    "admin12345", "letmein123", "smartphonecafe", "smartphonecafe1",
  ];
  if (weak.includes(value.toLowerCase())) {
    problems.push("is too common and easily guessed");
  }

  return problems;
}

export async function hashPassword(password) {
  return bcrypt.hash(String(password), config.auth.bcryptRounds);
}

/**
 * Verifies a password against a stored hash.
 * Returns false (not an exception) for a malformed hash, so a corrupted row
 * cannot be distinguished from a wrong password by an attacker probing timings.
 */
export async function verifyPassword(password, hash) {
  if (!hash || typeof hash !== "string") return false;
  try {
    return await bcrypt.compare(String(password), hash);
  } catch {
    return false;
  }
}

export default { hashPassword, verifyPassword, checkPasswordPolicy };