# Marketing Audit — unbig.app
2026-09-03 · Overall score: **72/100** · Coverage: 100% (full source inspected) · Own-site, pre-launch waitlist

> All scores are marketing-judgement heuristics, not measured performance. `brand-context.md` is stale (it still names the product "Inchmeal"); this audit uses the live page ("Unbig").

## The one thing

The page is written and designed better than it is *trusted*, and it asks in a voice it has forbidden itself. Every section nails **what Unbig does** — the headline names the mechanism and the "never a fourth" wedge, the demo phone actually demonstrates it — but nothing on the page shows **who is behind it**, and the loudest element, the primary hero button, says *"Get started for free"* on a product that doesn't exist yet. That one line is the exact hype register the brand explicitly bans ("never hyped or urgent"), and it sets up an anticlimax: a stranger clicks expecting an app and lands on an email box. Close the gap in both directions — make the ask honest, and add the single proof asset you're actually allowed to have pre-launch (a founder's lived-experience note) — and this jumps from a pretty waitlist page to a convincing one. The copy work is largely done; the credibility work has barely started.

## Scorecard

| Dimension | Score | Weight | Contribution | Verdict |
|---|---|---|---|---|
| Messaging & positioning | 82 | 25% | 20.5 | Strong, specific, on-brand — one CTA line breaks voice |
| Conversion | 75 | 20% | 15.0 | Excellent form UX; primary CTA overpromises vs. reality |
| Search & discoverability | 70 | 20% | 14.0 | Clean metadata/headings; no structured data, no extractable FAQ |
| Competitive position | 66 | 15% | 9.9 | Anti-streak framing is differentiated but never made explicit |
| Trust & credibility | 64 | 10% | 6.4 | Polished + honest, but zero human proof; legal pages now live |
| Growth & retention | 64 | 10% | 6.4 | Nice share loop; "free" claim with no model, homepage-only |
| **Total** | **72** | | **72.2** | Functional-strong; two free fixes lift it fast |

## Fix these first

**1. Change the hero CTA — it overpromises and breaks your own voice.** `page.tsx:108`
"Get started for free →" implies a usable product; clicking scrolls to an email box. It's also the one hyped line on an anti-hype page. Match the reality and the waitlist button below it.
→ Replace with **`Get early access →`** (and drop the "for free" — you haven't set pricing, so "free" is an unbacked claim; see #5).
Effort **S** · Confidence **H**

**2. Add a founder note — the only proof you're allowed to ship right now.** New section, before `#waitlist`.
Pre-launch you have no users, logos, or numbers, and inventing them is off-limits — but a first-person "why someone with ADHD is building this" needs no permission and is the strongest trust signal available. It also earns the ADHD claim you make in the headline. Scaffold (fill the brackets — do not ship placeholders):
> **Why I'm building Unbig**
> "[One honest sentence about your own pile / the task you couldn't start]. Every app I tried answered that with a streak, and a streak just gave me one more thing to fail at. So I built the opposite: [one line on the three-steps-then-rest idea]. — [Name], building Unbig"
Effort **M** (needs your words) · Confidence **H**

**3. Unify the brand casing — "Unbig" vs "UNBIG" appears on the same site.** `layout.tsx:33-57`, `WaitlistForm.tsx:47`
Body, header, and footer use **Unbig**; the `<title>`, OpenGraph, Twitter card, and the waitlist success message use **UNBIG**. Mixed casing reads as unfinished. Pick one (the logo/body use title case → standardize on **Unbig**) and fix the metadata + waitlist strings.
Effort **S** · Confidence **H**

**4. Add JSON-LD structured data — you have none, and it's what AI search cites.** `layout.tsx`
No `SoftwareApplication` or `Organization` schema exists, so ChatGPT/Perplexity/AI Overviews have nothing structured to extract when someone asks "gentle ADHD task app." Ready-to-paste block in the companion file below.
Effort **S** · Confidence **M**

**5. Add a short FAQ section — answers your top objections *and* feeds AEO.** New section.
Four questions a skeptic asks and an engine can quote: *Is Unbig free? When does it launch? Does it diagnose or treat ADHD? Do you see my photos?* You already answer the last one beautifully in-body ("nobody's business… we never ask to see the work itself") — promote it. Pair with `FAQPage` JSON-LD (in the companion file). This also resolves the "free with no pricing model" gap: state the actual plan or say "free to start."
Effort **M** · Confidence **M**

## What's already working

- **The headline earns its keep.** "Show it the task you can't start. It hands you three small steps a day — never a fourth." Names the mechanism, the outcome, and the differentiator in one breath. Don't touch it.
- **The interactive phone demo (`PhoneToday`) shows instead of tells.** Tapping steps, the filling ring, "Rough day? Ask for just one" — it makes the "three then rest" promise tangible. Rare on a pre-launch page.
- **Form + privacy honesty is textbook.** One field, hidden accessible label, "One email when it launches. We won't use your address for anything else," plus a post-signup share loop. Low friction, honest, and it seeds referral.
- **Voice and design are genuinely consistent** — the editorial "Why Unbig exists" and principles blockquote read as one calm authorial hand. This is the moat competitors can't copy cheaply.
- **Legal pages are live.** Privacy / Terms / Support all resolve (the previous audit flagged these as dead links) — that unblocks honest email collection.

## Full findings by dimension

**Messaging (82).** Strongest dimension. Passes the 5-second test, names the ADHD audience in the subhead, differentiates on "never a fourth / zero streaks." Only drag: the hero "it" leans on the banner image for its antecedent, and the "Get started for free" CTA argues something the rest of the page doesn't.

**Conversion (75).** Single dominant CTA, one-field form, risk reassurance adjacent to the ask, an objection pre-handled well ("Don't tidy first"). Held back by the CTA/reality mismatch (#1) and the absence of any human/proof element near the form.

**Search (70).** Title tag is tight and front-loaded (~50 chars); meta description is click-written; OG/Twitter images present; clean single-H1 hierarchy; SSR content; sitemap + robots correct. Gaps: no structured data (#4), no extractable Q&A (#5), and — unavoidable pre-launch — a single thin page to index.

**Competitive (66).** "Every other app answers that with a streak. We answer it with a smaller step" is a sharp, repeated jab, and the positioning is clearly *against* gamified habit apps. But there's no explicit comparison (Goblin Tools, Finch, habit trackers) and no category label a buyer would search. Fine for a waitlist; a gap at launch.

**Trust (64).** Design signals are high and the honesty (no fabricated proof) is on-brand. The ceiling is the total absence of a human — no founder, no face, no story (#2). Legal transparency surface is now complete.

**Growth (64).** The post-signup share links are a smart, low-cost acquisition loop. "Get started for free" is the only pricing signal and it's unbacked; there's no pricing anchor a buyer can self-qualify against. Homepage is the only entry point.

## What I couldn't determine

- **Real waitlist size / any performance data** — none on page, and none should be fabricated. Can't validate whether traffic is converting; only the static funnel is assessed here.
- **Whether "free" is the actual model** or a placeholder. Drives both #1 and #5.
- **What the wordmark banner image actually renders** (audited from source + alt text; I didn't view the live pixels). If you want, I can spin up the dev server and screenshot the real hero, mobile layout, and dark waitlist section to confirm the visual read.
- **The competitor set you actually benchmark against** — `brand-context.md`'s list is inferred and now stale.

## Housekeeping (non-marketing, spotted in passing)
- `WaitlistForm.tsx` still uses the legacy localStorage key `molehill-waitlisted` and copy references across the app mix old/new names — harmless to users, worth a sweep with the casing fix (#3).
- `brand-context.md` should be refreshed to "Unbig" so the rest of the marketing-os pack stops working from the old identity.
