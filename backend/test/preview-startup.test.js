import test from "node:test";
import assert from "node:assert/strict";
import { devPlan } from "../src/scripts/dev-entry.js";

test("hosted preview launches the API instead of Vite on port 5173", () => {
  assert.deepEqual(devPlan({ PORT: "20010" }, true), ["server"]);
});
test("hosted preview builds the frontend if the build was not retained", () => {
  assert.deepEqual(devPlan({ PORT: "20010" }, false), ["build", "server"]);
});
test("local development without a host-assigned port keeps Vite", () => {
  assert.deepEqual(devPlan({}, true), ["frontend"]);
});
