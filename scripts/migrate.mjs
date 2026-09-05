#!/usr/bin/env node
/**
 * Applies SQL migrations when SUPABASE_SERVICE_ROLE_KEY is configured.
 * For local dual-mode development, seeding creates `.data/store.json` instead.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log("Supabase is not configured. Run `npm run db:seed` for local mode.");
  process.exit(0);
}

console.log("Apply migrations via the Supabase SQL editor or CLI:");
const dir = path.join(root, "supabase/migrations");
for (const file of (await readdir(dir)).sort()) {
  if (!file.endsWith(".sql")) continue;
  console.log(` - ${file} (${(await readFile(path.join(dir, file))).length} bytes)`);
}
console.log("\nThen run: npm run db:seed");
