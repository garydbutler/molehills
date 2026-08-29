# GEO Audit — molehills.app

2026-08-29 · **Citability score: 23/100** · Basis: live site (HTML, robots.txt, sitemap, JSON-LD), 5 answer-shaped queries against web search, competitor entity verification via GitHub + vendor sites.

> All scores here are marketing-judgement heuristics, not measured performance and not any engine's internal ranking data. No answer engine publishes its citation criteria; everything below is inferred from observed behaviour and published helpful-content guidance. Citation is non-deterministic — the same query returns different sources across sessions and regions.

---

## The one thing

**Another pre-launch ADHD task app is already called Molehill, and the engines have already given it your name.** When I searched "Molehill app ADHD molehills.app", the answer came back under the heading *"Molehill (molehills.app) — ADHD App"* and then described a completely different product: [obsidian-ridge-labs/Molehill](https://github.com/obsidian-ridge-labs/Molehill), an on-device iPhone app whose tagline is *"Molehill turns an overwhelming task into the one small step that comes next"* and which markets itself on **"No streaks, no shame."** Your domain was attached to their product description. That is not a near-miss; it is the entity merge already happening, in the exact niche and the exact anti-streak position you occupy. Every schema block, FAQ rewrite and listicle placement you buy from here is being deposited into an identity you do not solely own — which is why the name decision has to be settled before any of the other work is worth doing.

---

## Baseline: who gets cited today

Five queries. **molehills.app appeared in zero of them.**

| Query | Molehill (yours) cited? | Who was cited |
|---|---|---|
| "best app for ADHD when a task feels too big to start" | No | Magic ToDo (Goblin Tools), Todoist, Llama Life, EmberTend, Forest |
| "app that breaks overwhelming tasks into small steps ADHD" | No | Tiny Steps, ADHD Planner, RoutineFlow, Sprout, TaskBreaker, Magic ToDo |
| "ADHD task app no streaks no gamification gentle" | No | EmberTend, MomoDays, Gentle Habits, mostly, Microsoft To Do |
| **"Molehill app ADHD molehills.app"** (brand query) | **No — competitor returned under your domain** | obsidian-ridge-labs/Molehill; Molehill Mountain (Autistica/KCL) |
| "molehills.app 'three small steps' waitlist" | No | obsidian-ridge-labs/Molehill; Molehill Mountain; Molehill Empire (browser game) |

Two observations worth separating out:

**The name is contested three ways.** Yours; [obsidian-ridge-labs/Molehill](https://github.com/obsidian-ridge-labs/Molehill) (ADHD, task breakdown, no streaks, also "coming soon"); and [Molehill Mountain](https://www.autistica.org.uk/molehill-mountain) — an autism anxiety app from Autistica and King's College London, live on the App Store, NHS-listed, with university backing and years of citations. The third one you will never outrank on entity authority, and it sits in an adjacent neurodivergent-support category, so the confusion is semantic as well as lexical.

**"AI breaks your task into small steps" is now table stakes.** Across two queries I counted eleven products making that exact claim. It is not a differentiator and cannot carry your positioning. Your genuinely unusual mechanics — evidence-based day completion, a hard cap of three, photo-or-sentence input — appeared in none of the competitor descriptions.

---

## Scorecard

| Lever | Weight | Score | Why |
|---|---|---|---|
| Entity clarity | 20% | **8** | Three-way name collision; zero JSON-LD; no About page; no named founder; no canonical description anywhere |
| Corroboration | 20% | **2** | Zero appearances in five queries; absent from every active 2026 roundup; no community footprint found |
| Extractability | 25% | **22** | Editorial headings that match no query; narrative structure with no answer-first blocks; no FAQ; facts buried in prose |
| Specificity & evidence | 25% | **30** | Real parameters exist (3/day, ~12 steps, under a minute) but no pricing, no launch date, no founder, no original data |
| Machine access | 10% | **75** | Clean SSR HTML, valid sitemap, all AI crawlers permitted, no interstitials |

**Weighted total: 23/100.**

**The binding constraint is entity clarity.** Corroboration is the second, and it is partly just a consequence of the first — you cannot be reliably placed in a roundup under a name that resolves to two other products. Extractability and evidence are real gaps, and fixing them moves nothing until the name resolves, because the citations they earn will accrue to a contested entity.

---

## Do these first

### 1. Settle the name — decision, not a task · effort L · confidence H

Not mine to make, so here are the three real options with what each costs:

**(a) Keep "Molehill", differentiate hard on the entity.** Viable only if you consistently ship the full string *"Molehill — molehills.app"* everywhere, register the entity in structured data, and win the App Store listing for the term. You are still fighting an identically-positioned competitor for the same phrase and a university-backed app for the category adjacency. Cheapest today, most expensive over three years.

**(b) Rename before launch.** You are pre-launch with a waitlist and no App Store record. This is the cheapest this decision will ever be. Everything you have built — the field-guide voice, the mole mascots, the molehill/mountain metaphor — survives a name change; the metaphor can stay in the copy without being the trademark.

**(c) Qualify the name.** "Molehill Field Guide", "Tend", or similar. Keeps the equity, breaks the collision. Your repo already contains `web/references/tend-landing.html`, so this may be ground you have covered before.

I would take (b) or (c). Do not spend on GEO until this is decided — it is the one finding here that invalidates the others.

### 2. Add Organization + SoftwareApplication schema · effort S · confidence H

The site currently serves **zero** JSON-LD blocks. Paste-ready block below. This is the single cheapest entity-clarity gain available and it stays correct under options (a) and (c); under (b) the strings change but the structure does not.

### 3. Add an FAQ block with question-shaped headings · effort M · confidence M

Your headings are *"The weight"*, *"One loop, four quiet moves"*, *"Where it helps"*. They are the best-written headings I have read on a pre-launch site and they match no query a human types. Do not replace them — **add** a section beneath them that does the machine-facing job. Draft below.

### 4. Put a named human on the page · effort S · confidence H

`brand-context.md:47` already identifies the lived-experience founder note as the strongest proof available pre-launch, and it is not on the site. Named authorship is a stated citability signal for AI Overviews and a corroboration anchor for entity resolution. Currently there is no named person anywhere on molehills.app.

### 5. Get into two roundups · effort L · confidence M

The listicles answering your target questions are active and refreshed for 2026: [ADDA](https://add.org/adhd-tools-for-adults/), [Klarity](https://www.helloklarity.com/post/adhd-apps/), [Artisan Strategies](https://www.artisangrowthstrategies.com/blog/best-apps-adhd-task-paralysis-tested), [Zapier](https://zapier.com/blog/adhd-to-do-list/), [choosingtherapy](https://www.choosingtherapy.com/best-adhd-apps/), [super-productivity](https://super-productivity.com/blog/best-adhd-task-management-apps-2026/). Corroboration is the lever models weight above anything you publish about yourself. Do this after the name is settled, never before.

---

## Schema to add

Paste into `web/src/app/layout.tsx` or the page component. Values marked `[NEED: …]` are things only you can confirm — do not ship invented ones.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://molehills.app/#organization",
      "name": "Molehill",
      "url": "https://molehills.app",
      "email": "hello@molehills.app",
      "description": "Molehill is an ADHD-friendly mobile app that turns an overwhelming task into a plan of small steps, giving you three a day and no streaks.",
      "foundingDate": "2026",
      "founder": {
        "@type": "Person",
        "name": "[NEED: founder name]"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://molehills.app/#app",
      "name": "Molehill",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "iOS, Android",
      "url": "https://molehills.app",
      "publisher": { "@id": "https://molehills.app/#organization" },
      "description": "Show Molehill where a task stands — a photo, or one sentence. It writes a plan of about 12 small steps and gives you three a day, never a fourth. A day ends when something has actually changed, not when a box is ticked. No streaks, timers, or gamification.",
      "featureList": [
        "Start a project from a photo or a written sentence",
        "AI-written plan of about 12 steps sorted into days",
        "Exactly three steps per day, one on a difficult day",
        "Days completed by evidence — a second photo or a sentence — not a checkbox",
        "No streaks, timers, or gamification"
      ],
      "offers": {
        "@type": "Offer",
        "price": "[NEED: price, or omit this whole block until pricing exists]",
        "priceCurrency": "[NEED]"
      }
    }
  ]
}
</script>
```

Two cautions. **Schema must match visible page content** — that is a stated Google violation, not a grey area, so every claim above needs to appear on the page in some form. And **omit the `offers` block entirely** until pricing is real; an empty or invented price is worse than no offer.

---

## Rewrites — the FAQ block

Add beneath the existing sections. Answer-first, self-contained, each block liftable without the rest of the page. Voice checked against `brand-context.md` — no banned words, no clinical claims.

**What is Molehill?**
> Molehill is an ADHD-friendly mobile app for tasks that feel too big to start. You show it where something stands — a photo of the room, or one sentence about the essay — and it writes a plan of about twelve small steps, sorted into days. Each day it gives you three of them and never a fourth. On a hard day you can ask for one. A day finishes when something has actually changed, which you show with a second photo or say in a sentence. There are no streaks, no timers, and nothing that nags. It is built for iOS and Android and is not yet released.

**How is Molehill different from other ADHD task apps?**
> Most task apps finish a day when you tick a box. Molehill finishes a day on evidence — a second photo of the same corner, or a sentence about what moved. It also caps the day at three steps rather than showing you everything at once, and it has no streak mechanic to break. Many apps break tasks into steps; the difference here is what counts as done and how little you are shown at a time.

**Do I have to take a photo to use Molehill?**
> No. A photo is one way in, not the only one. Write a sentence about what you are trying to finish and you get the same plan — and at the end of a day you say what changed instead of showing it. This is how people use it for essays, admin, tax returns, and anything private. Molehill never asks to see the work itself.

**Does Molehill use streaks or gamification?**
> No. There are no streaks, points, badges, timers, or reminders designed to make you feel behind. Missing a day costs nothing and there is no chain to maintain. Projects wait in the Journey tab until you come back to them.

**Is Molehill a treatment for ADHD?**
> No. Molehill is a task app built to be usable by people with ADHD. It does not diagnose, treat, or manage any medical condition, and it is not a medical device.

That last one is worth keeping regardless of GEO value: it is the honest answer, it is the boundary `brand-context.md:67` sets, and being the source that answers it plainly is exactly the kind of thing a model lifts.

---

## What's already working

**Machine access is genuinely good and needs no work.** `robots.txt` uses a permissive wildcard, so `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot` and `Google-Extended` all have access. Sitemap is valid and lists all three real pages. The site is server-rendered, fast, and has no interstitials over the content. Most sites I audit fail here; you do not.

**The title tag is already correct** — `ADHD-friendly app for tasks too big to start | Molehill`, 58 characters, front-loaded with the query rather than the brand. Do not let anyone "optimise" it.

**Real parameters exist.** "3 steps a day", "about 12 steps", "under a minute" are specific, checkable and un-inventable. They are the raw material for citability; they are just buried in prose rather than presented as facts.

**The anti-streak position is real and competitively live.** The fourth query returned a whole cohort of apps competing on it, which proves the demand — and none of them completes a day on evidence.

---

## What I couldn't determine

- **Whether any answer engine cites you today.** I measured against web search, which is a *proxy* for the retrieval surface, not the same thing as querying ChatGPT, Perplexity or AI Overviews directly. I have no account access to those. Being absent from search strongly implies absence from citation, but I did not observe it directly.
- **Sampling depth.** The workflow calls for three-plus observations per question; I ran one per query. Given a uniform zero result across five distinct queries the conclusion is safe, but treat individual competitor sets as directional.
- **Whether the competitor holds a trademark** on "Molehill" in your class, or has filed. That is a lawyer question and it materially changes option (a). Worth an hour of someone's time this week.
- **Pricing, launch date, founder identity** — none are stated on the site, so none could be put into schema.
- **Whether molehills.app is indexed at all.** Zero appearances is consistent with both "indexed but outranked" and "not yet indexed". Search Console would settle it in five minutes.

---

## Re-measure on 2026-09-28

Same five queries, same wording, recorded with dates. Add a sixth once a name is settled. GEO without a repeat measurement is astrology.

1. best app for ADHD when a task feels too big to start
2. app that breaks overwhelming tasks into small steps ADHD
3. ADHD task app no streaks no gamification gentle
4. Molehill app ADHD molehills.app
5. molehills.app "three small steps" waitlist

---

## One correction to something I told you earlier

I suggested `llms.txt` as a concrete gap. On checking the evidence, that was overstated. Measured adoption sits well under 1% of top-1000 sites, no major engine has publicly confirmed consuming the file, and the strongest public evidence review concludes it is not currently a citation lever. For a three-page marketing site it is hygiene at best. It is not on the priority list above, and I should not have implied it was a lever.
