import * as React from "react";
import { color, font } from "./theme";

export interface TaskRowProps {
  /** The task text. */
  label: string;
  /** Small mono caption, e.g. "Step 1 of 3" or "Done". */
  meta?: string;
  /** When true the check fills with accent and the label strikes through. */
  done?: boolean;
}

/** One row in Unbig's three-a-day list. Never more than three per screen. */
export function TaskRow({ label, meta, done = false }: TaskRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, background: color.paper, border: `1px solid ${color.lineSoft}`, borderRadius: 16, padding: "11px 13px" }}>
      <span style={{ position: "relative", width: 26, height: 26, flex: "none", borderRadius: "50%", border: `1.5px solid ${done ? color.accent : color.line}`, background: done ? color.accent : color.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" style={{ opacity: done ? 1 : 0 }}>
          <path d="M5 12l5 5 9-11" fill="none" stroke={String(color.surface)} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ minWidth: 0 }}>
        <b style={{ display: "block", fontFamily: font.sans, fontSize: 13.5, fontWeight: 600, color: done ? color.muted : color.ink, lineHeight: 1.3, textDecoration: done ? "line-through" : "none" }}>{label}</b>
        {meta && <span style={{ fontFamily: font.mono, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: color.muted }}>{meta}</span>}
      </span>
    </div>
  );
}
