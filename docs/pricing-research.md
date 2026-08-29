# Inchmeal pricing recommendation

_Research date: 2026-08-29. Currency: USD. Current vendor prices can change; re-check the linked primary sources before launch._

## Recommendation

Launch one paid tier, **Inchmeal Full**, at **$5.99/month or $39.99/year**. Keep the existing three successful AI-created projects as the free allowance. Do not offer a lifetime purchase because the product has recurring AI costs.

| | Free | Inchmeal Full |
|---|---:|---:|
| Price | $0 | $5.99 monthly or $39.99 yearly |
| AI-created projects | 3 lifetime | Up to 12 new plans per rolling 30 days |
| Active projects | Up to 3 | Up to 10 |
| Completed/archived projects | Kept indefinitely | Kept indefinitely |
| Finished-state image | One per photo-based project | One per photo-based project |
| Progress checks | Core loop included | Core loop included |

The 12-plan monthly guardrail is deliberately generous: an ordinary 12-step project takes about four successful days at three steps per day, so a focused user would normally finish roughly seven projects in a 30-day month. Market the product as generous, not “unlimited.” A finite limit protects against automation and account sharing without constraining normal use.

The annual offer is the primary package: $39.99/year is $3.33/month effective and a 44% discount to month-to-month. The monthly option is there for people who do not want a long commitment. The three-project free allowance is already a better product trial than a seven-day auto-renewing trial, because someone can experience the full multi-day loop without a clock running.

An acceptable higher-price experiment after retention is known would be **$6.99/month and $49.99/year**. I would not launch at the currently configured Test Store prices of **$9.99/month and $79.99/year** ([local setup evidence](../mobile/SUBSCRIPTIONS_SETUP.md#L5)): those prices place a narrow, early consumer app above the closest ADHD/task-planning products before Inchmeal has established enough differentiated value.

## What the product currently meters

- A free user gets **three successful plan generations**, stored locally on the installation ([`FREE_PLAN_ALLOWANCE = 3`](../mobile/src/lib/purchases.ts#L32)). Failed plan requests do not consume an allowance, and projects already created remain usable ([subscription setup](../mobile/SUBSCRIPTIONS_SETUP.md#L28)).
- The paywall promises subscribers “as many plans as you need,” while store products and prices are loaded dynamically through RevenueCat ([paywall](../mobile/src/app/paywall.tsx#L85)).
- A plan is one synchronous `gemini-3.1-flash-lite` request, optionally with one image, and is capped at 2,048 output tokens ([plan route](../web/src/app/api/plan/route.ts#L165)).
- The optional “Show me the end state” action makes a separate `gemini-3.1-flash-lite-image` image-generation request and caches its result on the project ([end-state UI](../mobile/src/app/vision/%5Bid%5D.tsx#L47), [route](../web/src/app/api/end-state/route.ts#L95)).
- Every recapture attempt makes another `gemini-3.1-flash-lite` request. A photo project sends both the original and current images; a words-based project sends text only ([recapture route](../web/src/app/api/recapture/route.ts#L197)). The client currently permits up to **10 attempts per project per day** ([store](../mobile/src/store/app-store.tsx#L100)).

Therefore, the comment that plan generation is the only metered cost is not true operationally. It is the only currently **paywalled** action, but end-state images and progress checks also incur Gemini charges.

## Current Gemini rates

The exact models in the repository are `gemini-3.1-flash-lite` for plans and recaptures and `gemini-3.1-flash-lite-image` for finished-state images. Both use synchronous `generateContent`, so Standard pricing applies.

Google's current [official Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) lists:

| Model | Input | Text/thinking output | Image output |
|---|---:|---:|---:|
| `gemini-3.1-flash-lite` | $0.25 / 1M text, image, or video tokens | $1.50 / 1M tokens | n/a |
| `gemini-3.1-flash-lite-image` | $0.25 / 1M text, image, or video tokens | $1.50 / 1M tokens | $30 / 1M image tokens, equal to **$0.0336 per 1K image** |

The image model supports only 1K output, according to its [official model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-image). Google's [token documentation](https://ai.google.dev/gemini-api/docs/tokens) notes that every modality is tokenized, that text averages about four characters per token, and that exact request input can be measured with `count_tokens`. Paid-tier rates are the correct basis for the business model: the pricing page says paid-tier prompts are not used to improve Google's products, whereas free-tier prompts may be. That distinction matters for customer photos.

## Estimated AI cost per project

These estimates use paid Standard rates, not free-tier credits. They are estimates because the application does not yet record `usage_metadata`, and the mobile client compresses JPEG quality but does not cap pixel dimensions. Exact cost depends on photo resolution, model thinking tokens, and response length.

### Per-call assumptions

| Call | Typical token assumption | Typical cost | Sensitivity range |
|---|---|---:|---:|
| Create plan | 2,400 input tokens including prompt/schema/photo; 550 output | **$0.0014** | $0.0008–$0.0033 |
| Photo recapture | 3,300 input tokens including two images; 150 output | **$0.0011** | $0.0005 text-only to $0.0030 high-resolution photo |
| Finished-state image | 2,500 input; 500 text/thinking output; one 1K image | **$0.0350** | $0.0340–$0.0379 |

Formula: `input tokens × $0.25 / 1,000,000 + text/thinking output × $1.50 / 1,000,000`, plus `$0.0336` when an image is generated. The plan route's configured 2,048-token ceiling puts the maximum **plan text output alone** at $0.003072; input is additional.

### Whole-project scenarios

| Scenario | Included use | Estimated Gemini cost |
|---|---|---:|
| Light, words-only | One plan, four successful text checks, no generated image | **~$0.003** |
| Typical photo project | One plan, four photo checks, one generated finished-state image | **~$0.041** |
| Blended typical | Same flow, assuming only half of projects request the optional image | **~$0.023** |
| Retry-heavy four-day project | High-token plan, 10 high-token checks on each of four days, one image | **~$0.159** |

Three free typical photo projects cost about **$0.12** in Gemini usage. Even 12 typical photo projects in a paid month cost about **$0.49**. AI cost therefore does not justify a $9.99 price by itself; the price should reflect user value, support, platform fees, and sustainable product development.

The retry-heavy scenario is not a true lifetime maximum. A project can fail checks on additional days, and the API routes do not authenticate or enforce server-side quotas. CORS is not a billing control because non-browser clients can call an endpoint directly. This is a larger financial risk than ordinary customer usage.

## Store and subscription economics

For conservative launch math, budget **15% of gross sales** for the app store. Apple's [Small Business Program](https://developer.apple.com/app-store/small-business-program/) gives qualifying developers a 15% commission rate on paid apps and IAP. Google Play's current [service-fee documentation](https://support.google.com/googleplay/android-developer/answer/112622) has regional and program-specific rules; automatically renewing subscriptions have historically been 15%, while a new lower-fee system began rolling out in the US, EEA, and UK on June 30, 2026 ([official rollout details](https://support.google.com/googleplay/android-developer/answer/16954621)). Using 15% is a prudent global planning assumption until the actual customer mix is known.

RevenueCat is [free through $2,500 of monthly tracked revenue, then charges 1% of all tracked revenue](https://www.revenuecat.com/pricing). At $5.99/month:

- Gross subscription: $5.99
- Less 15% store fee: $0.90
- Less RevenueCat after its threshold: $0.06
- Available before AI, tax, refunds, infrastructure, and support: **$5.03/month**
- Less 12 typical photo projects: about $0.49
- Contribution before the excluded costs: **about $4.54, or 76% of gross**

At $39.99/year, the same deductions leave about **$33.59 before AI**. A user creating five typical photo projects each month would consume about $2.46/year of Gemini usage, leaving roughly **$31.13, or 78% of gross**, before tax, refunds, infrastructure, and support.

## Relevant consumer benchmarks

These are official product sources, accessed 2026-08-29:

| Product | Why it is relevant | Current US price |
|---|---|---:|
| [Goblin Tools Pro](https://goblin.tools/pro/about) | Closest functional comparison: breaks overwhelming tasks into steps | $3/month on web; one-week trial |
| [Llama Life](https://llamalife.co/adhd-tool-for-adults) | ADHD-oriented tool focused on working through manageable task chunks | $6/month or $39/year; seven-day trial |
| [Structured Pro](https://help.structured.app/en/articles/331330) | Consumer visual day planner with regional pricing | $6.99/month, $29.99/year, or $99.99 lifetime |
| [Todoist](https://www.todoist.com/help/articles/set-up-a-todoist-pro-subscription-PLxdCDaH9) | Mainstream task manager with AI features and a project-limited free plan | $7/month or $60/year; free plan has five projects |

The closest lightweight consumer products cluster between roughly $3 and $7 per month, with annual plans around $30–$60. Inchmeal is more specialized than Todoist and has a distinctive photo-to-plan/visual-progress loop, but it has less breadth than a full planner. **$5.99/month and $39.99/year sits in the credible middle of the direct market.**

## Preconditions before charging customers

1. Move the three-plan allowance from installation-local `AsyncStorage` to an authenticated server-side account counter. As implemented, clearing app data or reinstalling can reset it.
2. Authenticate the plan, end-state, and recapture endpoints. Enforce the paid entitlement and quotas on the server, not only in React Native.
3. Enforce one generated end-state image per project and an account-level ceiling such as 30 recapture calls per day. The existing two-failure manual fallback means users do not need ten costly AI retries to remain unblocked.
4. Record Gemini `usage_metadata` by endpoint and user/account. Replace the estimates above with p50/p90 real costs after beta usage.
5. Update the paywall's “as many plans as you need” promise if a fair-use limit is introduced.

## Launch decision

Use **Free + one Full subscription**, not multiple paid tiers:

- **Free:** three complete projects, with the existing work preserved forever.
- **Full monthly:** $5.99.
- **Full annual:** $39.99; show this first and label the effective $3.33/month plainly.
- **No lifetime plan:** recurring AI and support costs make it structurally mismatched.
- **No separate AI credit packs at launch:** they add anxiety and complexity to an app whose promise is reducing both.

Review pricing after either 100 paying customers or two full renewal cycles. The most useful decision inputs will be free-to-paid conversion, annual-plan share, projects created per paid user, finished-state-image take rate, recapture calls per successful day, and 30/90-day retention. Test the $6.99/$49.99 alternative only if retention demonstrates that Inchmeal has become an ongoing daily companion rather than an occasional project rescue.
