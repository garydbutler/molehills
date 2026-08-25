import { NextResponse } from "next/server";
import { isDbConfigured, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isDbConfigured())) {
    return NextResponse.json(
      { ok: true, database: "not configured" },
      { status: 200 },
    );
  }
  try {
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true, database: "connected" });
  } catch {
    return NextResponse.json(
      { ok: false, database: "unreachable" },
      { status: 500 },
    );
  }
}
