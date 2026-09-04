import * as React from "react";
import { color, font } from "./theme";

export interface MethodCardProps {
  /** Two-digit step index, e.g. "01". Rendered in mono. */
  index: string;
  /** Card heading. */
  title: string;
  /** Supporting description. */
  description: string;
  /** Inline SVG shown in the tinted round glyph well. */
  icon?: React.ReactNode;
}

/** A square "how it works" step card — tinted glyph, mono index, heading, copy. */
export function MethodCard({ index, title, description, icon }: MethodCardProps) {
  return (
    <div style={{ background: color.surface, border: `1px solid ${color.lineSoft}`, padding: "26px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: "0.2em", color: color.muted, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{index}</span><span>——</span>
      </div>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: color.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <h3 style={{ fontFamily: font.sans, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, color: color.ink }}>{title}</h3>
      <p style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.6, color: color.muted, margin: 0 }}>{description}</p>
    </div>
  );
}
