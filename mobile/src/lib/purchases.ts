/*
  RevenueCat — the whole paid-subscription surface lives here.

  Why RevenueCat and not Stripe: Apple guideline 3.1.1 and Google Play's
  payments policy both require in-app purchase for anything that unlocks
  features inside the app. RevenueCat wraps StoreKit and Play Billing, and
  owns receipt validation and entitlement state so we don't.

  NOT CONFIGURED IS A VALID STATE. Until the API keys are set, every call
  here no-ops and `hasPro` is false — but the caller must treat "not
  configured" as "don't gate anything", so the app keeps working for anyone
  running it before the store products exist. See `isConfigured`.
*/
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";

/* Publishable SDK keys — safe to ship in the bundle, unlike the secret key.
   Set in .env / EAS secrets as EXPO_PUBLIC_REVENUECAT_IOS_KEY etc. */
const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

/* Must match the entitlement identifier in the RevenueCat dashboard. */
export const ENTITLEMENT_ID = "inchmeal_pro";

/* How many plans someone gets before the paywall. Plan generation is the only
   thing that costs us money per use, so it is the only thing gated.
   ponytail: one number, deliberately. Change it here, not in the screens. */
export const FREE_PLAN_ALLOWANCE = 3;

export function isConfigured(): boolean {
  return typeof API_KEY === "string" && API_KEY.length > 0;
}

let configured = false;

/* Safe to call more than once; only the first call reaches the SDK. */
export function configurePurchases(appUserId?: string) {
  if (!isConfigured() || configured) return;
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    // No appUserID means RevenueCat mints an anonymous one. We upgrade it to
    // the real user via logInPurchases once they've signed in.
    Purchases.configure({ apiKey: API_KEY as string, appUserID: appUserId });
    configured = true;
  } catch (e) {
    console.warn("RevenueCat configure failed:", e);
  }
}

/* Ties purchases to the account rather than the device, so a subscription
   survives a reinstall or a second phone. Called after sign-in. */
export async function logInPurchases(appUserId: string) {
  if (!configured) return;
  try {
    await Purchases.logIn(appUserId);
  } catch (e) {
    console.warn("RevenueCat logIn failed:", e);
  }
}

export async function logOutPurchases() {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn("RevenueCat logOut failed:", e);
  }
}

export function hasPro(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active[ENTITLEMENT_ID];
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.warn("RevenueCat getCustomerInfo failed:", e);
    return null;
  }
}

/* The packages on the current offering, in dashboard order. Empty means
   nothing to sell — no offering configured, or the store products haven't
   finished review. The paywall must handle that without dead-ending. */
export async function getPackages(): Promise<PurchasesPackage[]> {
  if (!configured) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch (e) {
    console.warn("RevenueCat getOfferings failed:", e);
    return [];
  }
}

export type PurchaseOutcome =
  | { status: "purchased"; info: CustomerInfo }
  | { status: "cancelled" }
  | { status: "error"; message: string };

export async function purchase(
  pkg: PurchasesPackage,
): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { status: "purchased", info: customerInfo };
  } catch (e) {
    // A cancel is not an error — the user changed their mind, which is fine
    // and must never be shown as a failure.
    if (
      e &&
      typeof e === "object" &&
      "userCancelled" in e &&
      (e as { userCancelled?: boolean }).userCancelled
    ) {
      return { status: "cancelled" };
    }
    const message =
      e instanceof Error ? e.message : "The store didn't complete that.";
    return { status: "error", message };
  }
}

/* Apple and Google both require a visible way to restore purchases. */
export async function restore(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (e) {
    console.warn("RevenueCat restore failed:", e);
    return null;
  }
}

/* Fires whenever entitlements change — including a renewal, a lapse, a
   promotional entitlement granted from the dashboard, or a redeemed offer
   code. Returns its own unsubscribe. */
export function onCustomerInfo(fn: (info: CustomerInfo) => void): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(fn);
  return () => Purchases.removeCustomerInfoUpdateListener(fn);
}

/* ---- react ----

   No provider: the customer-info listener means every caller stays in sync on
   its own, so a purchase made on the paywall updates the capture screen
   without either knowing about the other.
*/
export type ProAccess = {
  pro: boolean;
  /* False until we know. Gate on `ready` so a slow first fetch never shows a
     paywall to someone who already paid. */
  ready: boolean;
};

export function useProAccess(): ProAccess {
  // Not configured means there is nothing to sell yet, so nothing is gated.
  const [state, setState] = useState<ProAccess>({
    pro: !isConfigured(),
    ready: !isConfigured(),
  });

  useEffect(() => {
    if (!isConfigured()) return;
    let alive = true;

    getCustomerInfo().then((info) => {
      if (alive) setState({ pro: hasPro(info), ready: true });
    });

    const off = onCustomerInfo((info) => {
      if (alive) setState({ pro: hasPro(info), ready: true });
    });

    return () => {
      alive = false;
      off();
    };
  }, []);

  return state;
}
