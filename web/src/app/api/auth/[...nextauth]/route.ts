import { NextRequest, NextResponse } from "next/server";
import { handlers, areAuthSecretsConfigured, getMissingSecrets } from "@/lib/auth";

export const dynamic = "force-dynamic";

function checkSecrets() {
  if (!areAuthSecretsConfigured()) {
    const missing = getMissingSecrets();
    return NextResponse.json(
      {
        error: "Authentication service not configured",
        detail: `Missing environment variables: ${missing.join(", ")}`,
      },
      { status: 503 },
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  const secretsError = checkSecrets();
  if (secretsError) return secretsError;
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const secretsError = checkSecrets();
  if (secretsError) return secretsError;
  return handlers.POST(request);
}
