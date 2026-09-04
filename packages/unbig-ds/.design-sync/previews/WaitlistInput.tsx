import * as React from "react";
import { WaitlistInput } from "@unbig/ds";

export const Default = () => <div style={{ width: 520 }}><WaitlistInput /></div>;
export const CustomLabel = () => <div style={{ width: 520 }}><WaitlistInput placeholder="you@example.com" buttonLabel="Join the waitlist" /></div>;
