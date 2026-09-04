import * as React from "react";
import { TaskRow } from "@unbig/ds";

export const Pending = () => <div style={{ width: 340 }}><TaskRow label="Clear the top of the desk" meta="Step 1 of 3" /></div>;
export const Done = () => <div style={{ width: 340 }}><TaskRow label="Sort the mail pile" meta="Done" done /></div>;
export const List = () => (
  <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 9 }}>
    <TaskRow label="Clear the counter" meta="Done" done />
    <TaskRow label="Load the dishwasher" meta="Done" done />
    <TaskRow label="Wipe the stovetop" meta="Step 3 of 3" />
  </div>
);
