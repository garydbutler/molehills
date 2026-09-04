import * as React from "react";
import { color, font } from "./theme";

export type ButtonVariant = "primary" | "ghost" | "nav";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` is the one accent-filled action per view;
   *  `ghost` is a quiet hairline-outlined alternative; `nav` is the compact
   *  accent pill used in the top navigation. */
  variant?: ButtonVariant;
  /** Optional leading or trailing icon (an inline SVG). */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  fontFamily: font.sans,
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: 999,
  cursor: "pointer",
  transition: "background 180ms ease, transform 180ms ease, border-color 180ms ease",
};

const variants: Record<ButtonVariant, React.CSSProperties> = {
  primary: { fontSize: 15.5, color: color.paper, background: color.accent, border: `1px solid ${color.accent}`, padding: "16px 30px" },
  ghost: { fontSize: 15, fontWeight: 500, color: color.inkSoft, background: "transparent", border: `1px solid ${color.line}`, padding: "15px 26px" },
  nav: { fontSize: 13.5, minHeight: 44, justifyContent: "center", color: color.paper, background: color.accent, border: `1px solid ${color.accent}`, padding: "11px 22px" },
};

/** The Unbig button. One `primary` action per view; never a wall of buttons. */
export function Button({ variant = "primary", icon, children, style, ...rest }: ButtonProps) {
  return (
    <button {...rest} style={{ ...base, ...variants[variant], ...style }}>
      {children}
      {icon}
    </button>
  );
}
