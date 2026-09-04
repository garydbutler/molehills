import * as React from "react";
import { SectionHeader, Accent } from "@unbig/ds";

export const Default = () => (
  <div style={{ width: 560 }}>
    <SectionHeader index="02 — The method" title={<>Big things, made <Accent>small enough</Accent> to start.</>} />
  </div>
);
export const Plain = () => (
  <div style={{ width: 560 }}>
    <SectionHeader index="03 — The shift" title="Three a day, never a fourth." />
  </div>
);
