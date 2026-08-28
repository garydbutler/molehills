# Molehill — Installing the app on your iPhone (development build)

Setup guide for building Molehill and running it on your own iPhone using your
new Apple Developer Program account and EAS (Expo's cloud build service).

Prepared 2026-08-27.

---

## Before you start

**Wait for Apple to approve your enrollment.** You signed up for the Apple
Developer Program; Apple typically approves individual accounts in 24–48 hours.
You'll get a confirmation email. None of the build commands below will work
until the account is active, because they provision your device against your
Apple team.

What's already set up in the project (nothing for you to do here):

- `expo-dev-client` is installed.
- `eas.json` has a `development` profile that produces a phone-installable build.
- The project is linked to your Expo account: `@garydbutler/molehill`.
- Bundle identifier: `app.molehills.mobile`.

You do **not** need a working USB cable for any of this. EAS builds in Apple's
cloud and installs on your phone over Wi-Fi. Your iPhone (iPhone 16 Pro,
iOS 26.6.1) is well above the app's minimum of iOS 16.4.

---

## Step 1 — Register your iPhone

Run this in a terminal on your Mac:

```bash
cd /Users/gary/Development/projects/molehills/mobile
eas device:create
```

It will ask you to log in to Apple (your Apple ID plus two-factor code). Then
it gives you a URL or QR code. Open that **on the iPhone** and install the small
configuration profile it offers. This registers your phone's ID with your
Apple team so builds are allowed to install on it. No cable involved.

## Step 2 — Build the app

```bash
cd /Users/gary/Development/projects/molehills/mobile
eas build --profile development --platform ios
```

- Log in to Apple when prompted.
- Say yes when it offers to generate credentials (the distribution certificate
  and provisioning profile). Let EAS manage these for you.
- The build runs in Apple's cloud and takes roughly 15 to 25 minutes.
- When it finishes it prints an **install link**.

You can check build status any time with `eas build:list`.

## Step 3 — Install on the phone

Open the install link from Step 2 **on the iPhone** (in Safari). Tap through to
install. The app appears on your home screen like any other app.

## Step 4 — Run it

The development build loads its JavaScript from a local server, so it needs that
server running to start. On the Mac:

```bash
cd /Users/gary/Development/projects/molehills/mobile
npx expo start --dev-client
```

Open the app on your phone. It connects to the server over Wi-Fi (same network
as the Mac) and loads Molehill. This is also where Google and Facebook sign-in
finally work, because the `molehill://` return link only resolves inside the
real app, not in a browser.

---

## Weekly note

A development build does not expire the way a free personal-team build does, so
you won't need to reinstall every 7 days. If you later want to hand the app to
other testers, look at TestFlight (also covered by your paid membership).

---

## OAuth: two console items still open

Google and Facebook sign-in run against the deployed backend. Google should
work now that the client secret is fixed. Two Facebook items still need
attention in the provider consoles before that login completes:

1. **Facebook app mode.** If the Facebook app is in "Development" mode, only
   accounts with a role on the app can log in. Add your account as a tester at
   developers.facebook.com (App Roles), or set the app to Live (needs a privacy
   policy URL).
2. **Redirect URI.** In Facebook Login → Settings, the "Valid OAuth Redirect
   URIs" list must contain exactly:
   `https://molehills.vercel.app/api/auth/callback/facebook`

For reference, Google's authorized redirect URI is:
`https://molehills.vercel.app/api/auth/callback/google`

---

## Quick reference

| Step | Command | Where |
|------|---------|-------|
| Register phone | `eas device:create` | Mac terminal, then open link on phone |
| Build | `eas build --profile development --platform ios` | Mac terminal |
| Install | open the install link | iPhone Safari |
| Run | `npx expo start --dev-client` | Mac terminal, app on phone |

All commands run from `/Users/gary/Development/projects/molehills/mobile`.
