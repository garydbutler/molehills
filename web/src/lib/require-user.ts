/*
  Bearer-token gate for the AI routes.

  These three endpoints (/api/plan, /api/recapture, /api/end-state) each spend
  real money on a Gemini call, so none of them may run for an anonymous caller.
  CORS is not a control here: a native app sends no Origin, and curl sends
  whatever it likes.

  Identity comes from the signed mobile JWT and nothing else — never from a
  field in the request body. The client is assumed hostile.
*/
import { NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth";

export type AuthedUser = {
  sub: string;
  email?: string;
  provider: string;
};

/* Returns the caller, or a ready-to-send 401. Callers must check `error`
   first — the union keeps the "forgot to check" mistake from type-checking. */
export type AuthResult =
  | { user: AuthedUser; error: null }
  | { user: null; error: NextResponse };

export async function requireUser(
  request: Request,
  headers: Record<string, string>,
): Promise<AuthResult> {
  const unauthorized = (detail: string) => ({
    user: null as null,
    error: NextResponse.json(
      { error: "Sign in to continue.", detail },
      { status: 401, headers },
    ),
  });

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return unauthorized("Missing bearer token");
  }

  const claims = await verifyMobileToken(header.slice("Bearer ".length).trim());
  // Null covers a bad signature, an expired token, and AUTH_SECRET being unset.
  // All three mean the same thing to the caller: you are not signed in.
  if (!claims?.sub) {
    return unauthorized("Invalid or expired token");
  }

  return {
    user: { sub: claims.sub, email: claims.email, provider: claims.provider },
    error: null,
  };
}
