import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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
        "The type of space: Living room, Desk, Garden, Garage, Kitchen, Bedroom, Bathroom, or Other",
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
              "A tiny, specific, physical action grounded in what is visible in the photo. Example: 'Put the 4 mugs in the dishwasher'",
          },
          minutes: {
            type: "integer",
            description: "Estimated minutes (2-10)",
          },
        },
        required: ["label", "minutes"],
      },
      minItems: 12,
      maxItems: 12,
      description: "Exactly 12 tiny steps, each 2-10 minutes",
    },
  },
  required: ["title", "space", "vision", "steps"],
} as const;

const SYSTEM_PROMPT = `You are Molehill, an ADHD-friendly companion that helps people transform messy spaces into calm ones through tiny steps.

You will receive a photo of a messy or cluttered space. Your job is to:
1. Identify what type of space it is
2. Create a calm, encouraging vision statement (one sentence, gentle, never shaming)
3. Generate exactly 12 tiny, specific, physical tasks grounded in what you SEE in the photo

IMPORTANT RULES:
- Be specific to what's actually visible ("Put the 3 coffee mugs on the counter into the sink" not "Tidy up")
- Each step should take 2-10 minutes
- Steps should be physically doable, not overwhelming
- Never shame or judge the mess - it's just a starting point
- The vision should feel like a reward, not a criticism
- Use gentle, friendly language throughout
- Reference actual objects you can see in the image`;

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
    "Access-Control-Allow-Headers": "Content-Type",
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Vision service not configured. Please try again later." },
      { status: 503, headers },
    );
  }

  let body: { image?: string; title?: string; space?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers },
    );
  }

  const { image, title, space } = body;

  if (!image || typeof image !== "string") {
    return NextResponse.json(
      { error: "Missing required field: image (base64 JPEG)" },
      { status: 400, headers },
    );
  }

  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = [
      title ? `The user calls this space: "${title}"` : null,
      space ? `They categorize it as: ${space}` : null,
      "Please analyze this photo and create a 12-step plan to transform it into a calm, organized space.",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            { text: userPrompt },
          ],
        },
      ],
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
