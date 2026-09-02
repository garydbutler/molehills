const CANNED_FEEDBACK = {
  visible_progress:
    "You made real progress here—take a moment to notice what changed.",
  not_obvious:
    "You showed up and moved this forward. That counts, even when the camera can’t tell the whole story.",
} as const;

const HEDGE_RE =
  /\b(can'?t (tell|see)|hard to (say|see|tell)|not (obvious|clear|much|sure)|doesn'?t (look|seem)|nothing (obvious|much)|unclear)\b/i;

/*
  The assessment is the contract: a successful checkpoint must never read as if
  nothing happened. Within that, prefer the model's own sentence — it names the
  concrete detail the schema asked for, so the log stays varied — and fall back
  to warm generic copy only when that sentence is missing, too long to be one
  line, or a visible_progress result that still hedges like a not_obvious one.
*/
export function pickCheckpointMessage(
  assessment: "visible_progress" | "not_obvious",
  modelMessage: unknown,
): string {
  const line = typeof modelMessage === "string" ? modelMessage.trim() : "";
  const usable =
    line.length > 0 &&
    line.length <= 200 &&
    !(assessment === "visible_progress" && HEDGE_RE.test(line));
  return usable ? line : CANNED_FEEDBACK[assessment];
}
