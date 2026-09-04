import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireUser } from "@/lib/require-user";
import { findOrCreateUser, checkPlanQuota, recordPlanGeneration } from "@/lib/quota";

export const dynamic = "force-dynamic";

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A short, friendly name for this project (2-5 words)",
    },
    space: {
      type: "string",
      description:
        "What kind of project this is: Kitchen, Living room, Bathroom, Garden, Garage, Desk, Essay, Homework, Writing, Admin, or Other",
    },
    vision: {
      type: "string",
      description:
        "One calm, ADHD-friendly sentence describing the peaceful end state. Gentle and encouraging, never shaming. Example: 'Sunday-you, sitting in a calm room.'",
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description:
              "One specific, checkable action. It must be visible in a later photo or screenshot. Examples: 'Put the 4 mugs in the dishwasher', 'Write one ugly paragraph of the introduction', 'Do problems 4 through 6'.",
          },
          minutes: {
            type: "integer",
            description:
              "Real working minutes, 2-10. Never under 2 — a thirty-second job is a planning bug.",
          },
        },
        required: ["label", "minutes"],
      },
      minItems: 12,
      maxItems: 12,
      description:
        "Exactly 12 jobs of real weight, each 2-10 minutes, ordered so any three consecutive jobs make a sensible day of 10-20 minutes",
    },
  },
  required: ["title", "space", "vision", "steps"],
} as const;

const SYSTEM_PROMPT = `You are UNBIG, an ADHD-friendly companion that breaks a project into a handful of small jobs a day.

A PROJECT is any piece of work someone wants finished: cleaning the kitchen, remodelling the bathroom, a job application, a tax return, chapter 4 of a book. Never call these "rooms" — a project is not always a place.

You will receive a photo, a screenshot, or a written description of where a project stands today. Your job is to:
1. Identify what kind of project it is
2. Write one calm, encouraging sentence describing what finished looks like (gentle, never shaming)
3. Write exactly 12 jobs that get them from here to finished

HOW BIG IS A JOB:
- Each job is 2-10 minutes of REAL work. Not thirty seconds. Not an hour.
- Any three consecutive jobs should add up to roughly 10-20 minutes — that is one day's work.
- "Pick up one sock" is too small. "Clean the whole kitchen" is too big. "Clear one shelf" is right. "Write one ugly paragraph" is right. "Do problems 4 through 6" is right.
- The 12 jobs should feel like several days of work, not one afternoon.

EVERY JOB MUST BE CHECKABLE:
- Later that day they will photograph or screenshot the project again, and we must be able to SEE whether the job got done.
- For physical projects, the job must be visible in a photo.
- For writing or paperwork, it must be visible in a screenshot, a photo of the page, or a file that got longer.
- "Feel more organised" is not a job. "Decide how you feel about chapter 4" is not a job. If you cannot see it, do not write it.

OTHER RULES:
- Be specific to what is actually in front of you ("Put the 3 coffee mugs on the counter into the sink", not "Tidy up").
- Never shame or judge where the project stands — it is just a starting point.
- The finished-state sentence should feel like a reward, not a criticism.
- Never mention streaks, timers, or scores. There are none.
- If a project is genuinely enormous (a whole novel, a whole house), plan only the next sensible chunk and say so in the title.`;

type PlanStep = { label: string; minutes: number };
type PlanResponse = {
  title: string;
  space: string;
  vision: string;
  steps: PlanStep[];
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
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  // Every path below this line spends money. Authenticate first.
  const auth = await requireUser(request, headers);
  if (auth.error) return auth.error;

  const dbUser = await findOrCreateUser(auth.user);
  const quota = await checkPlanQuota(dbUser);
  if (!quota.allowed) {
    // 402 rather than 403: the client routes this to the paywall when
    // `upgrade` says subscribing would actually fix it.
    return NextResponse.json(
      { error: quota.reason, upgrade: quota.upgrade },
      { status: 402, headers },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Vision service not configured. Please try again later." },
      { status: 503, headers },
    );
  }

  let body: {
    image?: string;
    title?: string;
    space?: string;
    description?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers },
    );
  }

  const { image, title, space, description } = body;

  const hasImage = typeof image === "string" && image.length > 0;
  const hasDescription =
    typeof description === "string" && description.trim().length > 0;

  // Not every project is photographable. A sentence is enough to start one.
  if (!hasImage && !hasDescription) {
    return NextResponse.json(
      { error: "Send either an image or a description of the project." },
      { status: 400, headers },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = [
      title ? `The user calls this project: "${title}"` : null,
      space ? `They categorize it as: ${space}` : null,
      hasDescription ? `They describe the project as: "${description}"` : null,
      hasImage
        ? "Please look at this image of where the project stands and write the 12 jobs that get it finished."
        : "There is no image — work from the description alone and write the 12 jobs that get this project finished.",
    ]
      .filter(Boolean)
      .join("\n");

    const parts: object[] = [];
    if (hasImage) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: (image as string).replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }
    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: PLAN_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "No response from vision service" },
        { status: 502, headers },
      );
    }

    const plan: PlanResponse = JSON.parse(text);

    if (!plan.steps || plan.steps.length !== 12) {
      return NextResponse.json(
        { error: "Invalid plan format from vision service" },
        { status: 502, headers },
      );
    }

    // Recorded only now: a failed generation must not cost the user a slot.
    await recordPlanGeneration(dbUser);

    return NextResponse.json(plan, { headers });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Vision service error";
    console.error("Gemini API error:", message);
    return NextResponse.json(
      { error: "Vision service temporarily unavailable. Please try again." },
      { status: 502, headers },
    );
  }
}
