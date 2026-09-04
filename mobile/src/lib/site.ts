/*
  Canonical backend identity for the app — mirrors web/src/lib/site.ts.

  The live host is unbig.app. Point at the canonical host directly so image
  uploads and authorization never depend on a cross-origin redirect.

  ponytail: the env var still wins so device builds can point at a preview
  deployment or a laptop without editing source.
*/
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://unbig.app";

/* The deep link the OAuth flow returns to. This is an internal identifier,
   not branding — it matches `scheme` in app.json and the redirect registered
   with Google. Renaming it invalidates that registration, and no user ever
   sees it. */
export const AUTH_REDIRECT_URI = "molehill://auth";

/* The marketing site, which hosts the legal documents Apple requires to be
   reachable from inside the app. */
export const SITE_URL = "https://unbig.app";
export const PRIVACY_URL = `${SITE_URL}/privacy-policy`;
export const TERMS_URL = `${SITE_URL}/terms-of-service`;
export const SUPPORT_URL = `${SITE_URL}/support`;
export const FEEDBACK_EMAIL = "contact@unbig.app";
