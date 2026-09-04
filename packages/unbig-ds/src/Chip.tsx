import * as React from "react";
import { color, font } from "./theme";

export type ChipTone = "grow" | "focus" | "momentum" | "plain";

export interface ChipProps {
  /** `grow` / `focus` / `momentum` are the three capability chips with tinted
   *  icon wells; `plain` is the dotted-outline feature tag ("No streaks"). */
  tone?: ChipTone;
  /** Inline SVG shown in the tinted well (ignored for `plain`). */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const wells: Record<Exclude<ChipTone, "plain">, React.CSSProperties> = {
  grow: { background: "oklch(0.90 0.055 148)", color: "oklch(0.44 0.09 150)" },
  focus: { background: "oklch(0.90 0.050 250)", color: "oklch(0.46 0.12 255)" },
  momentum: { background: "oklch(0.92 0.060 85)", color: "oklch(0.52 0.11 70)" },
};

/** A capability chip (tinted icon + label) or a plain dotted feature tag. */
export function Chip({ tone = "plain", icon, children }: ChipProps) {
  if (tone === "plain") {
    return (
      <span style={{ fontFamily: font.sans, fontSize: 14, fontWeight: 600, color: color.inkSoft, border: `1px dotted ${color.line}`, background: color.surface, borderRadius: 999, padding: "12px 22px" }}>
        <span style={{ color: color.clay, marginRight: 8 }}>—</span>
        {children}
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: font.body, fontSize: 14.5, fontWeight: 500, color: color.inkSoft }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", flex: "0 0 auto", ...wells[tone] }}>
        {icon}
      </span>
      {children}
    </span>
  );
}
