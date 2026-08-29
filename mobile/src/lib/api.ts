import { File } from "expo-file-system";

import { API_URL } from "@/lib/site";
import { loadAuthToken } from "@/lib/auth-token";

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
  upgrade?: boolean;
};

/*
  A refusal from the server, as opposed to a service failure.

  The distinction matters: callers fall back to a local plan when the vision
  service is down, but must NOT do that when the answer was "you are out of
  plans" — that would hand out the very thing the user is being asked to pay
  for.
*/
export class ApiRefusal extends Error {
  constructor(
    message: string,
    readonly status: number,
    /* True when subscribing would actually lift the limit. False for a pro
       user who has spent their 30-day window — a paywall helps nobody there. */
    readonly upgrade: boolean,
  ) {
    super(message);
    this.name = "ApiRefusal";
  }

  /* 401 unauthenticated, 402 out of quota, 429 too many looks. */
  static is(e: unknown): e is ApiRefusal {
    return e instanceof ApiRefusal;
  }
}

/* The three endpoints below each cost money server-side, so all of them are
   authenticated. A missing token still sends the request — the server answers
   401 and the existing error path surfaces "Sign in to continue." */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await loadAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fileToBase64(uri: string): Promise<string> {
  const file = new File(uri);
  const base64 = file.base64Sync();
  return base64;
}

export async function fetchPlan(
  photoUri: string | undefined,
  description?: string,
): Promise<PlanResponse> {
  const base64Image = photoUri ? await fileToBase64(photoUri) : undefined;

  const response = await fetch(`${API_URL}/api/plan`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      image: base64Image,
      description: description || undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError;
    const message = errorBody.error || `API error: ${response.status}`;
    if ([401, 402, 429].includes(response.status)) {
      throw new ApiRefusal(message, response.status, errorBody.upgrade === true);
    }
    throw new Error(message);
  }

  return response.json() as Promise<PlanResponse>;
}

export async function fetchEndState(
  photoUri: string,
  vision?: string,
  space?: string,
  title?: string,
  /* Server bounds image-generation retries per project. */
  projectId?: string,
): Promise<EndStateResponse> {
  const base64Image = await fileToBase64(photoUri);

  const response = await fetch(`${API_URL}/api/end-state`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      image: base64Image,
      vision: vision || undefined,
      space: space || undefined,
      title: title || undefined,
      projectId,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError;
    const message = errorBody.error || `API error: ${response.status}`;
    if ([401, 402, 429].includes(response.status)) {
      throw new ApiRefusal(message, response.status, errorBody.upgrade === true);
    }
    throw new Error(message);
  }

  return response.json() as Promise<EndStateResponse>;
}

/*
  Recapture — show the project again instead of ticking a box. Cheap
  text+vision call; deliberately never generates an image.

  Show it with a photo (nowPhotoUri) or with a sentence (note). Never both —
  a project that can be photographed doesn't need the words, and one that
  can't must never be asked for a picture of private work.
*/
export async function fetchRecapture(args: {
  nowPhotoUri?: string;
  note?: string;
  beforePhotoUri?: string;
  title?: string;
  vision?: string;
  description?: string;
  /* The user's local day, so the server's daily ceiling lines up with the
     count the app shows them. */
  day: string;
  todayJobs: string[];
  remainingJobs: string[];
}): Promise<RecaptureResponse> {
  const [nowImage, beforeImage] = await Promise.all([
    args.nowPhotoUri
      ? fileToBase64(args.nowPhotoUri)
      : Promise.resolve(undefined),
    // The "before" is only ever context for a photo comparison.
    args.nowPhotoUri && args.beforePhotoUri
      ? fileToBase64(args.beforePhotoUri).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  const response = await fetch(`${API_URL}/api/recapture`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      nowImage,
      beforeImage,
      note: args.note || undefined,
      day: args.day,
      title: args.title || undefined,
      vision: args.vision || undefined,
      description: args.description || undefined,
      todayJobs: args.todayJobs,
      remainingJobs: args.remainingJobs,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiError;
    const message = errorBody.error || `API error: ${response.status}`;
    if ([401, 402, 429].includes(response.status)) {
      throw new ApiRefusal(message, response.status, errorBody.upgrade === true);
    }
    throw new Error(message);
  }

  return response.json() as Promise<RecaptureResponse>;
}
