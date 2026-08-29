/*
  Shared color tokens — mirrors the CSS variables in web/src/app/globals.css
  (the Inchmeal landing design) so the app and marketing site stay in sync.
  Values are hex approximations of the site's oklch() tokens.
*/
export const colors = {
  paper: "#f2f1e4",
  surface: "#f8f7ee",
  tint: "#e3ebdd",
  tintDeep: "#cfe0cd",
  ink: "#20403b",
  inkSoft: "#32504a",
  muted: "#53746d",
  accent: "#2e7266",
  accentInk: "#34705f",
  clay: "#d79a65",
  bone: "#f1eee1",
  dusk: "#1c3935",
  faint: "#7d968f",
  line: "#20403b2b",
} as const;
