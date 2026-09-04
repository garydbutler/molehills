# Unbig Design System — how to build with it

Unbig is a warm, quiet, ADHD-friendly product. The look is printed-paper
grounds, an indigo/violet accent with a clay-orange secondary, a dark "dusk"
section for contrast, and a four-font stack. Bias to calm: one primary action
per view, generous space, never a wall of controls.

## Setup — import the tokens once

Import the token stylesheet at your app root so the `--unbig-*` custom
properties and the four fonts are defined:

```jsx
import "@unbig/ds/tokens.css";
import { Button, TaskRow } from "@unbig/ds";
```

Without `tokens.css` loaded, components fall back to literal token values and
still render, but the web fonts (Caveat, Montserrat, Nunito Sans, IBM Plex
Mono) won't load. There is no provider/wrapper to mount — components are
self-contained.

## Styling idiom — CSS custom-property tokens

This DS styles via **CSS variables**, not utility classes and not a theme prop
API. Every color and font is a `var(--unbig-*)` token defined in `tokens.css`.
For your own layout glue around these components, reference the same tokens.

Color tokens (all `oklch`): `--unbig-paper`, `--unbig-paper-deep`,
`--unbig-surface`, `--unbig-bone`, `--unbig-tint`, `--unbig-tint-deep`,
`--unbig-ink`, `--unbig-ink-soft`, `--unbig-muted`, `--unbig-faint`,
`--unbig-line`, `--unbig-line-soft`, `--unbig-accent`, `--unbig-accent-hover`,
`--unbig-accent-ink`, `--unbig-clay`, `--unbig-danger`, `--unbig-dusk`,
`--unbig-dusk-mute`.

Font tokens: `--unbig-sans` (Montserrat — display/headings/buttons),
`--unbig-serif` (Caveat — the handwritten voice), `--unbig-body` (Nunito
Sans — running copy), `--unbig-mono` (IBM Plex Mono — eyebrows, indices,
fine print). The library also exports `color` and `font` objects with these
same references for use in inline styles.

Shape: pill (`999px`) for buttons, chips, inputs; soft radii (`16–18px`) for
cards and task rows; square (`0`) for method-step cards. Accent underlines use
`--unbig-tint-deep`. Mono labels are uppercase with wide tracking.

## Components

`Button` (variant primary | ghost | nav), `Chip` (tone grow | focus |
momentum | plain), `TaskRow`, `MethodCard`, `SpaceTile`, `WaitlistInput`,
`SectionHeader` + `Accent`, `PrincipleQuote`. Read each component's
`.prompt.md` and `.d.ts` for its props; read `tokens.css` before adding any
color or type of your own.

## Idiomatic snippet

```jsx
import { SectionHeader, Accent, MethodCard } from "@unbig/ds";

<section style={{ fontFamily: "var(--unbig-body)", color: "var(--unbig-ink-soft)" }}>
  <SectionHeader index="02 — The method"
    title={<>Big things, made <Accent>small enough</Accent> to start.</>} />
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22, marginTop: 30 }}>
    <MethodCard index="01" title="Show it the big thing"
      description="A photo of the mess, or one sentence." />
  </div>
</section>
```
