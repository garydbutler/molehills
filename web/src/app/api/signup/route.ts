import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown })?.email === "string"
    ? ((body as { email: string }).email).trim().toLowerCase()
    : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (!(await isDbConfigured())) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL." },
      { status: 503 },
    );
  }

  try {
    await sql`
      INSERT INTO early_access_signups (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
