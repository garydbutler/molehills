/*
  What a caller is allowed to spend.

  The rules, in one place because they are the product's pricing:

    free  — 3 plan generations, ever
    pro   — 12 plan generations per rolling 30 days

  Both derive from counting rows in plan_generations, so there is no counter
  to drift away from what actually happened. A refunded or lapsed subscriber
  falls back to the free rule automatically: `is_pro` goes false and the
  lifetime count is already there.

  Active-project caps (3 free / 10 pro) are deliberately NOT here. They cost
  nothing to circumvent, they need project state the server does not keep,
  and they are a product guardrail rather than a spend control. The client
  enforces those.
*/
import { sql } from "@/lib/db";
import type { AuthedUser } from "@/lib/require-user";

export const FREE_LIFETIME_PLANS = 3;
export const PRO_PLANS_PER_WINDOW = 12;
export const PRO_WINDOW_DAYS = 30;
export const MAX_RECAPTURES_PER_DAY = 3;
export const MAX_END_STATE_ATTEMPTS = 3;

export type DbUser = {
  id: number;
  is_pro: boolean;
};

/*
  Finds or creates the account row for a verified token.

  Sign-in happens on the device against the OAuth routes, so the first time we
  see a valid token here the user may not have a row yet. ON CONFLICT makes
  this safe under the concurrent requests a single app launch produces.

  Note the deliberate absence of an UPDATE on `is_pro` — entitlement is the
  webhook's business, and a request path must never be able to raise it.
*/
export async function findOrCreateUser(user: AuthedUser): Promise<DbUser> {
  const { rows } = await sql`
    INSERT INTO users (sub, email, provider)
    VALUES (${user.sub}, ${user.email ?? null}, ${user.provider ?? null})
    ON CONFLICT (sub) DO UPDATE SET email = COALESCE(EXCLUDED.email, users.email)
    RETURNING id, is_pro, pro_expires_at
  `;
  const row = rows[0];

  // A subscription that lapsed without the webhook arriving (or arriving late)
  // must not keep granting pro. Expiry is checked on read, not trusted from
  // the flag alone.
  const expires = row.pro_expires_at ? new Date(row.pro_expires_at) : null;
  const stillValid = row.is_pro && (!expires || expires > new Date());

  return { id: Number(row.id), is_pro: stillValid };
}

export type QuotaDecision =
  | { allowed: true }
  | { allowed: false; reason: string; upgrade: boolean };

/*
  May this user generate another plan?

  `upgrade` tells the client whether showing the paywall is the right response.
  A free user out of their lifetime allowance can fix it by subscribing; a pro
  user who has burned 12 in 30 days cannot, and must simply wait — showing
  them a paywall would be both useless and insulting.
*/
export async function checkPlanQuota(user: DbUser): Promise<QuotaDecision> {
  if (user.is_pro) {
    const { rows } = await sql`
      SELECT COUNT(*)::int AS used
      FROM plan_generations
      WHERE user_id = ${user.id}
        AND created_at > now() - INTERVAL '30 days'
    `;
    const used = rows[0].used as number;
    if (used >= PRO_PLANS_PER_WINDOW) {
      return {
        allowed: false,
        upgrade: false,
        reason: `That's ${PRO_PLANS_PER_WINDOW} new projects in 30 days — the most Inchmeal makes at once. A slot frees up as your earlier ones pass 30 days.`,
      };
    }
    return { allowed: true };
  }

  const { rows } = await sql`
    SELECT COUNT(*)::int AS used FROM plan_generations WHERE user_id = ${user.id}
  `;
  const used = rows[0].used as number;
  if (used >= FREE_LIFETIME_PLANS) {
    return {
      allowed: false,
      upgrade: true,
      reason: `You've used your ${FREE_LIFETIME_PLANS} free projects. Everything you've already made stays yours.`,
    };
  }
  return { allowed: true };
}

/* Called only after the model returns a plan. A failed generation costs the
   user nothing, which is what SUBSCRIPTIONS_SETUP.md promises. */
export async function recordPlanGeneration(user: DbUser): Promise<void> {
  await sql`INSERT INTO plan_generations (user_id) VALUES (${user.id})`;
}

/*
  Recapture: a daily ceiling, counted against the client's local day.

  Trusting the client's date lets someone claim a new day and get more looks.
  That is bounded and cheap — the alternative, a server day, tells a user in
  New Zealand their looks reset at lunchtime. Correct beats clever here; the
  ceiling still holds within any given claimed day.
*/
export async function claimRecapture(
  user: DbUser,
  day: string,
): Promise<QuotaDecision> {
  const { rows } = await sql`
    INSERT INTO recapture_calls (user_id, day, count)
    VALUES (${user.id}, ${day}, 1)
    ON CONFLICT (user_id, day) DO UPDATE SET count = recapture_calls.count + 1
    RETURNING count
  `;
  if ((rows[0].count as number) > MAX_RECAPTURES_PER_DAY) {
    return {
      allowed: false,
      upgrade: false,
      reason: "That's all the looks for today. Tomorrow gives you more.",
    };
  }
  return { allowed: true };
}

/* Image generation, bounded per project so a retry loop cannot run away. */
export async function claimEndStateAttempt(
  user: DbUser,
  projectId: string,
): Promise<QuotaDecision> {
  const { rows } = await sql`
    INSERT INTO end_state_attempts (user_id, project_id, count)
    VALUES (${user.id}, ${projectId}, 1)
    ON CONFLICT (user_id, project_id) DO UPDATE SET count = end_state_attempts.count + 1
    RETURNING count
  `;
  if ((rows[0].count as number) > MAX_END_STATE_ATTEMPTS) {
    return {
      allowed: false,
      upgrade: false,
      reason: "Couldn't picture this one. Your plan is ready to use as it is.",
    };
  }
  return { allowed: true };
}
