export const LOCAL_FEEDBACK =
  "You showed up and moved this forward. That counts, even when the camera can’t tell the whole story.";

export type FeedbackResult = {
  message: string;
  source: "ai" | "local";
};

/*
  A checkpoint is already saved before this runs. AI feedback is decoration,
  never a transaction: a network failure resolves to warm local copy and must
  never reject back into the capture screen.
*/
export async function feedbackWithFallback(
  request: () => Promise<{ message?: string }>,
): Promise<FeedbackResult> {
  try {
    const result = await request();
    const message = result.message?.trim();
    return message
      ? { message, source: "ai" }
      : { message: LOCAL_FEEDBACK, source: "local" };
  } catch {
    return { message: LOCAL_FEEDBACK, source: "local" };
  }
}

export function currentDayStepIds(args: {
  steps: { id: string; done: boolean }[];
  today: string;
  plannedDay?: string;
  plannedIds?: string[];
  size: number;
}): string[] {
  if (args.plannedDay === args.today && args.plannedIds?.length) {
    const known = new Set(args.steps.map((step) => step.id));
    return args.plannedIds.filter((id) => known.has(id));
  }

  return args.steps
    .filter((step) => !step.done)
    .slice(0, args.size)
    .map((step) => step.id);
}

export function checkpointAfterStep(args: {
  markingDone: boolean;
  allTasksDone: boolean;
  dayComplete: boolean;
  today: string;
  existing?: { kind: "day" | "project"; day: string };
}): { kind: "day" | "project"; day: string } | undefined {
  if (args.markingDone && args.allTasksDone) {
    return { kind: "project", day: args.today };
  }
  if (
    args.markingDone &&
    args.dayComplete
  ) {
    return { kind: "day", day: args.today };
  }
  if (!args.markingDone && !args.allTasksDone && args.existing?.kind === "project") {
    return args.dayComplete
      ? { kind: "day", day: args.today }
      : undefined;
  }
  if (!args.markingDone && !args.dayComplete && args.existing?.kind === "day") {
    return undefined;
  }
  return args.existing;
}
