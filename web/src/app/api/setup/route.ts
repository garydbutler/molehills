import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isDbConfigured, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

// One-time schema bootstrap. Called with ?key=<random>, then removed.
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") ?? "";
  if (key !== "ir3v1dp0gke5zcymltfu69aw") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await isDbConfigured())) {
    return NextResponse.json(
      { ok: false, reason: "POSTGRES_URL not set" },
      { status: 503 },
    );
  }

  const statements = readFileSync(
    join(process.cwd(), "scripts", "schema.sql"),
    "utf8",
  )
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }

  const check = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'early_access_signups'
  `;

  return NextResponse.json({
    ok: true,
    tables: check.rows.map((r) => r.table_name),
  });
}
