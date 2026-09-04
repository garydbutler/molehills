import * as React from "react";
import { Button } from "@unbig/ds";

const Arrow = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const Primary = () => <Button variant="primary">Join the waitlist</Button>;
export const Ghost = () => <Button variant="ghost">See how it works</Button>;
export const Nav = () => <Button variant="nav">Get the app</Button>;
export const WithIcon = () => <Button variant="primary" icon={Arrow}>Notify me</Button>;
