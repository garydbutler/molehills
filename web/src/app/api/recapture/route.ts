/*
  Recapture — the cheap "tell us what changed" call. This is what replaces the
  checkbox: a second look at the actual project decides whether the day is
  done, not a tap.

  Two ways to show the work:
    - a photo, judged on what is visibly different
    - a sentence, judged on how SPECIFIC it is

  The second exists because not every project is photographable, and the ones
  that aren't are often the private ones — a dissertation, a legal filing, a
  hard email. We never ask for the work itself, only for what moved. Self-
  deception is vague ("worked on it"); doing the thing produces detail for
  free. That difference is legible without ever seeing the work.

  Deliberately in the cheap-call bucket (text+vision, no image generation).
  The done picture is NOT redrawn here; the client fades before -> done by the
  progress this route reports.
*/
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireUser } from "@/lib/require-user";

export const dynamic = "force-dynamic";

const RECAPTURE_SCHEMA = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["progress", "leap", "no_change", "wrong_project"],
      description:
        "progress = today's jobs are accounted for. leap = clearly further along than today's jobs asked for. no_change = nothing moved, or the evidence is too ambiguous to tell (a dark/blurry image, or a note too general to place against any job). wrong_project = this is a different project entirely.",
    },
    completedJobs: {
      type: "array",
      items: { type: "integer" },
      description:
        "Indices (from the numbered job list) of jobs the evidence actually accounts for. Empty when you cannot tell.",
    },
    progress: {
      type: "integer",
      description:
        "0-100: how close the project now is to the finished description, based only on what the evidence accounts for.",
    },
    message: {
      type: "string",
      description:
        "One short, warm sentence for the person. Never shaming, never a scold. If nothing moved, be kind about it.",
    },
  },
  required: ["verdict", "completedJobs", "progress", "message"],
} as const;

const SYSTEM_PROMPT = `You are Inchmeal's recapture check. Someone with ADHD has finished a day of work on a project and is showing you the project again instead of ticking a checkbox. Your job is to look honestly and kindly.

A project is any piece of work: a kitchen, a bathroom remodel, a history essay, a homework packet, a chapter of a book. Never call these "rooms".

You will get:
- A "before" image of the project (sometimes absent, for written work started from a sentence)
- A "now" image they just took
- A description of what finished looks like
- A numbered list of the jobs asked of them today, plus the jobs still outstanding

Decide ONE verdict:
- "progress": the jobs asked for today are visibly done.
- "leap": the project is clearly further along than today's jobs required. They did extra. List every job you can see is finished, not just today's.
- "no_change": nothing meaningful moved, OR the image is too dark, blurry, or ambiguous to judge. When in doubt, use this — never guess "progress".
- "wrong_project": the image shows a different project or subject entirely.

HARD RULES:
- Only credit a job you can actually SEE is done. If a job is not visible in this kind of image, do not credit it.
- The camera will not be in exactly the same place. A slightly different angle, distance, or zoom is FINE and is never a reason to say no_change or wrong_project. Judge the work, not the framing.
- Different lighting or time of day is fine.
- Do not scold, do not moralise, do not mention streaks. There are no streaks.
- "progress" reflects only visible reality. Do not inflate it to be encouraging.`;

const WORDS_PROMPT = `You are Inchmeal's recapture check. Someone with ADHD has finished a day of work on a project. They cannot photograph it — it is writing, admin, study, a phone call, something private — so instead of ticking a checkbox they are telling you, in their own words, what changed.

A project is any piece of work: a kitchen, a bathroom remodel, a history essay, a homework packet, a chapter of a book, a tax return. Never call these "rooms".

You will get:
- A description of what finished looks like
- A numbered list of the jobs asked of them today, plus the jobs still outstanding
- What they just said changed today

YOU ARE NOT FACT-CHECKING THEM. You cannot see the work and you never will. You are not a lie detector and you must never imply they might be lying.

What you are actually reading for is SPECIFICITY. Someone who genuinely did the work names particulars without being asked — which section, which problem, which person they called, the bit that took longer than expected, the part that annoyed them. Someone who is fooling themselves writes in generalities: "worked on it", "made progress", "did some of it", "got a bit done". That difference is the whole signal.

Decide ONE verdict:
- "progress": they described today's jobs with real particulars. Credit those jobs.
- "leap": they described work beyond what today asked for. Credit every job they specifically account for, not just today's.
- "no_change": they say nothing moved, OR what they wrote is too general to tell which jobs it covers. When in doubt, use this — never guess "progress".
- "wrong_project": they are plainly describing a different project entirely.

HARD RULES:
- NEVER ask them to show, paste, quote, or summarise the work itself. Not one line of it. "I finished the methodology section" is a complete answer and you must treat it as one. Asking what the section SAID is a serious failure.
- Only credit a job their words specifically account for. Do not credit a job just because it was on today's list and their note sounded positive.
- On "no_change" from vagueness, ask for exactly ONE more particular, warmly and concretely — "which bit?", "how far did you get?" — never a lecture, never a demand for proof, never a hint of suspicion.
- A short note is not a bad note. One specific sentence beats a long vague one. Never ask for more words for their own sake.
- Effort counts when it is specific. "Called twice, both times on hold, gave up after 20 minutes" is real work on a phone-call job even though the call never connected — credit it.
- Do not scold, do not moralise, do not mention streaks. There are no streaks.
- "progress" reflects only what they actually accounted for. Do not inflate it to be encouraging.`;

/* A note is a sentence about the work, never the work itself. The cap keeps an
   accidental full-manuscript paste from becoming the thing we send off. */
const MAX_NOTE_CHARS = 600;

type RecaptureBody = {
  beforeImage?: string;
  nowImage?: string;
  note?: string;
  vision?: string;
  title?: string;
  description?: string;
  todayJobs?: string[];
  remainingJobs?: string[];
};

function corsHeaders(origin: string | null) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
  const isAllowed =
    origin &&
    (allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("exp://"));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));

  // Every path below this line spends money. Authenticate first.
  const auth = await requireUser(request, headers);
  if (auth.error) return auth.error;

  let body: RecaptureBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers },
    );
  }

  const {
    beforeImage,
    nowImage,
    note,
    vision,
    title,
    description,
    todayJobs,
    remainingJobs,
  } = body;

  const hasImage = typeof nowImage === "string" && nowImage.length > 0;
  const trimmedNote = typeof note === "string" ? note.trim() : "";
  const hasNote = trimmedNote.length > 0;

  // A day can be shown with a photo or with a sentence — never with neither.
  if (!hasImage && !hasNote) {
    return NextResponse.json(
      { error: "Send either a photo of the project or a note about it." },
      { status: 400, headers },
    );
  }

  // A malformed request is the caller's problem whatever our config is, so it
  // gets answered above this.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Vision service not configured. Please try again later." },
      { status: 503, headers },
    );
  }

  const strip = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, "");

  // The job list the model indexes into. Today's jobs first so a "leap" can be
  // read off the tail.
  const today = todayJobs ?? [];
  const jobs = [...today, ...(remainingJobs ?? [])];
  const jobList = jobs.map((label, i) => `${i}: ${label}`).join("\n");

  const parts: object[] = [];

  if (hasImage) {
    if (beforeImage && typeof beforeImage === "string") {
      parts.push({ text: "This is the BEFORE image of the project:" });
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: strip(beforeImage) },
      });
    }

    parts.push({ text: "This is the project NOW:" });
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: strip(nowImage as string) },
    });
  }

  parts.push({
    text: [
      title ? `The project is "${title}".` : null,
      description ? `They described it as: "${description}"` : null,
      vision ? `Finished looks like: "${vision}"` : null,
      "",
      today.length > 0
        ? `Jobs asked of them today: indices 0 to ${today.length - 1}.`
        : "No jobs were outstanding today.",
      "Full numbered job list (today's first, then what's still outstanding):",
      jobList || "(none)",
      "",
      hasImage
        ? "Look at the NOW image and decide the verdict."
        : `This is what they said changed today:\n"${trimmedNote.slice(0, MAX_NOTE_CHARS)}"\n\nRead it for specificity and decide the verdict.`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: hasImage ? SYSTEM_PROMPT : WORDS_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RECAPTURE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "Empty response from vision service" },
        { status: 502, headers },
      );
    }

    const parsed = JSON.parse(text) as {
      verdict: string;
      completedJobs: number[];
      progress: number;
      message: string;
    };

    // Never trust indices we didn't offer.
    const completedJobs = (parsed.completedJobs ?? []).filter(
      (i) => Number.isInteger(i) && i >= 0 && i < jobs.length,
    );

    return NextResponse.json(
      {
        verdict: parsed.verdict,
        completedJobs,
        progress: Math.max(0, Math.min(100, Math.round(parsed.progress ?? 0))),
        message: parsed.message ?? "",
      },
      { headers },
    );
  } catch (error) {
    console.error("Recapture failed:", error);
    return NextResponse.json(
      { error: "Couldn't look at that just now. Try again in a moment." },
      { status: 502, headers },
    );
  }
}
