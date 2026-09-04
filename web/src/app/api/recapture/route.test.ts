/*
  The progress log felt canned because the route discarded the model's sentence
  and always sent one of two fixed strings. pickCheckpointMessage now surfaces
  the model line while keeping the "a win never reads as a loss" guard.

  Run with:  npx tsx src/app/api/recapture/route.test.ts
*/
import assert from "node:assert";
import { pickCheckpointMessage } from "../../../lib/checkpoint-message";

// A normal, specific model sentence is passed straight through.
assert.equal(
  pickCheckpointMessage("visible_progress", "Fifteen annotated sources is a real foundation now."),
  "Fifteen annotated sources is a real foundation now.",
);

// Two different checkpoints no longer collapse to the same text.
assert.notEqual(
  pickCheckpointMessage("visible_progress", "The outline finally has a spine."),
  pickCheckpointMessage("visible_progress", "Your thesis question is sharper than yesterday."),
);

// A visible_progress result that hedges falls back to the confident canned line.
assert.equal(
  pickCheckpointMessage("visible_progress", "It's hard to tell what changed from this."),
  "You made real progress here—take a moment to notice what changed.",
);

// not_obvious trusts the model line as-is — the hedge guard is only there to
// stop a *win* from reading like a loss; an honest "not sure yet" is fine here.
assert.equal(
  pickCheckpointMessage("not_obvious", "Even a quiet day of setup moves this along."),
  "Even a quiet day of setup moves this along.",
);

// Empty or over-long model output falls back per assessment.
assert.equal(
  pickCheckpointMessage("visible_progress", "   "),
  "You made real progress here—take a moment to notice what changed.",
);
assert.equal(
  pickCheckpointMessage("not_obvious", "x".repeat(201)),
  "You showed up and moved this forward. That counts, even when the camera can’t tell the whole story.",
);

// A hedge-shaped phrase is fine when the model itself says progress is visible.
assert.equal(
  pickCheckpointMessage("not_obvious", "Even if it's hard to see, the folder structure is set up."),
  "Even if it's hard to see, the folder structure is set up.",
);

console.log("recapture message selection: all assertions passed");
