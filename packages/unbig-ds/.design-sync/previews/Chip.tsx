import * as React from "react";
import { Chip } from "@unbig/ds";

const Grow = (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M12 10c0-3 2-5 5-5M12 10c0-3-2-5-5-5" /></svg>);
const Focus = (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" /></svg>);
const Bolt = (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 4 14h7l-1 7 9-11h-7z" /></svg>);

export const GrowsWithYou = () => <Chip tone="grow" icon={Grow}>Grows with you</Chip>;
export const OneThing = () => <Chip tone="focus" icon={Focus}>One thing at a time</Chip>;
export const Momentum = () => <Chip tone="momentum" icon={Bolt}>Momentum, not pressure</Chip>;
export const PlainTag = () => <Chip tone="plain">No streaks</Chip>;
