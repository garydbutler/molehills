/**
 * Token references for the Unbig design system.
 *
 * Each value is a `var(--unbig-*)` reference with the literal token as a
 * fallback, so components stay styled even before `tokens.css` loads. Import
 * `tokens.css` once at your app root to supply the canonical values.
 */
export const color = {
  paper: "var(--unbig-paper, oklch(0.975 0.008 85))",
  paperDeep: "var(--unbig-paper-deep, oklch(0.945 0.014 86))",
  surface: "var(--unbig-surface, oklch(0.993 0.004 90))",
  bone: "var(--unbig-bone, oklch(0.955 0.014 88))",
  tint: "var(--unbig-tint, oklch(0.926 0.022 293))",
  tintDeep: "var(--unbig-tint-deep, oklch(0.845 0.045 292))",
  ink: "var(--unbig-ink, oklch(0.265 0.075 285))",
  inkSoft: "var(--unbig-ink-soft, oklch(0.375 0.072 285))",
  muted: "var(--unbig-muted, oklch(0.505 0.055 285))",
  faint: "var(--unbig-faint, oklch(0.545 0.045 285))",
  line: "var(--unbig-line, oklch(0.265 0.075 285 / 0.16))",
  lineSoft: "var(--unbig-line-soft, oklch(0.265 0.075 285 / 0.08))",
  accent: "var(--unbig-accent, oklch(0.565 0.19 285))",
  accentHover: "var(--unbig-accent-hover, oklch(0.50 0.195 285))",
  accentInk: "var(--unbig-accent-ink, oklch(0.48 0.185 285))",
  clay: "var(--unbig-clay, oklch(0.72 0.115 45))",
  danger: "var(--unbig-danger, oklch(0.52 0.17 27))",
  dusk: "var(--unbig-dusk, oklch(0.285 0.08 285))",
  duskMute: "var(--unbig-dusk-mute, oklch(0.735 0.045 288))",
} as const;

export const font = {
  sans: "var(--unbig-sans, 'Montserrat', 'Avenir Next', system-ui, sans-serif)",
  serif: "var(--unbig-serif, 'Caveat', 'Segoe Script', cursive)",
  body: "var(--unbig-body, 'Nunito Sans', -apple-system, system-ui, sans-serif)",
  mono: "var(--unbig-mono, 'IBM Plex Mono', 'SF Mono', Menlo, monospace)",
} as const;
