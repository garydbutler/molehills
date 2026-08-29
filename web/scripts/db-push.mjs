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

/*
  createClient, not the pooled `sql` helper: `vercel env pull` hands back a
  direct (unpooled) connection string, which the pooled client refuses. The
  deployed app is unaffected — it gets a pooled URL from the integration.
*/
const { createClient } = await import("@vercel/postgres");
const client = createClient({ connectionString: url });
await client.connect();

const schemaPath = join(process.cwd(), "scripts", "schema.sql");
const statements = readFileSync(schemaPath, "utf8")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

try {
  for (const statement of statements) {
    await client.query(statement);
    // Comment-only chunks are harmless, but naming them would be noise.
    const firstCode = statement
      .split("\n")
      .find((l) => l.trim() && !l.trim().startsWith("--"));
    if (firstCode) console.log("Applied:", firstCode.slice(0, 60), "…");
  }
  console.log("Schema is up to date.");
} finally {
  await client.end();
}
