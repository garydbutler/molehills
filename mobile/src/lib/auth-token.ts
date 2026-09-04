/*
  The signed JWT from /api/auth/mobile/*, kept in the Keychain.

  Why SecureStore and not AsyncStorage, which the rest of the store uses: this
  is a credential, not state. It authorises spend on our Gemini bill and is the
  identity the server counts quota against. AsyncStorage writes plaintext to
  the app container; SecureStore uses the iOS Keychain.

  Every read is best-effort. A missing or unreadable token is not an error —
  it means "signed out", and the caller should treat it that way.
*/
import * as SecureStore from "expo-secure-store";

const KEY = "molehill.authToken";

/* Cached so the request path doesn't hit the Keychain on every API call.
   Undefined means "not loaded yet", null means "loaded, nothing there". */
let cached: string | null | undefined;

export async function loadAuthToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    cached = await SecureStore.getItemAsync(KEY);
  } catch {
    // A locked or unavailable Keychain reads as signed out rather than
    // crashing the app on launch.
    cached = null;
  }
  return cached;
}

export async function setAuthToken(token: string): Promise<void> {
  cached = token;
  try {
    await SecureStore.setItemAsync(KEY, token);
  } catch (e) {
    // The in-memory copy still works for this session, so a failed write
    // degrades to "signed in until you quit" rather than a broken sign-in.
    console.warn("Could not persist auth token:", e);
  }
}

/* Read the claims out of a JWT without verifying it — the signature check
   happens server-side on every API call. Used to populate the local user
   record right after sign-in. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  cached = null;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (e) {
    console.warn("Could not clear auth token:", e);
  }
}
