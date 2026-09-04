/*
  Scale tokens — the normative values from DESIGN.md at the repo root.
  A radius, size or spacing step that is not in here is a bug: before this
  file the app carried 10 different corner radii and 18 font sizes, nine of
  them within four points of each other, which is why no two screens agreed.
*/

/* Five radii. tag: inline metadata chips. control: checkboxes and small
   toggles. frame: photos, fields, job rows. card: cards. pill: buttons. */
export const radii = {
  tag: 4,
  control: 10,
  frame: 14,
  card: 20,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/* Eight type steps, each a family + size + leading + tracking as one set.
   Tracking is size-specific — display tightens, the mono kicker opens up. */
export const type = {
  display: { fontSize: 34, lineHeight: 38, letterSpacing: -1 },
  title: { fontSize: 21, lineHeight: 26, letterSpacing: -0.4 },
  heading: { fontSize: 19, lineHeight: 24, letterSpacing: -0.2 },
  subhead: { fontSize: 17, lineHeight: 23, letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  label: { fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  kicker: { fontSize: 11, lineHeight: 16, letterSpacing: 2 },
  aside: { fontSize: 21, lineHeight: 27, letterSpacing: 0 },
} as const;

/* The only shadow in the app. One tier lifts; a second value is a defect. */
export const lift = {
  shadowColor: "#221e48",
  shadowOpacity: 0.06,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 12,
  elevation: 2,
} as const;

/* Minimum real geometry for anything tappable. hitSlop may extend a target,
   never constitute one. */
export const TOUCH_MIN = 44;
