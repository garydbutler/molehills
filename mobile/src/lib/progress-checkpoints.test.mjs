/* Run with: npx tsx src/lib/progress-checkpoints.test.ts */
import assert from "node:assert/strict";
import {
  LOCAL_FEEDBACK,
  checkpointAfterStep,
  currentDayStepIds,
  feedbackWithFallback,
} from "./progress-checkpoints.ts";

async function main() {
  const failed = await feedbackWithFallback(async () => {
    throw new Error("Couldn't look just now");
  });
  assert.deepEqual(failed, { message: LOCAL_FEEDBACK, source: "local" });

  const observed = await feedbackWithFallback(async () => ({
    message: "The floor by the workbench is clear now.",
  }));
  assert.deepEqual(observed, {
    message: "The floor by the workbench is clear now.",
    source: "ai",
  });

  const steps = [
    { id: "one", done: false },
    { id: "two", done: false },
    { id: "three", done: false },
    { id: "four", done: false },
  ];
  assert.deepEqual(
    currentDayStepIds({ steps, today: "2026-08-30", size: 3 }),
    ["one", "two", "three"],
  );

  assert.deepEqual(
    checkpointAfterStep({
      markingDone: true,
      allTasksDone: false,
      dayComplete: true,
      today: "2026-08-30",
    }),
    { kind: "day", day: "2026-08-30" },
  );
  assert.deepEqual(
    checkpointAfterStep({
      markingDone: true,
      allTasksDone: true,
      dayComplete: true,
      today: "2026-08-30",
    }),
    { kind: "project", day: "2026-08-30" },
    "the final project task must require a checkpoint from Journey too",
  );

  steps[0].done = true;
  assert.deepEqual(
    currentDayStepIds({
      steps,
      today: "2026-08-30",
      plannedDay: "2026-08-30",
      plannedIds: ["one", "two", "three"],
      size: 3,
    }),
    ["one", "two", "three"],
    "today's plan must not refill after a checkbox is completed",
  );

  console.log("progress-checkpoints: all assertions passed");
}

main();
