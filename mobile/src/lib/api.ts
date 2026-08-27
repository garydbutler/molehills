import { File } from "expo-file-system";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://molehills.vercel.app";

export type PlanStep = {
  label: string;
  minutes: number;
};

export type PlanResponse = {
  title: string;
  space: string;
  vision: string;
  steps: PlanStep[];
};

export type EndStateResponse = {
  image: string;
  mimeType: string;
};

export type ApiError = {
  error: string;
};

async function fileToBase64(uri: string): Promise<string> {
  const file = new File(uri);
  const base64 = file.base64Sync();
  return base64;
}

export async function fetchPlan(
  photoUri: string,
  title?: string,
  space?: string,
): Promise<PlanResponse> {
  const base64Image = await fileToBase64(photoUri);

  const response = await fetch(`${API_URL}/api/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
      title: title || undefined,
      space: space || undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(
      errorBody.error || `API error: ${response.status}`,
    );
  }

  return response.json() as Promise<PlanResponse>;
}

export async function fetchEndState(
  photoUri: string,
  vision?: string,
): Promise<EndStateResponse> {
  const base64Image = await fileToBase64(photoUri);

  const response = await fetch(`${API_URL}/api/end-state`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
      vision: vision || undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(
      errorBody.error || `API error: ${response.status}`,
    );
  }

  return response.json() as Promise<EndStateResponse>;
}
