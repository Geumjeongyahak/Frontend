export const ACCESS_TOKEN_STORAGE_KEY = "geumjeongyahak.accessToken";
export const REFRESH_TOKEN_STORAGE_KEY = "geumjeongyahak.refreshToken";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
}

export function getRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? null;
}

export function setAccessToken(accessToken: string) {
  getStorage()?.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function setRefreshToken(refreshToken: string) {
  getStorage()?.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export function removeAccessToken() {
  getStorage()?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function removeRefreshToken() {
  getStorage()?.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function clearTokens() {
  removeAccessToken();
  removeRefreshToken();
}
