# Unbig DS — sync notes

- **Shape:** package. Hand-authored component library at `packages/unbig-ds`,
  built from the Unbig web app's design tokens (`web/src/app/globals.css`).
- **Build:** `npm run build` (tsup → `dist/index.js` ESM + `dist/index.d.ts`).
- **Tokens/fonts:** `src/tokens.css` defines `--unbig-*` vars and `@import`s the
  four Google Fonts (Caveat, Montserrat, Nunito Sans, IBM Plex Mono) at runtime
  → expect `[FONT_REMOTE]` (informational, no action).
- **Styling idiom:** components use inline styles referencing `var(--unbig-*)`
  tokens with literal oklch fallbacks; there is no shipped component CSS, so
  `_ds_bundle.css` may be a placeholder (`[CSS_PLACEHOLDER]`, informational).
- **Render check:** SKIPPED this run at user request (no chromium) →
  `--no-render-check`. Renders were not machine-verified.

## Known render warns
- `[RENDER_SKIPPED]` every run until chromium is installed (render check is
  off by choice). Not a new warn.

## Re-sync risks
- **Previews not machine-verified.** All 8 preview cards were authored but
  never rendered in a headless browser this run. Install chromium and run
  `package-validate.mjs` (drop `--no-render-check`) to verify before trusting.
- **All components land in the `general` group** (no per-component docs with
  `category` frontmatter). To organize, add `docsMap` stubs or `.md` docs with
  `---\ncategory: <Group>\n---`.
- **Fonts load remotely** via Google Fonts `@import` in `tokens.css`
  (`[FONT_REMOTE]`). Designs render them at runtime; PNG/PDF export would show
  fallbacks.
- **Component styling is inline `var(--unbig-*)`**, so `_ds_bundle.css` carries
  only the token `:root` block — correct, but means restyling happens via the
  tokens, not component class overrides.
