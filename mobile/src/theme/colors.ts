/*
  Shared color tokens — mirrors the CSS variables in web/src/app/globals.css
  so the app and marketing site stay in sync.
  Values are hex approximations of the site's oklch() tokens.
*/
export const colors = {
  paper: "#f9f6f1",
  surface: "#fefdfa",
  tint: "#e7e4f4",
  tintDeep: "#ccc7e8",
  ink: "#221e48",
  inkSoft: "#3d3b66",
  muted: "#616083",
  accent: "#6f5ddf",
  accentInk: "#5943bf",
  clay: "#e08c66",
  bone: "#f4f0e6",
  dusk: "#2b2751",
  faint: "#8383a1",
  line: "#221e4829",
} as const;
