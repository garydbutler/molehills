/*
  Recapture — the cheap "look at these two pictures and tell us what changed"
  call. This is what replaces the checkbox: a second look at the actual
  project decides whether the day is done, not a tap.

  Deliberately in the cheap-call bucket (text+vision, no image generation).
  The done picture is NOT redrawn here; the client fades before -> done by the
  progress this route reports.
*/
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

const RECAPTURE_SCHEMA = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["progress", "leap", "no_change", "wrong_project"],
      description:
        "progress = today's jobs are visibly done. leap = clearly further along than today's jobs asked for. no_change = nothing moved, or the image is too dark/blurry/ambiguous to tell. wrong_project = this is a different project entirely.",
    },
    completedJobs: {
      type: "array",
      items: { type: "integer" },
      description:
        "Indices (from the numbered job list) of jobs you can actually SEE are finished in the new image. Empty when you cannot tell.",
    },
    progress: {
      type: "integer",
      description:
        "0-100: how close the project now looks to the finished description. Only ever what you can see.",
    },
    message: {
      type: "string",
      description:
        "One short, warm sentence for the person. Never shaming, never a scold. If nothing moved, be kind about it.",
    },
  },
  required: ["verdict", "completedJobs", "progress", "message"],
} as const;

const SYSTEM_PROMPT = `You are Molehill's recapture check. Someone with ADHD has finished a day of work on a project and is showing you the project again instead of ticking a checkbox. Your job is to look honestly and kindly.

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

type RecaptureBody = {
  beforeImage?: string;
  nowImage?: string;
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
    "Access-Control-Allow-Headers": "Content-Type",
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Vision service not configured. Please try again later." },
      { status: 503, headers },
    );
  }

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
    vision,
    title,
    description,
    todayJobs,
    remainingJobs,
  } = body;

  if (!nowImage || typeof nowImage !== "string") {
    return NextResponse.json(
      { error: "Missing required field: nowImage" },
      { status: 400, headers },
    );
  }

  const strip = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, "");

  // The job list the model indexes into. Today's jobs first so a "leap" can be
  // read off the tail.
  const today = todayJobs ?? [];
  const jobs = [...today, ...(remainingJobs ?? [])];
  const jobList = jobs.map((label, i) => `${i}: ${label}`).join("\n");

  const parts: object[] = [];

  if (beforeImage && typeof beforeImage === "string") {
    parts.push({ text: "This is the BEFORE image of the project:" });
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: strip(beforeImage) },
    });
  }

  parts.push({ text: "This is the project NOW:" });
  parts.push({
    inlineData: { mimeType: "image/jpeg", data: strip(nowImage) },
  });

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
      "Look at the NOW image and decide the verdict.",
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
        systemInstruction: SYSTEM_PROMPT,
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
