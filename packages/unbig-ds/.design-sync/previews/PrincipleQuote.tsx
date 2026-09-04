import * as React from "react";
import { PrincipleQuote } from "@unbig/ds";

export const Default = () => (
  <div style={{ width: 520 }}>
    <PrincipleQuote attribution="The whole product, in one line">Three small steps a day. Never a fourth.</PrincipleQuote>
  </div>
);
export const Short = () => (
  <div style={{ width: 520 }}>
    <PrincipleQuote>rest is part of the plan.</PrincipleQuote>
  </div>
);
