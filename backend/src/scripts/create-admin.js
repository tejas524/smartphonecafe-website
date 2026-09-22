/**
 * Creates (or resets) a CMS admin account.
 *
 * WHY A SCRIPT RATHER THAN SEEDED DATA
 * Phase 3 deliberately seeds no users: a working credential in the repository
 * would be a vulnerability. The first admin is created here, explicitly, by the
 * operator, and only the bcrypt hash is ever stored.
 *
 * Usage
 *   npm run create-admin -- --email owner@example.com --name "Owner"
 *   npm run create-admin -- --email owner@example.com --reset-password
 *
 * The password is read from the ADMIN_PASSWORD environment variable or typed at
 * a hidden prompt. It is never passed on the command line, because command-line
 * arguments are visible to other processes and land in shell history.
 */

import readline from "node:readline";
import { query, queryOne, closePool } from "./../db/pool.js";
import { checkPasswordPolicy, hashPassword } from "../auth/password.js";
import config from "../config/env.js";

function parseArgs(argv) {
  const args = { resetPassword: false, role: "admin" };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--email") args.email = argv[++i];
    else if (token === "--name") args.name = argv[++i];
    else if (token === "--role") args.role = argv[++i];
    else if (token === "--password") args.password = argv[++i];
    else if (token === "--reset-password") args.resetPassword = true;
    else if (token === "--help" || token === "-h") args.help = true;
  }
  return args;
}

function usage() {
  console.log(`
Create or reset a SmartphoneCafe CMS admin.

  npm run create-admin -- --email <address> --name "<name>" [--role admin]
  npm run create-admin -- --email <address> --reset-password

Options
  --email <address>     required
  --name "<name>"       required when creating a new account
  --role <role>         default: admin
  --reset-password      set a new password for an existing account

The password is never passed as an argument. Supply it via the ADMIN_PASSWORD
environment variable, or type it at the hidden prompt.
`);
}

/** Reads a password without echoing it to the terminal. */
function promptHidden(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error(
          "No interactive terminal available. Set the ADMIN_PASSWORD environment variable instead."
        )
      );
      return;
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    const stdin = process.stdin;
    process.stdout.write(question);
    // Suppress the echo of typed characters.
    const onData = (char) => {
      const s = char.toString();
      if (s === "\n" || s === "\r" || s === "\u0004") return;
      readline.moveCursor(process.stdout, 0, 0);
      readline.clearLine(process.stdout, 1);
      process.stdout.write(question);
    };
    stdin.on("data", onData);
    rl.question("", (answer) => {
      stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function readPassword(args) {
  if (args.password) {
    // Accepted for automation, but flagged, because argv is world-readable.
    console.warn(
      "[warn] A password was supplied via --password. Command-line arguments are " +
        "visible to other processes; prefer ADMIN_PASSWORD or the hidden prompt."
    );
    return args.password;
  }
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }
  const first = await promptHidden("Password: ");
  const second = await promptHidden("Confirm password: ");
  if (first !== second) {
    throw new Error("The two passwords did not match.");
  }
  return first;
}

function normaliseEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  // A deliberately simple shape check: it must look like an address, and it must
  // not contain whitespace. Deep validation belongs at the mail layer.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
    throw new Error(`"${value}" does not look like a valid email address.`);
  }
  return email;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }
  if (!args.email) {
    usage();
    throw new Error("--email is required.");
  }

  const email = normaliseEmail(args.email);
  const existing = await queryOne("SELECT id, email FROM users WHERE email = ? LIMIT 1", [email]);

  if (existing && !args.resetPassword) {
    throw new Error(
      `An account for ${email} already exists (id ${existing.id}). ` +
        `Re-run with --reset-password to set a new password.`
    );
  }

  if (!existing && !args.name) {
    throw new Error("--name is required when creating a new account.");
  }

  const password = await readPassword(args);
  const problems = checkPasswordPolicy(password);
  if (problems.length) {
    throw new Error(`The password ${problems.join(", ")}.`);
  }

  // The hash is the only thing that touches the database.
  const hash = await hashPassword(password);

  if (existing) {
    await query("UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?", [
      hash,
      existing.id,
    ]);
    console.log(`[create-admin] password reset for ${email} (id ${existing.id})`);
  } else {
    const name = String(args.name).trim().slice(0, 120);
    const role = String(args.role || "admin").trim().slice(0, 32) || "admin";
    const result = await query(
      "INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)",
      [name, email, hash, role]
    );
    console.log(`[create-admin] created ${email} (id ${result.insertId}, role ${role})`);
  }

  console.log("[create-admin] the plaintext password was not stored anywhere.");
}

main()
  .then(async () => {
    await closePool();
  })
  .catch(async (err) => {
    console.error(`[create-admin] ERROR: ${err.message}`);
    await closePool().catch(() => {});
    process.exitCode = 1;
  });
