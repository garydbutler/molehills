/*
  Account deletion.

  App Store guideline 5.1.1(v) requires any app that creates accounts to let
  people delete them from inside the app. Reviewers check this directly, so
  it is a launch blocker, not a nicety.

  Deleting the row takes the usage counters with it (ON DELETE CASCADE), which
  means a determined person can delete, sign back in, and get another three
  free plans. That is a deliberate trade: the alternative is keeping a
  tombstone of everyone who ever left, which is a worse thing to have to
  explain in a privacy policy than three Gemini calls are to absorb.
*/
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

export const dynamic = "force-dynamic";

function corsHeaders(origin: string | null) {
  const isAllowed =
    origin &&
    (origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("exp://") ||
      origin === "molehill://");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function DELETE(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));

  // You may only delete yourself, and only with a token we signed.
  const auth = await requireUser(request, headers);
  if (auth.error) return auth.error;

  await sql`DELETE FROM users WHERE sub = ${auth.user.sub}`;

  // Deleting an account that was never persisted is not an error — the user
  // asked for there to be no record of them, and there is none.
  return NextResponse.json({ ok: true }, { headers });
}
