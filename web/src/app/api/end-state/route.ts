import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are an image transformation assistant. Given a photo of a messy or cluttered space, generate a photoreal image showing the SAME space but clean, organized, and peaceful.

IMPORTANT:
- Keep the same room layout, furniture, and architecture
- Remove clutter, organize items neatly, add subtle warm lighting
- Make it feel calm and inviting, like a magazine photo
- Do NOT change the fundamental structure of the space
- The result should be recognizable as the same room, just tidied`;

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

  let body: { image?: string; vision?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers },
    );
  }

  const { image, vision } = body;

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
      "Transform this messy space into a clean, organized, peaceful version of itself.",
      vision ? `The goal is: "${vision}"` : null,
      "Keep the same room structure and furniture, just make it tidy and inviting.",
    ]
      .filter(Boolean)
      .join(" ");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
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
        responseModalities: ["image"],
        temperature: 0.8,
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 502, headers },
      );
    }

    const imagePart = parts.find(
      (p): p is { inlineData: { mimeType: string; data: string } } =>
        "inlineData" in p && !!p.inlineData?.data,
    );

    if (!imagePart) {
      return NextResponse.json(
        { error: "No image in response" },
        { status: 502, headers },
      );
    }

    return NextResponse.json(
      {
        image: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType || "image/png",
      },
      { headers },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Image generation error";
    console.error("Gemini Image API error:", message);
    return NextResponse.json(
      {
        error:
          "Image generation temporarily unavailable. Please try again later.",
      },
      { status: 502, headers },
    );
  }
}
