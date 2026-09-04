import * as React from "react";
import { SpaceTile } from "@unbig/ds";

const Counter = (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e2148" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2 4 4 8-8 4 4" /><path d="M3 20h18" /></svg>);
const Inbox = (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e2148" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16" /></svg>);
const Box = (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e2148" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4-8 4-8-4 8-4zM4 12l8 4 8-4" /></svg>);

export const Kitchen = () => <div style={{ width: 220 }}><SpaceTile title="Kitchen" description="One counter at a time." icon={Counter} /></div>;
export const Inbox0 = () => <div style={{ width: 220 }}><SpaceTile title="Inbox" description="Reply, archive, done." icon={Inbox} /></div>;
export const Garage = () => <div style={{ width: 220 }}><SpaceTile title="Garage" description="Shelf by shelf." icon={Box} /></div>;
