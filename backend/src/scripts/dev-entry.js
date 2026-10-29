/** Some preview hosts run `npm run dev` instead of `npm start`. Use the full
 * Express app when a host supplies PORT; keep Vite for ordinary local work. */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = fileURLToPath(new URL("../../../", import.meta.url));

export function devPlan(env, hasBuild) {
  if (!env.PORT) return ["frontend"];
  return hasBuild ? ["server"] : ["build", "server"];
}

function npm(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [process.env.npm_execpath, ...args], {
      cwd: root, stdio: "inherit", env: process.env,
    });
    const forward = (signal) => child.kill(signal);
    const onInt = () => forward("SIGINT");
    const onTerm = () => forward("SIGTERM");
    process.once("SIGINT", onInt);
    process.once("SIGTERM", onTerm);
    child.once("error", reject);
    child.once("exit", (code) => {
      process.removeListener("SIGINT", onInt);
      process.removeListener("SIGTERM", onTerm);
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const plan = devPlan(process.env, existsSync(path.join(root, "frontend/dist/index.html")));
  for (const step of plan) {
    if (step === "server") {
      console.log("[preview] Starting full website and API on the host-assigned PORT.");
      await import("../server.js");
    } else {
      const code = await npm(step === "build" ? ["run", "build"] : ["--prefix", "frontend", "run", "dev"]);
      if (code !== 0) { process.exitCode = code; return; }
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error("[preview] Startup failed:", error.message); process.exitCode = 1; });
}
