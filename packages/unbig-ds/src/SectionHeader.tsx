import * as React from "react";
import { color, font } from "./theme";

export interface SectionHeaderProps {
  /** Mono index label, e.g. "02 — The method". A clay rule precedes it. */
  index: string;
  /** The display heading. Wrap the emphasized run in <Accent> for the
   *  underlined accent treatment. */
  title: React.ReactNode;
}

/** Emphasized run inside a heading — accent color + tint-deep underline. */
export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <em style={{ fontStyle: "normal", fontWeight: 700, color: color.accent, textDecoration: "underline", textDecorationColor: String(color.tintDeep), textDecorationThickness: "0.06em", textUnderlineOffset: "0.14em" }}>
      {children}
    </em>
  );
}

/** A section header: mono index with a clay rule, then a display heading. */
export function SectionHeader({ index, title }: SectionHeaderProps) {
  return (
    <div>
      <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: color.muted, display: "inline-flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 26, height: 1, background: color.clay, display: "inline-block" }} />
        {index}
      </div>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em", lineHeight: 1.04, color: color.ink, marginTop: 14 }}>
        {title}
      </div>
    </div>
  );
}
