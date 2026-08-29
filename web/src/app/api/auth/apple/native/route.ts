/*
  Native Sign in with Apple.

  The device runs Apple's own sheet and gets back an identity token — a JWT
  signed by Apple. This route verifies it against Apple's published keys and,
  if it checks out, mints the same mobile JWT the Google flow produces. From
  there nothing downstream knows or cares which provider was used.

  Why no client secret: that is only needed for Apple's *web* OAuth flow. The
  native token is verified against Apple's public JWKS, so there is no shared
  secret to store and nothing that expires every six months.

  The identity token is the only thing trusted here. `fullName` is accepted
  from the client because Apple hands it to the device exactly once, on first
  authorisation, and never again — but it is display text only and is never
  used for identity.
*/
import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { createMobileToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const APPLE_ISSUER = "https://appleid.apple.com";

/* The audience of a native identity token is the app's bundle id, not a
   Services ID. Kept in env so a bundle rename does not need a code change. */
const AUDIENCE = process.env.APPLE_BUNDLE_ID ?? "app.inchmeal.mobile";

/* Cached across invocations by the module system; jose also caches the keys
   and refetches when Apple rotates them. */
const APPLE_KEYS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);

function corsHeaders(origin: string | null) {
  const isAllowed =
    origin &&
    (origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("exp://") ||
      origin === "molehill://");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));

  if (!process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "Authentication service not configured" },
      { status: 503, headers },
    );
  }

  let body: { identityToken?: string; fullName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers });
  }

  if (!body.identityToken) {
    return NextResponse.json(
      { error: "Missing identityToken" },
      { status: 400, headers },
    );
  }

  let sub: string;
  let email: string | undefined;
  try {
    const { payload } = await jwtVerify(body.identityToken, APPLE_KEYS, {
      issuer: APPLE_ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub) throw new Error("no sub claim");
    sub = payload.sub;
    // Absent when the user hid their address and we have seen them before;
    // present as a @privaterelay.appleid.com forwarder on first authorisation.
    email = typeof payload.email === "string" ? payload.email : undefined;
  } catch {
    // Covers a forged token, a wrong audience, an expired token, and Apple
    // key rotation mid-flight. All of them mean: not signed in.
    return NextResponse.json(
      { error: "Could not verify that Apple sign-in." },
      { status: 401, headers },
    );
  }

  const token = await createMobileToken({
    name: body.fullName?.trim() || undefined,
    email,
    provider: "apple",
    sub,
  });

  return NextResponse.json({ token }, { headers });
}
