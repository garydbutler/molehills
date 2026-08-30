# App Store Connect submission sheet

Prepared 29 August 2026 for **Inchmeal 1.0** (`app.inchmeal.mobile`). This is
the source of truth to use while completing the first iOS version in App Store
Connect.

## URLs and contact information

| Field | Value |
| --- | --- |
| Privacy Policy URL | `https://inchmeal.app/privacy-policy` |
| Support URL | `https://inchmeal.app/support` |
| Marketing URL | `https://inchmeal.app` |
| Support email | `hello@molehills.app` |

Publish the web changes before submitting so Apple can open all three URLs
without signing in.

## App Privacy answers

Inchmeal does not track users, sell data, or use third-party advertising. Select
**Data Used to Track You: No**.

The following is the recommended disclosure for data collected by Inchmeal or
its third-party partners. Re-check the wording shown by App Store Connect when
entering it, because Apple occasionally changes the questionnaire labels.

| Apple data type | Collected | Linked to identity | Purpose |
| --- | --- | --- | --- |
| Contact Info → Email Address | Yes | Yes | App Functionality; account access and support |
| Identifiers → User ID | Yes | Yes | App Functionality; sign-in, usage limits, and subscription restoration |
| Purchases → Purchase History | Yes | Yes | App Functionality; paid entitlement and restoration |
| User Content → Photos or Videos | Yes | Yes | App Functionality; AI planning and progress checks |
| User Content → Other User Content | Yes | Yes | App Functionality; descriptions and progress notes |
| Usage Data → Product Interaction | Yes | Yes | App Functionality; free/pro usage-limit enforcement |
| Diagnostics → Other Diagnostic Data | Yes | No | App Functionality; security and troubleshooting logs |

Notes behind these answers:

- Project photos and notes are sent off-device for Gemini processing. Inchmeal's
  server does not retain them, but Google may retain API inputs and outputs for
  up to 55 days for abuse monitoring, so they should be disclosed as collected.
- Project content is not sent to Google with the user's Inchmeal account ID and
  is not stored in Inchmeal's account database. It is nevertheless submitted
  through an authenticated Inchmeal request, so this sheet takes the conservative
  approach and marks the user-content rows **linked**.
- RevenueCat receives the Inchmeal account ID and store transaction/subscription
  data, so User ID and Purchase History are linked.
- A name entered after Apple sign-in and all projects, steps, and progress remain
  on the device. Do not add Name solely for that local data.
- Apple or Google processes payment-card details; Inchmeal and RevenueCat do not
  receive full card details, so do not select Payment Info.
- There is no advertising, cross-app tracking, analytics SDK, contact-list access,
  precise location, health data, or browsing/search history collection.

## Age rating

Answer Apple's content questionnaire truthfully. Inchmeal has no gambling,
sexual content, violence, drugs, profanity, horror, unrestricted web access,
public user-generated content, or medical treatment advice. It does use
generative AI to create task plans, images, and progress assessments; disclose
that capability wherever the current questionnaire asks about AI-generated or
sensitive content.

After App Store Connect calculates the rating, use the **Override to Higher Age
Rating** control and choose **18+**. The Terms, Privacy Policy, and sign-in screen
all set 18 as the minimum age, so the store rating must not be lower.

## Screenshots

The app currently supports iPhone and iPad, so prepare both sets:

- **iPhone 6.9-inch:** portrait screenshots at one accepted highest-resolution
  size, preferably `1320 × 2868` from a supported simulator.
- **iPad 13-inch:** portrait screenshots at `2064 × 2752` or `2048 × 2732`.
- App Store Connect accepts 1–10 screenshots per device class. Use six for a
  clear first submission.

Capture the same story on both device classes using fictional, non-sensitive
sample content:

1. **What feels too big?** — capture screen with the photo and sentence choices.
2. **A plan that starts small** — generated project overview and first three steps.
3. **Only today, not everything** — Today screen with no more than three actions.
4. **Show what changed** — end-of-day photo or sentence progress flow.
5. **See how far you've come** — Journey/history with visible progress.
6. **Little and often** — a reassuring completed-day or project state.

Do not use the login screen as a primary screenshot. Avoid real names, emails,
homes, documents, faces, or account information. Screenshots should show the app
in use, and any captions added around them must match the actual interface.

## Subscription review details

The first auto-renewable subscriptions must be selected in the **In-App
Purchases and Subscriptions** section of the first app-version submission:

| Product | Product ID | Duration | US price |
| --- | --- | --- | --- |
| Inchmeal Monthly | `inchmeal.full.monthly` | 1 month | $5.99 |
| Inchmeal Annual | `inchmeal.full.annual` | 1 year | $39.99 |

For App Review notes, explain:

> New accounts receive three free plan generations. After those are used, open
> Capture and attempt to build another plan to display the subscription screen.
> Restore Purchases is also available from Settings. Existing projects remain
> usable without a subscription. Sign in with Apple and Sign in with Google are
> supported.

Provide Apple with a working review account or a precise Sign in with Apple path,
and make sure the submitted build uses the production RevenueCat `appl_` public
SDK key. Select both subscriptions with the app version before pressing Submit
for Review.

## Before upload

- Deploy and manually open the Privacy, Terms, and Support URLs.
- Capture and upload both iPhone and iPad screenshot sets.
- Complete App Privacy using the table above.
- Complete the age questionnaire and apply the 18+ override.
- Add description, keywords, category, copyright, review contact, and review notes.
- Attach both subscription products to version 1.0.
- Build the production archive with EAS, upload it, and wait for processing.
- Add App Store Connect users as internal TestFlight testers and verify sign-in,
  plan generation, paywall, purchase, restore, cancellation/lapse, and account
  deletion on the processed build.
