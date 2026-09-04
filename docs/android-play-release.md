# Android and Google Play release guide

Inchmeal uses the existing Expo/React Native codebase for both iOS and Android.
The application code is shared; Android has its own package identifier, signing
key, store listing, subscription products, and release builds.

## Current project configuration

- Google Play package: `app.inchmeal`
- EAS development build: installable APK for an emulator or physical device
- EAS production build: Android App Bundle (AAB) for Google Play
- EAS production submission: internal testing track, draft status
- Android emulator: Pixel 10, API 37.1, Google Play image
- Microphone permission: explicitly removed because Inchmeal does not record audio

The package identifier is permanent after the first Google Play upload. Verify
`app.inchmeal` before creating the Play Console app.

## Run Inchmeal in the Android emulator

Android Studio and the Pixel 10 virtual device are installed on this Mac.

1. Open Android Studio, then **More Actions → Virtual Device Manager**.
2. Start **Pixel 10** and wait for the Android home screen.
3. From `mobile/`, install the latest EAS development APK:

   ```sh
   npx eas build:run --platform android --latest
   ```

4. Start the Expo development server:

   ```sh
   npx expo start --dev-client
   ```

5. Open Inchmeal in the emulator. If it does not connect automatically, press
   `a` in the Expo terminal.

For a fresh development APK, run:

```sh
npx eas build --platform android --profile development
```

An emulator APK can exercise the app, authentication, photo selection, and AI
flows. Google Play Billing must be tested with a build installed from a Play
testing track using a licensed tester account.

## Create the Google Play Console app

1. Enroll at Google Play Console and finish identity verification.
2. Choose an account type:
   - **Organization** is appropriate when publishing as a registered business
     and requires a D-U-N-S number.
   - **Personal** is simpler when publishing as an individual. New personal
     accounts may have additional production-access testing requirements.
3. Create an app with these starting values:
   - App name: **Inchmeal**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free** (the app can still sell subscriptions)
4. Confirm that the package name on the first uploaded bundle is
   `app.inchmeal`.

Suggested listing and policy values:

- Category: **Productivity**
- Ads: **No**
- Target audience: **Adults / 18 and over**
- Privacy policy: `https://unbig.app/privacy-policy`
- Support: `https://unbig.app/support`
- Support email: `contact@unbig.app`

Prepare at least a 512 × 512 app icon, a 1024 × 500 feature graphic, two phone
screenshots, a short description, and a full description. Complete App access,
Ads, Content rating, Target audience, News apps, Data safety, and any other
required declarations shown in Play Console.

## Data safety working notes

Treat these as a checklist, not as a substitute for answering the Play form
from the behavior of the final production build. Inchmeal may process:

- account identifiers, name, and email for sign-in and account management;
- project descriptions, notes, and selected photos for core app and AI features;
- subscription and purchase status for paid access; and
- diagnostics, server logs, and basic device/app information for reliability.

Relevant processors include Google sign-in and AI services, RevenueCat, Vercel,
Neon, Apple, and Google Play as described in the privacy policy. Confirm each
data type's collection, sharing, purpose, retention, encryption-in-transit, and
deletion answers immediately before submission. The developer is responsible
for the accuracy of this declaration, including behavior of third-party SDKs.

## Configure Android subscriptions

The Android RevenueCat public SDK key is not configured yet. Until it is,
Inchmeal intentionally treats purchases as unavailable and does not enforce the
paywall on Android.

1. Upload a signed AAB to an internal Play testing track so Google Play knows
   the package and signing identity.
2. In Play Console, create the Android subscription and base plan matching the
   intended Inchmeal Pro pricing.
3. Create and authorize a Google Cloud service account for Google Play billing
   access, then connect it to RevenueCat.
4. In RevenueCat, add the Android app with package `app.inchmeal`, import the
   Play product, and attach it to the existing `inchmeal_pro` entitlement and
   current offering.
5. Copy RevenueCat's Android **public SDK key** into the EAS development and
   production environments as `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
6. Build again and test purchasing, restoring, cancellation/expiration, and
   entitlement refresh using a Play-licensed tester account.

Never put a RevenueCat secret key or Google service-account JSON in an
`EXPO_PUBLIC_` variable or commit either credential to git.

## Build and release to internal testing

Create the production AAB:

```sh
cd mobile
npx eas build --platform android --profile production
```

For the first release, create the app in Play Console and manually upload the
AAB to **Testing → Internal testing**. Keep the release in draft until the store
listing and required declarations are complete. Add internal testers, publish
the testing release, and install it using the tester opt-in link.

After Play Console and EAS Submit service-account access are configured, future
draft internal submissions can use:

```sh
npx eas submit --platform android --profile production --latest
```

The repository deliberately defaults Android submissions to the internal track
with draft status. Promoting a tested release to closed, open, or production is
a separate Play Console decision.

## Release checklist

- [ ] Finalize Play Console account type and verification
- [ ] Create the `app.inchmeal` Play Console app
- [ ] Complete store listing and policy declarations
- [ ] Upload the first production AAB to internal testing
- [ ] Configure Google Play subscription and base plan
- [ ] Connect Google Play billing credentials to RevenueCat
- [ ] Add `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` to EAS environments
- [ ] Test sign-in, project creation, photos, AI feedback, purchases, and restore
- [ ] Test account deletion and subscription-management links
- [ ] Complete any required closed test before requesting production access
- [ ] Promote only the tested build to production
