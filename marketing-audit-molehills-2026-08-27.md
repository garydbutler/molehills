# Marketing Audit — molehills.app (landing page)
2026-08-27 · Overall score: **62/100** · Coverage: 6/6 dimensions inspected (100%)
Basis: full source of `web/src/app/page.tsx`, `layout.tsx`, and the hero/phone/before-after/waitlist components; the page rendered locally at 800×450; the repo's public assets and SEO surface. No `brand-context.md` existed, so positioning judgements are inferred from the page itself — see *What I couldn't determine*.

> These scores are marketing-judgement heuristics, not measured conversion data and not anyone's ranking data. They exist to rank fixes, not to be a grade. This is your own site, so the report is written as a direct fix-list.

---

## The one thing

**The design is doing the persuading that the words should be doing.** Visually this is a top-decile page — the editorial "field guide" concept, the sage/ivory restraint, the hand-drawn glyphs, the interactive phone demo — and it makes an unlaunched product feel real. But the single most important job of a landing page, telling a stranger in five seconds *what this is, who it's for, and why it's different*, is deferred below the fold and shrunk into 11px microcopy. The headline "Big things, finished gently." is a mood, not a value proposition. The paragraph that actually explains the product (photograph the mess → a 12-step plan → three gentle steps a day → re-photograph to prove it's done) is excellent — it's just in the wrong place. Nearly every leak below traces to the same root: at each high-leverage moment (headline, eyebrow, CTA, the social-share tags, the signup success screen) the page reaches for atmosphere instead of the specific, genuinely-interesting, contrarian thing the product does. The fix is not a redesign. The design is the asset. The fix is to let the words be as specific as the product already is.

---

## Scorecard

| Dimension | Score | Weight | Weighted | Verdict |
|---|---|---|---|---|
| Messaging & positioning | 60 | 25% | 15.0 | Coherent and differentiated — but the headline makes the reader scroll to learn what it even is. |
| Conversion | 72 | 20% | 14.4 | One clean action, low friction, real objection-handling; generic CTA copy, no social proof or launch date. |
| Search & discoverability | 58 | 20% | 11.6 | Good structure and meta description; no OG image, no robots/sitemap, and a too-long brand-led title. |
| Competitive position | 70 | 15% | 10.5 | A genuinely contrarian stance vs. streak/gamified apps — stated implicitly rather than out loud. |
| Trust & credibility | 52 | 10% | 5.2 | Craft *is* the trust signal; proof is near-zero and Privacy/Terms are dead links. |
| Growth & retention | 55 | 10% | 5.5 | The waitlist works, but "You're on the list." is a dead end that throws away every share. |
| **Total** | **62** | | **62.2** | Above the median site (55–70). Design lifts it; the value-prop and proof gaps hold it down. |

---

## Fix these first

### 1. Make the hero pass the 5-second test — without touching the type treatment
**Why:** "Big things, finished gently." names neither the audience nor the outcome, so a stranger can't say what this is until they scroll to the lead paragraph. The audience ("The ADHD-friendly companion") is real but hidden in 11px topbar text. This one gap is what caps the messaging score at 60 and is the highest-leverage change on the page.
**What to change it to:** Keep the H1 as the emotional hook. Replace the eyebrow (currently *"A calmer way to get things done"*) with a line that carries the who + what, and/or add a short bold deck under the H1 that is visible above the fold:

> **Eyebrow:** An ADHD-friendly app for the tasks that feel too big to start
> **H1 (unchanged):** Big things, finished *gently*.
> **Deck (new, above the fold):** Photograph the mess. Molehill turns it into a 12-step plan and hands you three small steps a day — no streaks, no timers, no guilt.

Effort: **S** · Confidence: **High**

### 2. Add OpenGraph + Twitter metadata and an OG image
**Why:** `layout.tsx` has only `title` and `description`. Every time this link is shared — iMessage, Slack, an ADHD subreddit, a founder's tweet — it renders as a bare grey link with no title card and no image. For a pre-launch product whose entire growth engine is word-of-mouth, this is the highest-ROI technical fix on the page.
**What to change it to** (drop into `web/src/app/layout.tsx`):

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://molehills.app"),
  title: "An ADHD-friendly app for tasks that feel too big | Molehill",
  description:
    "Molehill turns a photo of whatever feels like a mountain into a 12-step plan, then walks you there three tiny steps a day. No streaks, no timers, no guilt.",
  openGraph: {
    title: "Molehill — big things, finished gently",
    description:
      "Photograph the task that feels too big. Molehill turns it into three small steps a day.",
    url: "https://molehills.app",
    siteName: "Molehill",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Molehill — big things, finished gently" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Molehill — big things, finished gently",
    description:
      "Photograph the task that feels too big. Molehill turns it into three small steps a day.",
    images: ["/og.png"],
  },
};
```
You already have the hero art to build a 1200×630 `og.png` from. Effort: **S** · Confidence: **High**

### 3. Turn the waitlist success screen into a share prompt
**Why:** In `WaitlistForm.tsx`, the `done` state says "You're on the list." and stops. That is the single highest-intent moment on the whole page — someone just raised their hand — and it captures none of it. Waitlists compound through referral; this one has no referral surface at all.
**What to change it to:** Replace the dead end with expectation-setting + a one-tap share:

> **You're on the list.**
> We'll email you the moment Molehill is ready to try — one email, that's it.
> Know someone the "too big to start" feeling follows around? **Send them molehills.app** — [Copy link]

A `navigator.share()` / copy-to-clipboard button is a few lines. Effort: **S** · Confidence: **Med-High**

### 4. Fix the dead Privacy / Terms / Accessibility links
**Why:** All three (`page.tsx` lines 555–557) point to `#top`. You are collecting email addresses; a link labelled "Privacy" that bounces the reader back to the top of the page reads as unfinished and is a genuine trust (and arguably compliance) smell for a form that takes personal data.
**What to change it to:** Even a single static `/privacy` page with one honest paragraph ("we store your email to tell you when Molehill launches; we don't share or sell it; reply to unsubscribe") beats a dead anchor. The form's fine print already makes the promise — give it a page to land on. Effort: **S** · Confidence: **High**

### 5. Shorten and re-order the title tag for search
**Why:** The current title — *"Molehill — Big things, finished gently. A calm companion for overwhelming tasks."* — is ~80 characters (truncates near 60) and front-loads an unknown pre-launch brand name nobody is searching for yet, pushing the searchable concept ("ADHD," "overwhelming tasks") past the cut-off.
**What to change it to:** `An ADHD-friendly app for tasks that feel too big | Molehill` (~59 chars — concept first, brand last). This is folded into the fix #2 metadata block above. Effort: **S** · Confidence: **Med**

---

## What's already working

*(Never skipped — and here it's substantial.)*

1. **The design system is top-decile.** The "Vol. 01 / field guide" editorial concept, the restrained sage-and-ivory palette, the Playfair + Inter pairing, the in-page hand-drawn SVG glyphs and side rails — it's coherent, current, and it makes an unlaunched product feel trustworthy and real. This is a genuine competitive asset. Protect it; every fix above is additive to it, not a replacement for it.
2. **The positioning is genuinely differentiated and internally consistent.** "0 streaks, timers, or guilt trips" stakes a contrarian claim against the entire gamified-productivity category, and *every* section holds the line — "rest is allowed," "stopping now is fine," "three steps, then rest." Most pages can't keep one promise; this one keeps a hard one all the way down.
3. **The interactive phone demo and before/after slider.** Letting the visitor tap the three tasks and watch the ring fill is interaction-as-investment, and it demonstrates the "three steps then done" mechanic better than any paragraph could. Strong instinct — keep it, and swap in real product screenshots at launch (see trust findings).
4. **Objection pre-emption woven through the copy.** "Don't tidy first," "Skip the picture if you like," "no rush," "the rest can wait" — the page anticipates the ADHD user's shame, pressure, and perfectionism triggers and defuses them in the reader's own voice. That empathy is rare and it's doing real conversion work.

---

## Full findings by dimension

### 1. Messaging & positioning — 60/100 *(capped at 60: headline names neither audience nor outcome)*
- **Fail — 5-second test.** Headline + eyebrow are both atmosphere ("Big things, finished gently" / "A calmer way to get things done"). The what/who/why lives below the fold and in topbar microcopy. → Fix #1.
- **Pass — differentiation.** "0 streaks, timers, or guilt trips" and the photo-verify loop are things competitors can't claim. Strong.
- **Pass — consistency.** Headline, sub-head, CTA, principles, and the phone demo all argue the same single idea. Best-in-class here.
- **Missed opportunity — the name.** "Make a mountain out of a molehill," inverted, is the entire brand idea and it's never stated on the page. One line ("We turn your mountains into molehills") would make the name earn itself.

### 2. Conversion — 72/100
- **Pass — CTA hierarchy.** One primary action ("Join the waitlist"), visually dominant green fill, repeated in nav / hero / topbar / final panel. The sticky nav CTA keeps a primary action above the fold on every viewport, so the "no CTA above the fold" cap does **not** apply.
- **Pass — friction.** Single email field for a free waitlist. Correct.
- **Pass — objection handling & risk reversal.** Objections defused throughout; the form's "One email when it launches. We won't use your address for anything else." is a well-placed reassurance.
- **Fail — no social proof or launch timing.** No waitlist count, no launch window beyond "coming soon." Even "launching early 2026" would lift urgency. Do **not** fabricate a signup count — if you have a real one, show it; otherwise anchor on a date. → related to Growth.
- **Weak — CTA wording.** "Join the waitlist" names the mechanic, not the value. Worth A/B testing "Get early access →" on the hero primary (nav can stay literal).

### 3. Search & discoverability — 58/100
- **Pass — meta description.** Written for a click, names the mechanic and the ADHD audience. Good.
- **Pass — semantic structure.** One H1, logical H2/H3 hierarchy, skip link, aria-labels. Clean.
- **Fail — social/share metadata.** No OpenGraph, no Twitter card, no OG image. → Fix #2.
- **Fail — crawl surface.** No `robots.txt`, no `sitemap.xml`, no web manifest. In Next these are trivial `app/robots.ts` and `app/sitemap.ts` files.
- **Weak — title tag.** Too long, brand-led. → Fix #5.
- **Note — performance/LCP.** The hero, vision, before, and after images are ~1.7 MB PNGs each, loaded via plain `<img>` with the Next image lint rule disabled. `hero.png` is your LCP element. This hurts both perceived speed and Core Web Vitals (an SEO input). Compress/serve responsive sizes or use `next/image`. Confidence: from code inspection, not a live Lighthouse run. Effort: **S–M**.
- **Note — citability (GEO).** Pure brand page, no extractable facts or FAQ for AI search to cite. Expected pre-launch; flagged for later. The `geo.md` module goes deeper if you want it.

### 4. Competitive position — 70/100
- **Pass — defensibility.** The photo-in / photo-verify loop and the "gentle, three-max, rest is allowed" stance are hard to copy and point straight at the open flank of the gamified-productivity category. No "everyone says the same thing" cap applies here — you say the opposite, which is the point.
- **Weak — category framing is implicit.** The contrast with streak apps lives only in the stats row ("0 streaks…"). A visitor coming from Habitica/Finch/Todoist would convert harder if the page named the contrast once, plainly ("Built for the days streaks make worse").
- **N/A — switching story.** No installed base to migrate pre-launch. Not scored against you.

### 5. Trust & credibility — 52/100
- **Pass — design signals.** Consistent, current, crafted, zero broken elements. The craft itself is the strongest trust asset you have right now.
- **Fail — proof density.** No testimonials, user count, press, or founder note. Much of this is expected pre-launch (see calibration) — but a short lived-experience founder note ("why someone with ADHD is building this") is available today and would be disproportionately persuasive to this audience.
- **Fail — dead legal links.** Privacy/Terms/Accessibility → `#top`, on a page that collects email. → Fix #4.
- **Note — illustrative, not real.** The phone screen and before/after are CSS mockups over placeholder images, not real app screenshots. Fine for now; swapping in real captures at launch will materially lift this dimension.

### 6. Growth & retention — 55/100
- **N/A — pricing.** No price to show pre-launch; correctly absent. Not penalized.
- **Fail — no referral loop.** Single funnel, single entry point, and the success state is a dead end. → Fix #3 is the highest-leverage growth move on the page.
- **Pass — list hygiene.** Double opt-in confirmation (the `emailed` path) is in place. Good.
- **Weak — single acquisition surface.** No lightweight lead magnet or shareable resource. Not urgent pre-launch, but the share prompt in Fix #3 is the cheap first step.

---

## Appendix: lower-priority items

- **Brand-name capitalisation drift.** Product is "Molehill" (singular), domain is "molehills.app" (plural), footer renders "MoleHills.app" (camel). Pick one lockup for the domain wordmark.
- **Meaningful images marked decorative.** `hero.png` / `vision.png` carry `alt=""`. Defensible (captions nearby) but borderline for the hero, which conveys the product's "calm room" outcome.
- **Fine-print whitespace.** `page.tsx:504` and `:531` have stray leading whitespace inside the JSX text — cosmetic, verify it renders clean.
- **Add a web manifest + favicon set** if not already present elsewhere — matters once people save the link on mobile.

---

## What I couldn't determine

- **No `brand-context.md`**, so ICP, positioning guardrails, tone rules, and any real proof points are inferred from the page. If you'd like, I can generate a `brand-context.md` from this audit so every future copy/GEO/ads pass is contextualised instead of re-inferred.
- **Live performance** (Lighthouse/CWV) was not measured — the image-weight finding is from code inspection.
- **Real signup/waitlist numbers** — unknown, so no social-proof number is asserted anywhere above. If a real count exists, it belongs on the page.
- **Analytics / attribution** — not in scope of a landing-page audit; not inspected.

---

### Suggested next step
Findings #1, #3, and #5 are pure copy — the `copy.md` module can generate and panel-score a wider set of hero/eyebrow/deck and CTA variants than the single replacements written here. Findings #2 and #4 are code changes ready to implement as written.
