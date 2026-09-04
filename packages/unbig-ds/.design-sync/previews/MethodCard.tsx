import * as React from "react";
import { MethodCard } from "@unbig/ds";

const Camera = (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e2148" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8M12 18v3M7 9l3 3 5-5" /></svg>);
const List = (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e2148" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h7" /></svg>);

export const ShowIt = () => (
  <div style={{ width: 320 }}><MethodCard index="01" title="Show it the big thing" description="A photo of the mess, or one sentence. That's the whole input." icon={Camera} /></div>
);
export const GetPlan = () => (
  <div style={{ width: 320 }}><MethodCard index="02" title="Get a plan of small steps" description="Unbig breaks it into pieces small enough to actually begin." icon={List} /></div>
);
