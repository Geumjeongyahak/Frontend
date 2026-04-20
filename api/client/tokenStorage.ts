export const ACCESS_TOKEN_STORAGE_KEY = "geumjeongyahak.accessToken";
export const REFRESH_TOKEN_STORAGE_KEY = "geumjeongyahak.refreshToken";
export const AUTH_TOKEN_CHANGE_EVENT = "geumjeongyahak:auth-token-change";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function notifyTokenChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
}

export function getRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? null;
}

export function setAccessToken(accessToken: string) {
  getStorage()?.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  notifyTokenChange();
}

export function setRefreshToken(refreshToken: string) {
  getStorage()?.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  notifyTokenChange();
}

export function removeAccessToken() {
  getStorage()?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  notifyTokenChange();
}

export function removeRefreshToken() {
  getStorage()?.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  notifyTokenChange();
}

export function setTokens(accessToken: string, refreshToken: string) {
  const storage = getStorage();

  storage?.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  storage?.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  notifyTokenChange();
}

export function clearTokens() {
  const storage = getStorage();

  storage?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage?.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  notifyTokenChange();
}
