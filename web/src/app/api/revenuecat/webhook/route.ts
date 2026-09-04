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

/* A real account id, not the anonymous one RevenueCat mints per device before
   sign-in. Transfer lists carry both. */
function isAccountId(id: string): boolean {
  return !!id && !id.startsWith("$RCAnonymousID:");
}

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
      transferred_from?: string[];
      transferred_to?: string[];
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

  if (!type) {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  /*
    TRANSFER is the one event with no `app_user_id`: it names a `transferred_from`
    and a `transferred_to` instead, because the subscription just moved between
    identities — someone who bought while signed in with Google, then signed in
    with Apple. Entitlement here is keyed by identity, so it has to move too, or
    the new identity is a paying customer the server has never heard of and the
    old one keeps access it no longer owns.

    This used to fall through to the guard above and answer 400, which made
    RevenueCat retry six times and then give up — the transfer silently lost.
  */
  if (type === "TRANSFER") {
    const from = (event?.transferred_from ?? []).filter(isAccountId);
    const to = (event?.transferred_to ?? []).filter(isAccountId);

    // Carry the real expiry across rather than inventing one; the event itself
    // carries no expiration_at_ms.
    let expiresAt: string | null = null;
    let wasPro = false;
    for (const sub of from) {
      const { rows } = await sql`
        SELECT is_pro, pro_expires_at FROM users WHERE sub = ${sub}
      `;
      if (rows[0]?.is_pro) {
        wasPro = true;
        expiresAt = rows[0].pro_expires_at
          ? new Date(rows[0].pro_expires_at as string).toISOString()
          : null;
        break;
      }
    }

    for (const sub of to) {
      await sql`
        INSERT INTO users (sub, is_pro, pro_expires_at, rc_updated_at)
        VALUES (${sub}, ${wasPro}, ${expiresAt}, now())
        ON CONFLICT (sub) DO UPDATE
          SET is_pro = ${wasPro},
              pro_expires_at = ${expiresAt},
              rc_updated_at = now()
      `;
    }

    // The old identity no longer holds the receipt.
    for (const sub of from) {
      await sql`
        UPDATE users SET is_pro = false, pro_expires_at = null, rc_updated_at = now()
        WHERE sub = ${sub}
      `;
    }

    return NextResponse.json({ ok: true, type, moved: to.length, pro: wasPro });
  }

  if (!appUserId) {
    // Well-formed but not something we act on. 200, because a 4xx here makes
    // RevenueCat retry and eventually disable the webhook.
    return NextResponse.json({ ok: true, ignored: `${type} without app_user_id` });
  }

  // Anonymous RevenueCat ids belong to a device that never signed in, so there
  // is no account to credit. Acknowledge so RevenueCat stops retrying.
  if (!isAccountId(appUserId)) {
    return NextResponse.json({ ok: true, ignored: "anonymous" });
  }

  const grants = GRANTING.has(type);
  const revokes = REVOKING.has(type);
  if (!grants && !revokes) {
    // BILLING_ISSUE, CANCELLATION and friends: access is unchanged until it
    // actually lapses, and EXPIRATION will say so when it does.
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
