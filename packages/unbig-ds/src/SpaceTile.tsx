import * as React from "react";
import { color, font } from "./theme";

export interface SpaceTileProps {
  /** Space name, e.g. "Kitchen". */
  title: string;
  /** One-line description. */
  description: string;
  /** Inline SVG shown in the rounded-square glyph well. */
  icon?: React.ReactNode;
}

/** A rounded "space" tile — the rooms and areas Unbig helps you tackle. */
export function SpaceTile({ title, description, icon }: SpaceTileProps) {
  return (
    <div style={{ background: color.surface, border: `1px solid ${color.lineSoft}`, borderRadius: 18, padding: "22px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: color.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <h3 style={{ fontFamily: font.sans, fontSize: 15.5, fontWeight: 700, lineHeight: 1.3, margin: 0, color: color.ink }}>{title}</h3>
      <p style={{ fontFamily: font.body, fontSize: 13, lineHeight: 1.55, color: color.muted, margin: 0 }}>{description}</p>
    </div>
  );
}
