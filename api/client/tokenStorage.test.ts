/**
 * Tests the browser token storage helpers so auth-related API tests can rely on
 * predictable access/refresh token persistence behavior.
 */
import "../../test/setup";

import { describe, expect, it, vi } from "vitest";

import {
  ACCESS_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_CHANGE_EVENT,
  REFRESH_TOKEN_STORAGE_KEY,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
  setTokens,
} from "./tokenStorage";

describe("tokenStorage", () => {
  it("stores and reads the access token", () => {
    setAccessToken("stored-access-token");

    expect(getAccessToken()).toBe("stored-access-token");
  });

  it("removes the access token", () => {
    setAccessToken("stored-access-token");

    removeAccessToken();

    expect(getAccessToken()).toBeNull();
  });

  it("stores and reads the refresh token", () => {
    setRefreshToken("stored-refresh-token");

    expect(getRefreshToken()).toBe("stored-refresh-token");
  });

  it("removes the refresh token", () => {
    setRefreshToken("stored-refresh-token");

    removeRefreshToken();

    expect(getRefreshToken()).toBeNull();
  });

  it("returns null when no tokens are stored", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("uses separate storage keys for access and refresh tokens", () => {
    setTokens("access-token", "refresh-token");

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe("access-token");
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe("refresh-token");
  });

  it("clears both tokens together", () => {
    setTokens("access-token", "refresh-token");

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("notifies listeners when token state changes", () => {
    const listener = vi.fn();

    window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);

    setTokens("access-token", "refresh-token");
    clearTokens();

    window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
