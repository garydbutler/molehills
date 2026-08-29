/*
  RevenueCat entitlement webhook.

  This is the only writer of `users.is_pro`. Nothing on a request path may
  raise it, because the phone holding the receipt is assumed hostile.

  RevenueCat authenticates by sending the Authorization header you configure
  on the webhook in their dashboard. If REVENUECAT_WEBHOOK_SECRET is unset we
  refuse every call rather than accepting unauthenticated entitlement grants —
  an unconfigured webhook should be visibly broken, never silently open.
*/
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/* Events that mean "this account currently has access". RevenueCat sends
   `expiration_at_ms` with these, and we trust that over any local clock. */
const GRANTING = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "NON_RENEWING_PURCHASE",
]);

/* Events that end access immediately, regardless of the stored expiry.
   CANCELLATION is deliberately absent: a cancelled subscription runs to the
   end of the period it was paid for. */
const REVOKING = new Set(["EXPIRATION", "REFUND", "SUBSCRIPTION_PAUSED"]);

export async function POST(request: NextRequest) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RevenueCat webhook called but REVENUECAT_WEBHOOK_SECRET is unset");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    event?: {
      type?: string;
      app_user_id?: string;
      expiration_at_ms?: number | null;
    };
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const event = payload.event;
  const type = event?.type;
  // app_user_id is what the app passed to Purchases.logIn — our OAuth subject.
  const appUserId = event?.app_user_id;

  if (!type || !appUserId) {
    return NextResponse.json({ error: "Missing event type or app_user_id" }, { status: 400 });
  }

  // Anonymous RevenueCat ids belong to a device that never signed in, so there
  // is no account to credit. Acknowledge so RevenueCat stops retrying.
  if (appUserId.startsWith("$RCAnonymousID:")) {
    return NextResponse.json({ ok: true, ignored: "anonymous" });
  }

  const grants = GRANTING.has(type);
  const revokes = REVOKING.has(type);
  if (!grants && !revokes) {
    // TRANSFER, BILLING_ISSUE, CANCELLATION and friends: nothing to change.
    return NextResponse.json({ ok: true, ignored: type });
  }

  const expiresAt =
    grants && event?.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

  /*
    The webhook can arrive before the user's first authenticated API call, so
    this inserts the row if it does not exist yet. Someone can buy on a fresh
    install and have entitlement waiting before they ever generate a plan.
  */
  await sql`
    INSERT INTO users (sub, is_pro, pro_expires_at, rc_updated_at)
    VALUES (${appUserId}, ${grants}, ${expiresAt}, now())
    ON CONFLICT (sub) DO UPDATE
      SET is_pro = ${grants},
          pro_expires_at = ${expiresAt},
          rc_updated_at = now()
  `;

  return NextResponse.json({ ok: true, type, pro: grants });
}
