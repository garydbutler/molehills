/*
  Applies scripts/schema.sql to the database in POSTGRES_URL.
  Usage: npm run db:push
*/
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const url = process.env.POSTGRES_URL;
if (!url || url.includes("user:password")) {
  console.error(
    "POSTGRES_URL is not set. Copy .env.example to .env.local and fill it in, or run `vercel env pull .env.local`.",
  );
  process.exit(1);
}

const { sql } = await import("@vercel/postgres");

const schemaPath = join(process.cwd(), "scripts", "schema.sql");
const statements = readFileSync(schemaPath, "utf8")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("Applied:", statement.split("\n")[0].slice(0, 60), "…");
}

console.log("Schema is up to date.");
