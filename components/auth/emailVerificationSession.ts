const PENDING_EMAIL_VERIFICATION_EMAIL_KEY = "gjlearn.pendingEmailVerificationEmail";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function getPendingEmailVerificationEmail() {
  return getStorage()?.getItem(PENDING_EMAIL_VERIFICATION_EMAIL_KEY) ?? null;
}

export function setPendingEmailVerificationEmail(email: string) {
  getStorage()?.setItem(PENDING_EMAIL_VERIFICATION_EMAIL_KEY, email);
}

export function clearPendingEmailVerificationEmail() {
  getStorage()?.removeItem(PENDING_EMAIL_VERIFICATION_EMAIL_KEY);
}
