import * as React from "react";
import { color, font } from "./theme";

export interface PrincipleQuoteProps {
  /** The quote text, rendered in the handwritten Caveat voice. */
  children: React.ReactNode;
  /** Small mono attribution line beneath the quote. */
  attribution?: string;
}

/** A centered handwritten principle — Unbig's warm voice in Caveat. */
export function PrincipleQuote({ children, attribution }: PrincipleQuoteProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: font.serif, fontWeight: 500, fontSize: 44, lineHeight: 1.3, maxWidth: "22ch", margin: "0 auto", color: color.ink }}>
        {children}
      </p>
      {attribution && (
        <div style={{ marginTop: 24, fontFamily: font.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: color.muted }}>
          {attribution}
        </div>
      )}
    </div>
  );
}
