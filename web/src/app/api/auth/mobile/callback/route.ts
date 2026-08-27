import { NextRequest, NextResponse } from "next/server";
import { auth, createMobileToken, areAuthSecretsConfigured, getMissingSecrets } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MOBILE_SCHEME = "molehill";

export async function GET(request: NextRequest) {
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

  const session = await auth();

  if (!session?.user) {
    const errorUrl = `${MOBILE_SCHEME}://auth?error=auth_failed&message=${encodeURIComponent("Authentication failed. Please try again.")}`;
    return NextResponse.redirect(errorUrl);
  }

  try {
    const token = await createMobileToken({
      name: session.user.name,
      email: session.user.email,
      provider: session.user.provider ?? "unknown",
      sub: session.user.sub ?? session.user.email ?? "unknown",
    });

    const successUrl = `${MOBILE_SCHEME}://auth?token=${encodeURIComponent(token)}`;
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Failed to create mobile token:", err);
    const errorUrl = `${MOBILE_SCHEME}://auth?error=token_failed&message=${encodeURIComponent("Failed to create session. Please try again.")}`;
    return NextResponse.redirect(errorUrl);
  }
}
