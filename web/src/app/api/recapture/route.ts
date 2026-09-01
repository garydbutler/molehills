/*
  Cheap text+vision feedback for a checkpoint already saved on-device.
  Checkboxes decide progress; this route only notices a concrete positive
  change when it can and responds warmly when it cannot.
*/
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireUser } from "@/lib/require-user";
import { findOrCreateUser, claimRecapture } from "@/lib/quota";

export const dynamic = "force-dynamic";

const RECAPTURE_SCHEMA = {
  type: "object",
  properties: {
    assessment: {
      type: "string",
      enum: ["visible_progress", "not_obvious"],
      description:
        "visible_progress when a concrete positive change can be observed; not_obvious when the evidence does not make a change clear.",
    },
    message: {
      type: "string",
      description:
        "One short, warm sentence for the person. Never shaming, never a scold. If nothing moved, be kind about it.",
    },
  },
  required: ["assessment", "message"],
} as const;

const SYSTEM_PROMPT = `You are Inchmeal's warm progress observer. Someone with ADHD has checked off work and is saving a photo, a note, or both as a checkpoint. Their checkboxes are authoritative. You are not verifying, grading, crediting, or rejecting their work.

A project is any piece of work: a kitchen, a bathroom remodel, a job application, a tax return, a chapter of a book. Never call these "rooms".

HARD RULES:
- When a specific positive change is visible or described, name exactly one concrete detail and encourage them. Set assessment to visible_progress.
- If change is not obvious, the image is ambiguous, or the note is brief, set assessment to not_obvious and offer warm encouragement. Never ask for proof or imply that the work did not happen.
- Keep the message to one natural sentence. Do not mention AI, analysis, verdicts, jobs being credited, streaks, or camera framing.
- Never request private work or additional detail.`;

/* A note is a sentence about the work, never the work itself. The cap keeps an
   accidental full-manuscript paste from becoming the thing we send off. */
const MAX_NOTE_CHARS = 600;

const CANNED_FEEDBACK = {
  visible_progress: "You made real progress here—take a moment to notice what changed.",
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

type RecaptureBody = {
  beforeImage?: string;
  nowImage?: string;
  note?: string;
  vision?: string;
  title?: string;
  description?: string;
  day?: string;
  completedJobs?: string[];
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

  const dbUser = await findOrCreateUser(auth.user);
  const look = await claimRecapture(dbUser, body.day ?? new Date().toISOString().slice(0, 10));
  if (!look.allowed) {
    return NextResponse.json(
      { error: look.reason, upgrade: look.upgrade },
      { status: 429, headers },
    );
  }

  const {
    beforeImage,
    nowImage,
    note,
    vision,
    title,
    description,
    completedJobs,
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

  const jobList = (completedJobs ?? []).map((label) => `- ${label}`).join("\n");

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
      "Jobs the person has checked off:",
      jobList || "(none)",
      "",
      hasImage
        ? "Notice one positive change if it is clear. If it is not clear, encourage them warmly anyway."
        : `This is what they said changed today:\n"${trimmedNote.slice(0, MAX_NOTE_CHARS)}"`,
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
      assessment: "visible_progress" | "not_obvious";
      message: string;
    };

    const assessment =
      parsed.assessment === "visible_progress"
        ? "visible_progress"
        : "not_obvious";

    const message = pickCheckpointMessage(assessment, parsed.message);

    return NextResponse.json({ assessment, message }, { headers });
  } catch (error) {
    console.error("Recapture failed:", error);
    return NextResponse.json(
      { error: "Couldn't look at that just now. Try again in a moment." },
      { status: 502, headers },
    );
  }
}
