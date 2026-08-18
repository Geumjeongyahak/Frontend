const GOOGLE_OAUTH_INTENT_STORAGE_KEY = "geumjeongyahak.googleOAuthIntent";

export type GoogleOAuthIntent = "login" | "connect";

type GoogleOAuthState = {
  intent: GoogleOAuthIntent;
  returnTo?: string;
};

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function getGoogleOAuthIntent() {
  const storedState = getStorage()?.getItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY);

  if (!storedState) {
    return null;
  }

  try {
    const state = JSON.parse(storedState) as GoogleOAuthState;

    if (state.intent === "login" || state.intent === "connect") {
      return state.intent;
    }
  } catch {
    if (storedState === "login" || storedState === "connect") {
      return storedState;
    }
  }

  return null;
}

export function getGoogleOAuthReturnTo() {
  const storedState = getStorage()?.getItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY);

  if (!storedState) {
    return null;
  }

  try {
    const state = JSON.parse(storedState) as GoogleOAuthState;
    return state.returnTo ?? null;
  } catch {
    return null;
  }
}

export function setGoogleOAuthIntent(intent: GoogleOAuthIntent, returnTo?: string) {
  const state: GoogleOAuthState = { intent, returnTo };
  getStorage()?.setItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY, JSON.stringify(state));
}

export function clearGoogleOAuthIntent() {
  getStorage()?.removeItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY);
}
