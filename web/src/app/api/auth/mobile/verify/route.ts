import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken, areAuthSecretsConfigured, getMissingSecrets } from "@/lib/auth";

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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
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

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers },
    );
  }

  const { token } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400, headers },
    );
  }

  const user = await verifyMobileToken(token);

  if (!user) {
    return NextResponse.json(
      { valid: false, error: "Invalid or expired token" },
      { status: 401, headers },
    );
  }

  return NextResponse.json(
    {
      valid: true,
      user: {
        name: user.name,
        email: user.email,
        provider: user.provider,
      },
    },
    { headers },
  );
}
