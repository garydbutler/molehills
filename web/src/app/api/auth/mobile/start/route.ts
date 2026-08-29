import { NextRequest, NextResponse } from "next/server";
import { areAuthSecretsConfigured, getMissingSecrets, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* Apple does not appear here: it uses the native sheet and posts its
   identity token to /api/auth/apple/native instead of this browser flow. */
const VALID_PROVIDERS = ["google"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

function corsHeaders(origin: string | null) {
  const isAllowed =
    origin &&
    (origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("exp://") ||
      origin === "molehill://");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!areAuthSecretsConfigured()) {
    const missing = getMissingSecrets();
    return NextResponse.json(
      {
        error: "Authentication service not configured",
        detail: `Missing environment variables: ${missing.join(", ")}`,
      },
      { status: 503, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider || !VALID_PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json(
      { error: `Invalid provider. Use: ${VALID_PROVIDERS.join(", ")}` },
      { status: 400, headers },
    );
  }

  const baseUrl = process.env.AUTH_URL || new URL(request.url).origin;
  const callbackUrl = `${baseUrl}/api/auth/mobile/callback`;

  await signIn(provider, { redirectTo: callbackUrl });
}
