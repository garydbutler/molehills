# Inchmeal conversion and free-user economics

_Research date: 2026-08-29. All figures are directional planning benchmarks, not forecasts. Currency: USD._

## Executive answer

Yes: **most people who sign up will use some AI and never pay**. For a freemium consumer subscription app, a sensible launch expectation is approximately **1–3 paid users per 100 signups within the first 35 days**, with **2.1%** as the broad freemium median and **2.4%** as the median for AI-powered apps in RevenueCat's 2026 data. A strong early target is **4–5%**; RevenueCat's upper-quartile thresholds are above **4.5% for freemium apps** and **4.8% for AI apps**.

Put differently, a 1,000-signup cohort will probably contain roughly **20–25 early payers and 975–980 non-payers** if Inchmeal performs near the median. This sounds alarming, but it is normal. The more useful question is whether the paying minority finances the free majority.

With the current estimated Gemini costs and a $5.99 monthly subscription, the answer is **yes under ordinary usage, but not safely under the most generous plausible free usage**:

- If the average signup consumes one blended-typical project, AI costs about **$23 per 1,000 signups**. Only about **0.51% monthly conversion** is needed to recover that cost.
- If every signup consumes all three blended-typical projects, AI costs about **$69 per 1,000**. Break-even rises to about **1.52%**, still below the 2.1% freemium median.
- If every signup consumes three photo projects and requests a generated finished-state image every time, AI costs about **$123 per 1,000**. Break-even rises to about **2.71%**, above the broad freemium median.

The practical conclusion is not to eliminate the free tier. It is to **meter and measure the expensive generated-image action**, enforce limits on the server, and avoid paid acquisition until real cohort data shows that revenue per signup exceeds both AI cost and acquisition cost.

## Evidence: what comparable subscription apps actually convert

RevenueCat's [State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps) analyzes 2025 performance from more than 115,000 apps, $16 billion in revenue, and over one billion transactions. It includes only apps with active subscription revenue and minimum install or revenue thresholds, so it is a benchmark of operating subscription apps—not a guarantee for a brand-new launch.

### Download/sign-up to paid

RevenueCat publishes download-to-paid conversion, not signup-to-paid conversion. The numbers below are therefore the best available proxy if Inchmeal asks users to create an account near installation. If many downloaders never finish signup, conversion per completed signup will be higher than conversion per download.

| Segment | D35 download-to-paid median | Strong/upper-quartile threshold | Observed range or top end |
|---|---:|---:|---:|
| Freemium access | **2.1%** | **>4.5%** | roughly **0.3%–8.2%** |
| AI-powered apps | **2.4%** | **>4.8%** | top end **8.3%** |
| All apps globally | **2.0%** | — | — |
| Hard paywall access | **10.7%** | **>20.0%** | roughly **4.2%–38.7%** |

The hard-paywall number should not be used as Inchmeal's target: three lifetime AI projects make Inchmeal a freemium product. RevenueCat also reports that freemium and hard-paywall retention is nearly identical after one year; the access model mainly changes how many and how quickly users convert, not how sticky the resulting subscribers are.

RevenueCat reports that more than 60% of conversions happen within one week, but **23% of freemium conversions occur six or more weeks after download**. Inchmeal should therefore report D35 for comparison and also evaluate 8- and 12-week conversion. A three-project allowance may naturally take longer to exhaust than a timed trial.

### Category, platform, and geography

Inchmeal straddles Productivity, Health & Fitness/wellbeing, and AI. No published segment exactly matches an ADHD-oriented photo-to-plan app, so the AI and freemium medians are the least misleading starting point.

| Segment | D35 download-to-paid median | Interpretation for Inchmeal |
|---|---:|---|
| Health & Fitness | **2.9%** | An optimistic adjacent category |
| Business | **2.6%** | Higher-intent utility comparison |
| Gaming | **1.0%** | Low category benchmark |
| Shopping | **1.3%** | Low category benchmark |
| App Store, all categories | **2.6%** | iOS monetizes materially better |
| Google Play, all categories | **0.9%** | Plan for a much lower Android floor |
| North America | **2.8%** | Highest regional median; upper quartile >6.0% |
| Asia-Pacific | **2.4%** | Close to North America at the median |
| Western Europe | approximately **2.0%** | Around global median |
| IN/SEA | **0.7%** | Lowest reported regional median |

These gaps mean that a blended conversion rate can deteriorate as Android or lower-purchasing-power geographies become a larger share of acquisition. Cohorts should always be split by store, country/region, and acquisition channel.

## Evidence versus inference: conversion at the fourth-project paywall

There is no public RevenueCat benchmark specifically for users who have completed three AI-generated projects and then see a fourth-project paywall. RevenueCat defines paywall conversion in its [Paywall Conversion chart documentation](https://www.revenuecat.com/docs/dashboard-and-metrics/charts/paywall-conversion-chart), but it does not publish a universal aggregate rate for this exact engaged cohort.

The following is therefore **an inference**, not industry evidence. If the only meaningful purchase moment is the attempt to create project four, then:

`overall signup-to-paid conversion = share reaching the paywall × paywall-view-to-paid conversion`

| Share of signups reaching project-four paywall | Paywall conversion needed for 2.1% overall | Needed for 2.4% overall | Needed for 4.5% overall |
|---:|---:|---:|---:|
| 10% | 21% | 24% | 45% |
| 20% | 10.5% | 12% | 22.5% |
| 30% | 7% | 8% | 15% |
| 40% | 5.3% | 6% | 11.3% |

This exposes the real funnel risk. If only 5–10% of signups ever want a fourth project, the final paywall must convert exceptionally well. Improving activation and getting more users to finish projects one through three may matter more than polishing the paywall itself.

## Cohort model: 1,000 and 10,000 signups

### Expected payer counts

These figures apply RevenueCat's download-to-paid rates directly to signups for a simple planning model. Actual signup conversion must be measured.

| Performance case | Paid conversion | Payers / 1,000 | Non-payers / 1,000 | Payers / 10,000 | Non-payers / 10,000 |
|---|---:|---:|---:|---:|---:|
| Weak freemium floor | 0.3% | 3 | 997 | 30 | 9,970 |
| Freemium median | 2.1% | 21 | 979 | 210 | 9,790 |
| AI-app median | 2.4% | 24 | 976 | 240 | 9,760 |
| Strong target | 4.5% | 45 | 955 | 450 | 9,550 |
| Freemium observed top end | 8.2% | 82 | 918 | 820 | 9,180 |

### Free AI spend

The cost assumptions come from [Inchmeal pricing recommendation](./pricing-research.md): approximately **$0.0014** for a plan-only call, **$0.023** for a blended-typical project, and **$0.041** for a typical photo project with four progress checks and a generated end-state image.

| Free-use behavior per signup | AI cost/signup | Cost / 1,000 signups | Cost / 10,000 signups |
|---|---:|---:|---:|
| Quick abandon: one plan call only | $0.0014 | $1.40 | $14 |
| One blended-typical project | $0.023 | $23 | $230 |
| All three blended-typical projects | $0.069 | $69 | $690 |
| All three typical photo projects with generated images | $0.123 | $123 | $1,230 |

These are deliberately simple bounds. Real cohorts will be a mixture: many users will abandon after generating one plan; a smaller group will perform progress checks; fewer should request all three end-state images. Because one generated image costs about $0.035, it dominates the variable cost of an otherwise inexpensive project.

### Paid conversion needed merely to cover free AI spend

At $5.99/month, the prior pricing model estimates **$4.54 first-month contribution per monthly payer** after a 15% store fee, eventual 1% RevenueCat fee, and a full paid month's typical AI use. This is conservative and still excludes infrastructure, support, tax, refunds, and acquisition cost.

| Free-use behavior | Monthly payers needed / 1,000 | Break-even conversion | Monthly payers needed / 10,000 |
|---|---:|---:|---:|
| One plan call only | 0.3 (practically 1) | **0.03%** | 3.1 (practically 4) |
| One blended-typical project | 5.1 (practically 6) | **0.51%** | 50.7 (practically 51) |
| Three blended-typical projects | 15.2 (practically 16) | **1.52%** | 152.0 |
| Three typical photo projects | 27.1 (practically 28) | **2.71%** | 270.9 (practically 271) |

At the **2.1% freemium median**, 21 monthly payers contribute about **$95** in their first month per 1,000 signups. That covers the $23 one-project case and the $69 three-blended-project case, but not the $123 all-photo/all-image case. At the **2.4% AI-app median**, 24 monthly payers contribute about **$109**, still slightly below that deliberately expensive $123 case. At **4.5% conversion**, 45 monthly payers contribute about **$204**, covering all four modeled cases.

An annual payer has much stronger upfront economics. The prior pricing model estimates about **$31.13 first-year contribution** on the $39.99 annual plan after store/RevenueCat fees and a year of typical AI usage. If every payer bought annual, free-AI break-even would range from **0.004%** conversion in the one-call case to about **0.40%** in the three-photo-project case. Actual performance will fall between the monthly-only and annual-only bounds according to the plan mix.

This is only **AI break-even**, not business break-even. Paid acquisition can cost orders of magnitude more than the free AI allowance, and infrastructure, support, refunds, taxes, and development are excluded.

## Retention expectations

RevenueCat's 2026 report shows that the first renewal is the biggest loss point:

- Across categories, **53–61% of monthly subscribers make the first renewal**, implying roughly **39–47% churn before month two**. Later renewal rates improve among survivors.
- Only **8% of monthly subscribers remain after 12 months** at the all-app median. For AI-powered apps the 12-month figure is **6.1%** versus 9.5% for non-AI apps.
- Annual plans have an all-app median of **28% retained after one year**. AI-powered apps are lower at **21.1%**.
- Productivity has the lowest reported first annual renewal rate at **23%**. This is important for Inchmeal: goal-oriented users may subscribe to solve an immediate backlog and feel finished before renewal.
- Freemium versus hard-paywall access does not materially change Y1 retention: RevenueCat reports **8% vs. 9%** for monthly and **28% vs. 27%** for annual. Retention must come from recurring product value.

Do not interpret annual retention as proof that annual customers are continuously active. Annual billing secures a year of cash upfront; the low first annual renewal reveals whether users still need the product twelve months later.

## What Inchmeal should plan for

### Base planning case

Until first-party data exists, use this operating assumption rather than a single optimistic forecast:

- **D35 signup-to-paid:** 2–2.5% base; 1% downside; 4.5% strong target.
- **Non-paying share:** approximately 97.5–98% in the base case.
- **Monthly first renewal:** plan around 50–60%; do not assume the subscriber lasts a year.
- **12-month survival:** approximately 6% for monthly and 20–25% for annual, reflecting the AI and Productivity risk factors.
- **Free AI cost:** budget $0.02–$0.07 per signup until measured; treat $0.123 as a stress case.

### Guardrails before scaling

1. **Authenticate and meter every AI call on the server.** The current installation-local allowance can be reset, and unauthenticated endpoints create a larger abuse risk than normal users.
2. **Track the project funnel:** signup → project 1 generated → first sprint/check completed → project 2 → project 3 → fourth-project paywall viewed → purchase.
3. **Record actual Gemini `usage_metadata` and cost by user and endpoint.** Measure p50, p90, and p99 free-user cost—not only the mean.
4. **Consider reserving generated end-state images for paid users, or allowing only one across the entire free allowance.** At about $0.035 each, this action drives most of the free-tier downside while basic plan generation costs fractions of a cent.
5. **Do not buy users until organic cohorts are measured.** A few cents of AI spend per abandoned user is manageable; an acquisition cost layered onto 97–98% non-payers may not be.
6. **Judge the three-project gate after enough time.** Report D35 for industry comparison, but also use 8- and 12-week conversion because freemium conversion has a long tail.

## Decision

The concern is real but bounded. A freemium median cohort can easily look like **979 non-payers supporting 21 payers per 1,000 signups**. Inchmeal's text and planning calls are cheap enough for that ratio. The danger appears when most free users repeatedly invoke generated images, when the endpoints can be abused, or when paid acquisition is introduced before conversion is known.

Keep the three-project free experience for launch, but make the expensive image generation paid or tightly limited. Set **2% D35 conversion as the minimum healthy early benchmark**, **3% as a good product signal**, and **4.5%+ as a strong result**. If conversion stays below approximately **1.5%** while users commonly consume all three blended projects, narrow the free allowance or move the paywall earlier.

## Primary sources

- RevenueCat, [State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps) — dataset methodology, conversion, category, geography, platform, AI, pricing, and retention benchmarks.
- RevenueCat, [Paywall Conversion Chart documentation](https://www.revenuecat.com/docs/dashboard-and-metrics/charts/paywall-conversion-chart) — definition of paywall-view cohorts and conversion windows.
- Google, [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing) — underlying model rates used in the linked unit-economics analysis.
- RevenueCat, [Pricing](https://www.revenuecat.com/pricing) — RevenueCat fee threshold used in the existing pricing model.
- Apple, [App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/) — 15% App Store commission assumption for qualifying developers.

