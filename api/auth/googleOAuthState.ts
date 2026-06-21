const GOOGLE_OAUTH_INTENT_STORAGE_KEY = "geumjeongyahak.googleOAuthIntent";

export type GoogleOAuthIntent = "login" | "connect";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function getGoogleOAuthIntent() {
  const intent = getStorage()?.getItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY);

  if (intent === "login" || intent === "connect") {
    return intent;
  }

  return null;
}

export function setGoogleOAuthIntent(intent: GoogleOAuthIntent) {
  getStorage()?.setItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY, intent);
}

export function clearGoogleOAuthIntent() {
  getStorage()?.removeItem(GOOGLE_OAUTH_INTENT_STORAGE_KEY);
}
