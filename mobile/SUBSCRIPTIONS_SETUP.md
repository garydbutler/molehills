# Subscriptions setup (RevenueCat)

## Server-side metering and entitlement

The three AI routes are authenticated and metered. The rules live in
[`web/src/lib/quota.ts`](../web/src/lib/quota.ts):

| Limit | Value | Enforced |
| --- | --- | --- |
| Free plan generations | 3, lifetime | server |
| Pro plan generations | 12 per rolling 30 days | server |
| Recaptures | 3 per day | server |
| End-state image retries | 3 per project | server |
| Active projects | 3 free / 10 pro | client only — costs nothing to bypass |

Both plan tiers are a `COUNT` over `plan_generations`, so nothing can drift.
A plan is recorded only after the model returns one; a failed call is free.

`users.is_pro` is written **only** by `/api/revenuecat/webhook`. No request
path can raise it, and expiry is re-checked on read so a missed webhook cannot
grant access forever. The webhook returns 503 when `REVENUECAT_WEBHOOK_SECRET`
is unset — it fails closed, never open.

Webhook is live: "Inchmeal entitlement sync", both Production and Sandbox, all
apps, all events. Verified end to end — RevenueCat's own test event returned
200, and `TEST` is ignored so it creates no row.

To rotate the secret: generate a new one, `vercel env rm/add
REVENUECAT_WEBHOOK_SECRET production`, redeploy, then update the Authorization
header value on the webhook in RevenueCat. Both sides must match.

Schema lives in `web/scripts/002-accounts-and-metering.sql`. Neon's HTTP
driver rejects multi-statement queries, so apply it one statement at a time in
the SQL editor. `vercel env pull` cannot fetch Secret-type vars — they come
back as the literal string `[SENSITIVE]` — so `npm run db:push` needs a
connection string pasted by hand from the Neon console.

## Status

Verified working on the simulator against the live RevenueCat project using the
**Test Store** key in `mobile/.env`:

- offerings load — Monthly $5.99, Annual $39.99
- a test purchase completes and the paywall dismisses itself
- restore returns an active `inchmeal_pro` entitlement, so the products are correctly
  attached to the entitlement the code checks

**What is left is real store products and real keys.** The Test Store key only
simulates purchases; it must be swapped before any TestFlight or production
build, or purchases will be fake in a shipped app.

If the keys are ever absent, **the paywall never appears**: `isConfigured()` in
[`src/lib/purchases.ts`](src/lib/purchases.ts) returns false and the app behaves
as it did before subscriptions existed.

## Why not Stripe

Apple's guideline 3.1.1 and Google Play's payments policy both require in-app
purchase for anything unlocking features inside the app. A Stripe paywall here
gets the app rejected. RevenueCat wraps StoreKit and Play Billing and owns
receipt validation and entitlement state.

## What's gated

Plan generation, and only that — it's the one action that costs money per use
(a vision-model call). `FREE_PLAN_ALLOWANCE` in
[`src/lib/purchases.ts`](src/lib/purchases.ts) is currently **3**; it's one
constant, change it there.

A failed plan call does not count against the allowance. Projects already
created stay usable forever, subscribed or not.

## Steps

### 1. App Store Connect

**Done.** App record `Inchmeal`, Apple ID `6806639112`, bundle id
`app.inchmeal.mobile`, SKU `inchmeal-ios`.

Subscription group **Inchmeal Full** (`22344933`) with both products created,
priced in all 175 regions, and localized:

| Product ID | Duration | US price | Apple ID |
| --- | --- | --- | --- |
| `inchmeal.full.monthly` | 1 month | $5.99 | 6806642063 |
| `inchmeal.full.annual` | 1 year, billed upfront | $39.99 | 6806642254 |

The paywall reads `product.title` / `product.description` straight from the
store, so those localizations are what users see.

**Business section is complete** — Paid Apps Agreement, Free Apps Agreement,
bank account, W-9, and DSA trader status all Active as of Aug 29, 2026.

Both products sit at **Prepare for Submission**, which is the correct terminal
state before launch: Apple requires the first auto-renewable subscription to be
submitted alongside a new app version. They are already purchasable against a
**sandbox** account, so a dev or TestFlight build can transact today.

RevenueCat shows Store Status "Could not check" for them. That is cosmetic —
the status probe uses a separate **App Store Connect API key** integration,
which is not set up and is not needed for purchases. Set it up only if you want
product import and live status in the dashboard.

### 2. Google Play Console

Same products, same ids, under **Monetize → Subscriptions**. Package name
`app.inchmeal`. Not started.

### 3. RevenueCat

The project already exists with a `default` offering, monthly and yearly
packages, and a `inchmeal_pro` entitlement — all verified from the app. What it still
needs is the real store apps attached:

Project `f2cbd756`. **iOS is done.** App `Inchmeal (App Store)`
(`app41cd24e435`), in-app purchase key uploaded:

- Key ID `67BC8L3QJW`
- Issuer ID `f67e4ac9-0007-44a2-8f07-2a43cd68ec19`
- the .p8 downloads exactly once from App Store Connect and is not in this repo

Both App Store products exist, are attached to `inchmeal_pro`, and fill the
App Store slot of the `$rc_monthly` and `$rc_annual` packages in the `default`
offering. The Test Store products stay attached alongside them, so simulator
testing keeps working.

The iOS SDK key `appl_…` is in `mobile/.env`.

**Android is not started** — the project still has no Play app, so
`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` is still the Test Store key. It needs a
Play Console app plus a **Service Account JSON**.

RevenueCat generated its own custom URL scheme `rc-41cd24e435` for paywall
previews. Only needed if you ever use RevenueCat's hosted paywall previews;
the app's own `scheme` in app.json is unrelated and unchanged.
3. **Products** → import the store products.
4. **Entitlements** → the `inchmeal_pro` entitlement already exists and matches
   `ENTITLEMENT_ID` in the code. Attach the real store products to it too.
5. **Offerings** → create the `default` offering, add a monthly and an annual
   package. The paywall lists `offerings.current.availablePackages` in
   dashboard order, so ordering and pricing change without an app release.

### 4. Keys

`mobile/.env` currently holds a **Test Store** key. Replace it with the two real
**public SDK keys** from RevenueCat → API keys (`appl_` / `goog_`), not the
secret key — that one must never ship in the app.

Local `.env` in `mobile/`:

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
```

For builds, set the same two as EAS environment variables (they're publishable,
so plain env vars are fine — they do not need to be EAS secrets).

## Testing

- The paywall cannot be tested in Expo Go — it needs a development build, which
  you already use.
- iOS: create a **Sandbox Tester** in App Store Connect, then sign into it from
  Settings → App Store → Sandbox Account on the device.
- Android: add your account to a **License Testing** list in Play Console.
- Sandbox subscriptions renew on an accelerated clock (a month ≈ 5 minutes), so
  lapse and renewal are testable in one sitting.

## Promo codes

Three separate mechanisms, only the third is RevenueCat's own:

1. **Apple Offer Codes** — created in App Store Connect, per platform. Free or
   discounted period. RevenueCat picks up the entitlement automatically, no
   code needed on our side. Apple's *in-app* redemption sheet is unreliable;
   prefer the out-of-app redeem URL.
2. **Google Play promo codes** — the Play Console equivalent. Configured
   separately; RevenueCat has no unified code creation across the two stores.
3. **RevenueCat Promotional Entitlements** — grant `pro` to a user directly via
   the REST API or dashboard, no store and no payment involved. Cross-platform
   in one call. Best fit for comps, beta testers, press, and support goodwill.
   Not a redeemable code out of the box — a code table plus a call to the grant
   endpoint would make it one.

The app already reacts to all three at runtime: `onCustomerInfo` listens for
entitlement changes, so a granted entitlement or redeemed code unlocks the app
without a restart.
