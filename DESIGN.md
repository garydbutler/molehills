---
name: UNBIG
description: Make big things small enough to start.
colors:
  paper: "#f9f6f1"
  surface: "#fefdfa"
  wash-warm: "#faf0e9"
  tint: "#e7e4f4"
  tint-deep: "#ccc7e8"
  ink: "#221e48"
  ink-soft: "#3d3b66"
  dusk: "#2b2751"
  muted: "#616083"
  faint: "#6e6c8c"
  accent: "#6f5ddf"
  accent-ink: "#5943bf"
  clay: "#e08c66"
  clay-ink: "#a8552d"
  bone: "#f4f0e6"
  danger: "#a83324"
  line: "#221e4829"
typography:
  display:
    fontFamily: "Montserrat_800ExtraBold"
    fontSize: "34"
    lineHeight: "38"
    letterSpacing: "-1"
  title:
    fontFamily: "Montserrat_600SemiBold"
    fontSize: "21"
    lineHeight: "26"
    letterSpacing: "-0.4"
  heading:
    fontFamily: "Montserrat_600SemiBold"
    fontSize: "19"
    lineHeight: "24"
    letterSpacing: "-0.2"
  subhead:
    fontFamily: "NunitoSans_600SemiBold"
    fontSize: "17"
    lineHeight: "23"
    letterSpacing: "0"
  body:
    fontFamily: "NunitoSans_400Regular"
    fontSize: "15"
    lineHeight: "22"
    letterSpacing: "0"
  label:
    fontFamily: "NunitoSans_600SemiBold"
    fontSize: "13"
    lineHeight: "18"
    letterSpacing: "0.1"
  kicker:
    fontFamily: "IBMPlexMono_500Medium"
    fontSize: "11"
    lineHeight: "16"
    letterSpacing: "2"
  aside:
    fontFamily: "Caveat_500Medium"
    fontSize: "21"
    lineHeight: "27"
    letterSpacing: "0"
rounded:
  tag: "4px"
  control: "10px"
  frame: "14px"
  card: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "15px 26px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "15px 26px"
  button-disabled:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.faint}"
    rounded: "{rounded.pill}"
    padding: "15px 26px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "18px"
  card-hero:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "18px"
  card-warm:
    backgroundColor: "{colors.wash-warm}"
    rounded: "{rounded.card}"
    padding: "18px"
  job-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.frame}"
    padding: "16px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "14px 16px"
---

# Design System: UNBIG

## Overview

**Creative North Star: "The Field Notebook"**

A naturalist's pocket journal for a room you have been avoiding. Warm paper, a
handwritten aside in the margin, a photograph clipped in, small observations
logged across days rather than a dashboard reporting on you. The system's job
is to make a large, shameful-feeling thing look like a page of small notes.

Density is low and deliberate. Type does most of the work; color is used
sparingly and always to mean something. The interface never counts at you,
never celebrates with confetti, and never implies a streak. Its highest
compliment is that it feels unhurried.

The mark is a purple faceted mountain crumbling into small stones, with a clay
dot over the "i" of the wordmark. That image *is* the product thesis, and it is
the only illustrative language the app uses.

**Key characteristics:**
- Paper ground, never white; surfaces are warmer than the screen expects.
- One handwritten voice (Caveat) reserved for asides and the vision — never UI.
- Photographs are the imagery. Illustration is limited to the mountain motif.
- Flat by default; exactly one tier lifts.
- Nothing on screen counts days, streaks, or misses.

**Anti-references (confirmed):** the inchworm mascot, retired with the Inchmeal
rebrand and never to be reintroduced; vendor emoji used as iconography;
progress bars that fill toward a deadline; any red that means "behind".

## Colors

Warm neutrals carrying a single purple voice, with one warm accent that means
progress and one red that means danger — never the same color for both.

**Grounds.** `paper` is the app background everywhere. `surface` is the card.
`wash-warm` is the third and last ground, reserved for moments of rest and
completion — the finished day, the finished project. `tint` marks the
currently-active thing (today's project in a list); `tint-deep` is a track or
placeholder, never a text ground.

**Ink.** `ink` for headlines and primary text. `ink-soft` for body copy inside
cards. `dusk` for kickers and headline-adjacent labels that need presence
without shouting. `muted` for metadata. `faint` is the quietest text permitted
and still passes 4.65:1 on paper — nothing lighter may carry words.

**Purple.** `accent-ink` is every solid fill and every link (bone on it reads
6.19:1). `accent` is the lighter relation, used for tints and non-text
accents only; it fails contrast as a button fill and must not be one.

**Clay means progress.** The ring's arc, check-in markers, the dot on the "i".
`clay` itself is a fill color only — at 2.4:1 on paper it may never carry text.
Where clay-colored *text* is needed, use `clay-ink` (4.87:1).

**Danger is red, and only red.** `danger` is the sole destructive color, used
for the delete-account row and error text. Clay is never destructive; red is
never progress.

Contrast floor: 4.5:1 for any text, 3:1 for meaningful non-text. Verified pairs
in use: ink/paper 14.46, ink-soft/paper 9.66, muted/paper 5.55, faint/paper
4.65, accent-ink/paper 6.54, bone/accent-ink 6.19, danger/paper 6.16,
ink/wash-warm 13.88.

## Typography

Four families, each with one job, and eight steps total. A size not in the
scale is a bug — the pre-system codebase carried eighteen, including nine
within four points of each other.

- **Montserrat ExtraBold** — `display` only. One per screen, the headline.
- **Montserrat SemiBold** — `title`, `heading`. Card and section names.
- **Nunito Sans** — `subhead`, `body`, `label`. All running text.
- **IBM Plex Mono** — `kicker` only. All-caps, tracked +2, for the small
  orienting line above a headline.
- **Caveat** — `aside`. The vision, the gentle one-liners. Never a control,
  never a label, never a whole paragraph.

Tracking is size-specific: `display` tightens to -1, `title` to -0.4, body sits
at 0, and only the mono kicker opens up. Leading tightens as size grows.

Nothing sets `allowFontScaling={false}`. Every container that holds text sizes
itself from that text; fixed heights around type are prohibited.

## Layout

A single-column vertical stack on a `paper` ground, 24pt page padding, sections
separated by `lg`–`xl`. There is no grid and no multi-column layout; the phone
in one hand at the end of a long day is the only layout target.

Spacing uses six steps — 4 / 8 / 12 / 16 / 24 / 32. Within a card, `sm` between
a label and its value, `md` between rows, `lg` between groups. Between cards,
`lg`. Page padding is `xl`.

Scroll views clear the floating tab bar with `64 + safe-area-bottom + 24`
bottom padding. Every screen reads its own safe-area insets; none assume.

**Nothing may appear above the job list when a job is completed.** Anything a
completion reveals goes below the list. Content that moves under a finger
mid-tap is the one layout error this product cannot afford.

## Elevation & Depth

Softly lifted: exactly one tier leaves the page.

- **Ground** — `paper`. No border, no shadow.
- **Resting** — `surface` card, 1px `line` hairline, no shadow. The default.
- **Lifted** — `surface` card with the single shadow token below and no
  hairline. Reserved for the primary action tier: today's jobs, the active
  capture target. One lifted region per screen, never two.
- **Floating** — the translucent tab bar, blurred, content scrolling beneath.
  The only true overlay in the app.

Shadow (the only one): `ink` at 6% opacity, y-offset 4, radius 12, no spread;
`elevation: 2` on Android. A second shadow value anywhere is a defect.

## Shapes

Five radii, no others: `tag` 4 for inline chips of metadata, `control` 10 for
checkboxes and small toggles, `frame` 14 for photographs, fields and job rows,
`card` 20 for cards, `pill` 999 for buttons and filter chips.

The mountain motif supplies the app's only illustrative shapes: faceted
triangular forms and the small rounded stones they break into. Drawn as SVG in
code — never a raster asset, so it inherits color from tokens and stays crisp
at any size. Its three states carry meaning: whole mountain (not started),
mountain mid-crumble (in progress), scattered stones (done).

Borders are 1px `line` at rest and 1.5px `accent-ink` when a control is
interactive and empty (an unchecked box). Dashed borders mean "put something
here" and appear only on empty capture targets.

## Components

**Buttons.** One shape, three states. Solid `accent-ink` for the single primary
action on a screen; outline for secondary; disabled is a `tint` fill with
`faint` text — never a dimmed version of the enabled fill, which reads as
tappable and produces a dead first tap. Minimum height 44pt, always.

**Cards.** `surface`, 20 radius, 18 padding, hairline. Promote to Lifted only
for the primary tier. `wash-warm` for rest and completion.

**Job row.** The most important component in the app. 14 radius, 16 padding,
`subhead` label, a 10-radius checkbox that fills from its current animated
value so a fast double-tap reverses rather than queues. Labels never truncate —
an instruction the user cannot finish reading is an instruction they cannot
act on. One row treatment only; the Vision screen and the Today screen must not
diverge.

**Touch.** Every tappable is at least 44×44pt of real geometry. `hitSlop` may
extend a target, never constitute it. Feedback fires on press-down, not
release: one critically damped spring (damping 1.0, response ~0.35), scale 0.97
for buttons and 0.985 for rows, dropped under `prefers-reduced-motion`.

**Haptics.** Reserved. Medium on completing a job, Light on undoing one, and a
single latched Success when the day's jobs are done. Nothing else vibrates.

**Fields.** `surface`, 14 radius, 16/14 padding, `body` text. Character limits
show a counter before they bite; a cap that silently stops typing is a defect.

**Accessibility.** Every tappable carries `accessibilityRole="button"` (or
`checkbox` with `accessibilityState`). Every content image carries a label;
decorative images are explicitly hidden.

## Do's and Don'ts

**Do**
- Reach for the mountain-and-stones motif when a moment needs an image.
- Let photographs be the imagery — the user's before shot, their latest check-in.
- Spend clay on progress and warmth.
- Keep one lifted tier and one primary action per screen.
- Write failure states in the same gentle voice as success states.
- Put a completion-triggered element below the list, never above it.

**Don't**
- Don't use the inchworm mascot, in any pose, anywhere, ever again.
- Don't use vendor emoji as iconography.
- Don't invent a radius, a type size, a spacing step, or a second shadow.
- Don't put text on `clay`, `tint-deep`, or any ground below 4.5:1.
- Don't use red for anything but danger, or clay for anything but progress.
- Don't count days, streaks, or misses anywhere in the interface.
- Don't truncate a job label.
- Don't dim an enabled style to express "disabled".
