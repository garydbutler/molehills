# Copy — molehills.app landing page
2026-08-27 · Works the copy findings from `marketing-audit-molehills-2026-08-27.md` (#1 hero, #3 success screen, #5 title, plus the CTA-wording, category-contrast, and brand-name notes). Generated against `brand-context.md`.

Method: 16 hero variants generated across angles → scored on the 5-perspective panel (skeptic / stranger / competitor / buyer / editor, 20 each) → every survivor run through the slop-pattern catalogue. Copy leads; reasoning follows. Nothing below invents a number, a testimonial, or a signup count.

---

# 1 · Hero  *(audit fix #1 — the highest-leverage change on the page)*

Structure: keep the H1 as the emotional hook, replace the atmosphere-only eyebrow, and add a short **deck** the reader sees without scrolling. That's what makes the existing H1 pass the 5-second test.

## Recommended

> **Eyebrow:** The ADHD-friendly app for tasks too big to start
> **H1 (unchanged):** Big things, finished *gently*.
> **Deck (new, above the fold):** Photograph whatever you're avoiding. Molehill turns it into a plan and gives you three small steps a day — never a fourth.

**Score: 90/100**

| Panel | Score | Read |
|---|---|---|
| Skeptic | 18 | Every claim is concrete and falsifiable. "Never a fourth" is a specific, checkable promise, not a superlative. |
| Stranger | 18 | Cold, in 3 seconds: who (ADHD / stuck), what (photo → plan → 3 a day), why different (the cap). |
| Competitor | 17 | "Photograph it → three a day → never a fourth" is the mechanism + the anti-streak stance. A rival can't reuse it. |
| Buyer | 18 | "Too big to start" is the 2am feeling; "never a fourth" answers the fear that this is one more demanding app. |
| Editor | 19 | Two sentences, uneven length, zero slop. "Never a fourth" carries the whole "rest is allowed" position in three words. |

Why this one: it does the audience + mechanism + differentiator job above the fold **and** protects the existing type treatment and voice. "Never a fourth" is the ownable phrase in the set — it encodes the three-steps-then-rest principle without a tricolon or a slogan.

## Runners-up

**M — mechanism, tightest (leads with the photo-verify wedge). 88/100**
> **Eyebrow:** The ADHD-friendly app for overwhelming tasks
> **Deck:** Photograph it. Get three small steps a day. Finish by photographing it again.
Pick this when you want the photo-in/photo-out loop — your most defensible feature — front and centre. Slightly higher cold-read cost: "photograph it again" needs one beat to click.

**H — objection-first. 84/100**
> **Eyebrow:** No streaks. No timers. No guilt.
> **Deck:** Just a photo of the thing you're avoiding, turned into three small steps a day — and permission to stop when they're done.
Pick this for **paid traffic from burned streak-app users** (Habitica/Finch/Streaks lookalikes) — it leads with the thing they're fleeing. The eyebrow is a deliberate tricolon; it echoes the page's existing "0 streaks, timers, guilt trips," so it reads as house style, not a tell.

**E — makes the brand name earn itself. 82/100**
> **Eyebrow:** Mountains into molehills, three steps at a time
> **Deck:** Photograph whatever feels too big. Molehill turns it into a plan of small steps and gives you three a day — the rest can wait.
Pick this if brand-name recall matters more than the 5-second what-is-it (it trades a little clarity for the metaphor that names you).

*(Also cleared the panel: "mechanism-forward" 87, "insider/no-obvious-next-step" 83. Cut below 70: the curiosity-gap and pure problem-agitation openers — they made the reader work for the payoff the page already gives away.)*

## Bonus — trim the lead so it doesn't echo the deck
With the deck now carrying the mechanism, the existing lead paragraph opens on the same beat ("Point your camera at whatever you keep putting off"). Tighten it so the hero doesn't say the same thing twice:

> The task that won't start usually isn't laziness — it's not being able to see the finish line or the next step. So Molehill makes both: a picture of what done looks like, and three small steps to get there each day. When you think you're finished, you photograph it again, and it confirms the work is really there.

---

# 2 · CTA wording  *(audit: conversion — "Join the waitlist" names the mechanic, not the value)*

Keep **nav** literal (`Join the waitlist` — the sticky nav benefits from being unambiguous). Make the **hero + final-panel** buttons value-forward:

- **Recommended (hero + final):** `Get early access`
- Alt A: `Get early access →`  *(arrow nudges the click; matches the ghost-button chevron already on the page)*
- Alt B: `Start with one photo`  *(product-specific; pairs with the final panel's "Start with one photo" H2 — risks reading as "start now" when there's nothing to start yet)*
- Keep: `Join the waitlist` for nav

Note per the module's testing discipline: CTA wording is the **lowest-variance** test on the page. Ship the change, but don't expect it to move the number the way the hero will — test offer/angle/headline before button copy.

---

# 3 · Waitlist success screen  *(audit fix #3 — the "You're on the list." dead end)*

Currently the highest-intent moment on the page captures nothing. Replace the dead end with expectation-setting + a one-tap share.

## Recommended

> ### You're on the list.
> We'll email you once — the day Molehill's ready to try. Nothing before that.
>
> Know someone the "too big to start" feeling follows around? **Send them molehills.app** &nbsp;`[ Copy link ]`

When the double-opt-in confirmation fired, keep the existing line beneath it ("We sent a confirmation link to **{email}**. It doesn't expire, so confirm whenever you like.").

**Plainer alt** (if "the feeling follows around" is too much for your taste):
> You're on the list. One email when it's ready — that's the deal.
> Know someone who'd get this? **Send them molehills.app** `[ Copy link ]`

Implementation note (not copy): the `[ Copy link ]` button is a few lines — `navigator.share({ url })` on mobile with a `navigator.clipboard.writeText` fallback. This is the single highest-leverage growth add on the page; the copy above is written to slot straight into `WaitlistForm.tsx`'s `done` block.

---

# 4 · Category-contrast line  *(audit: competitive — the "vs streak apps" stance is implicit)*

One plain line, placed in "The weight" section or beside the hero stat row, makes the contrast a visitor coming from a streak app will feel:

- **Recommended:** Every other app rewards the streak. Molehill rewards finishing — then stopping.
- Alt: Built for the days a streak would only make you feel worse.
- Alt: The productivity apps count days in a row. Molehill counts the pile getting smaller.

---

# 5 · Make the name earn itself  *(audit: messaging — the molehill/mountain metaphor is never stated)*

The inversion of "make a mountain out of a molehill" is your whole idea and it's currently left implicit. One line, as a kicker in "The weight" section or the footer mega-word:

- **Recommended:** The mountain was never the problem. It just needed to be a molehill.
- Alt: We turn your mountains back into molehills.
- Alt (footer word, replacing/pairing "Start small."): One molehill at a time.

---

# 6 · SEO copy  *(audit fixes #2 + #5 — title, meta, OG text)*

Concept-first, brand-last, written to the truncation point. Char counts checked.

- **Title (55):** `ADHD-friendly app for tasks too big to start | Molehill`
- **Meta description (~158):** `Molehill turns a photo of whatever feels too big into a plan of small steps, then hands you three a day — never a fourth. Built for ADHD minds and anyone stuck.`
- **OG / Twitter title:** `Molehill — big things, finished gently`
- **OG / Twitter description (~86):** `Photograph the task that feels too big. Molehill turns it into three small steps a day.`

These slot into the `metadata` block from audit fix #2. The `og.png` image itself is a design task, not copy — flagged below.

---

# What I'd test first

**Recommended hero (R) vs. objection-first hero (H).** It's the sharpest, most interpretable contrast in the set: R leads with the *mechanism* ("photograph it → three a day → never a fourth"), H leads with the *rejection* ("No streaks. No timers. No guilt."). One variable — the opening argument — so the result is readable. If H wins, your incoming audience is defined by what they're fleeing (retarget and write ads from the streak-app pain). If R wins, they're defined by the task in front of them (write ads from the overwhelm). Either result tells you how to spend the first ad dollar. Don't call it on a handful of signups — with waitlist volume this low, treat it as directional until you've got a few hundred per arm.

---

# Flagged

- **Founder note (audit: trust) needs your real story — I won't write it.** A lived-experience note is the single most persuasive proof available pre-launch, but a fabricated personal ADHD story is invented proof and would backfire if it's not true. Structure to fill in yourself, in the page's voice: *one sentence on the task that beat you → one on what you noticed made the difference (small steps / seeing progress) → one on why you built Molehill → sign it with a real name.* Keep it to 3–4 sentences. If you send me the raw facts, I'll shape it.
- **No signup count anywhere.** The audit flagged social proof; I did not manufacture a "join 1,200 others." When you have a real number, the hero stat row or the CTA panel is where it goes.
- **`og.png` is design, not copy.** The OG text is above; the 1200×630 image needs building from the hero art.
- **CTA copy is low-variance.** Included because it was in the audit, but it's the last thing to test, not the first.
- **Voice check:** every line above was read against `slop-patterns.md` — no "not just X but Y," no transformation-family verbs, tricolons used only where they echo the page's existing house phrasing (the H eyebrow). If any line reads as not-your-voice, it's the "too big to start feeling follows around" line in #3 — the plainer alt is there for that reason.
