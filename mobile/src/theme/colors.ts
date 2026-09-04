/*
  Shared color tokens — mirrors the CSS variables in web/src/app/globals.css
  so the app and marketing site stay in sync.
  Values are hex approximations of the site's oklch() tokens.
*/
export const colors = {
  paper: "#f9f6f1",
  surface: "#fefdfa",
  /* The third and last ground: rest and completion only. */
  washWarm: "#faf0e9",
  tint: "#e7e4f4",
  tintDeep: "#ccc7e8",
  ink: "#221e48",
  inkSoft: "#3d3b66",
  muted: "#616083",
  accent: "#6f5ddf",
  accentInk: "#5943bf",
  /* Clay means progress. As a fill only — 2.4:1 on paper, it may never
     carry text; use clayInk (4.87:1) where clay-coloured words are needed. */
  clay: "#e08c66",
  clayInk: "#a8552d",
  bone: "#f4f0e6",
  dusk: "#2b2751",
  /* Darkened from #8383a1, which failed at 3.4:1. This is the quietest text
     the system permits, and it still clears 4.65:1 on paper. */
  faint: "#6e6c8c",
  /* The only destructive colour. Clay is never danger; danger is never
     progress. 6.16:1 on paper. */
  danger: "#a83324",
  line: "#221e4829",
} as const;
