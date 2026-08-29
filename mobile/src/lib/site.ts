/*
  Canonical backend identity for the app — mirrors web/src/lib/site.ts.

  The domain moves to inchmeal.app before launch. When it does, this file and
  the two OAuth consoles are the whole change: nothing else in the app names
  the host.

  ponytail: the env var still wins so device builds can point at a preview
  deployment or a laptop without editing source.
*/
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://molehills.vercel.app";

/* The deep link the OAuth flow returns to. This is an internal identifier,
   not branding — it matches `scheme` in app.json and the redirect registered
   with Google and Facebook. Renaming it invalidates both, and no user ever
   sees it. */
export const AUTH_REDIRECT_URI = "molehill://auth";
