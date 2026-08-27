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

export type RecaptureVerdict =
  | "progress"
  | "leap"
  | "no_change"
  | "wrong_project";

export type RecaptureResponse = {
  verdict: RecaptureVerdict;
  completedJobs: number[];
  progress: number; // 0-100
  message: string;
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
  photoUri: string | undefined,
  title?: string,
  space?: string,
  description?: string,
): Promise<PlanResponse> {
  const base64Image = photoUri ? await fileToBase64(photoUri) : undefined;

  const response = await fetch(`${API_URL}/api/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
      title: title || undefined,
      space: space || undefined,
      description: description || undefined,
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
  space?: string,
  title?: string,
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
      space: space || undefined,
      title: title || undefined,
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

/*
  Recapture — show the project again instead of ticking a box. Cheap
  text+vision call; deliberately never generates an image.
*/
export async function fetchRecapture(args: {
  nowPhotoUri: string;
  beforePhotoUri?: string;
  title?: string;
  vision?: string;
  description?: string;
  todayJobs: string[];
  remainingJobs: string[];
}): Promise<RecaptureResponse> {
  const [nowImage, beforeImage] = await Promise.all([
    fileToBase64(args.nowPhotoUri),
    args.beforePhotoUri
      ? fileToBase64(args.beforePhotoUri).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  const response = await fetch(`${API_URL}/api/recapture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nowImage,
      beforeImage,
      title: args.title || undefined,
      vision: args.vision || undefined,
      description: args.description || undefined,
      todayJobs: args.todayJobs,
      remainingJobs: args.remainingJobs,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(errorBody.error || `API error: ${response.status}`);
  }

  return response.json() as Promise<RecaptureResponse>;
}
