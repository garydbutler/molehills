import * as React from "react";
import { Button } from "./Button";
import { color, font } from "./theme";

export interface WaitlistInputProps {
  /** Placeholder for the email field. */
  placeholder?: string;
  /** Button label. */
  buttonLabel?: string;
  /** Fired with the entered email when the button is pressed. */
  onSubmit?: (email: string) => void;
}

/** The inline email + button pill used for the Unbig waitlist. */
export function WaitlistInput({ placeholder = "you@example.com", buttonLabel = "Notify me", onSubmit }: WaitlistInputProps) {
  const [email, setEmail] = React.useState("");
  return (
    <div style={{ display: "flex", gap: 10, background: color.surface, border: `1px solid ${color.line}`, borderRadius: 999, padding: 7, maxWidth: 520 }}>
      <input
        type="email"
        value={email}
        placeholder={placeholder}
        onChange={(e) => setEmail(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: font.sans, fontSize: 15.5, color: color.ink, padding: "12px 10px 12px 20px", outline: "none" }}
      />
      <Button variant="primary" style={{ padding: "13px 26px", fontSize: 14.5 }} onClick={() => onSubmit?.(email)}>
        {buttonLabel}
      </Button>
    </div>
  );
}
