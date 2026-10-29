import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { RESOURCES } from "../src/db/resources.js";

test("fresh database contains every column queried by CMS resources", () => {
  const sql = fs.readFileSync(new URL("../../database/schema.sql", import.meta.url), "utf8");
  for (const resource of Object.values(RESOURCES)) {
    const definition = sql.split(`CREATE TABLE \`${resource.table}\` (`)[1]?.split("\n) ENGINE")[0];
    assert.ok(definition, `Missing table: ${resource.table}`);
    for (const column of Object.keys(resource.columns)) {
      assert.match(definition, new RegExp(`^\\s*\`${column}\`\\s`, "m"), `${resource.table}.${column}`);
    }
  }
});
