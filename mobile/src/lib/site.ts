/*
  Canonical backend identity for the app — mirrors web/src/lib/site.ts.

  The domain moves to inchmeal.app before launch. When it does, this file and
  the two OAuth consoles are the whole change: nothing else in the app names
  the host.

  ponytail: the env var still wins so device builds can point at a preview
  deployment or a laptop without editing source.
*/
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://inchmeal.app";

/* The deep link the OAuth flow returns to. This is an internal identifier,
   not branding — it matches `scheme` in app.json and the redirect registered
   with Google. Renaming it invalidates that registration, and no user ever
   sees it. */
export const AUTH_REDIRECT_URI = "molehill://auth";

/* The marketing site, which hosts the legal documents Apple requires to be
   reachable from inside the app. */
export const SITE_URL = "https://inchmeal.app";
export const PRIVACY_URL = `${SITE_URL}/privacy-policy`;
export const TERMS_URL = `${SITE_URL}/terms-of-service`;
export const SUPPORT_URL = `${SITE_URL}/support`;
export const FEEDBACK_EMAIL = "support@inchmeal.app";
