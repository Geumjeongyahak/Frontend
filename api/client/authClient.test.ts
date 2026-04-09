/**
 * Tests the authenticated axios client, including token injection, refresh,
 * retry, failure cleanup, and retry-loop prevention.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { login } from "../auth/auth.api";
import {
  API_BASE_URL,
  DEFAULT_LOGIN_REQUEST,
  EXPIRED_ACCESS_TOKEN,
  REFRESHED_ACCESS_TOKEN,
  REFRESHED_REFRESH_TOKEN,
  VALID_ACCESS_TOKEN,
  VALID_REFRESH_TOKEN,
} from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";

import authClient from "./authClient";
import { getAccessToken, getRefreshToken, setAccessToken, setTokens } from "./tokenStorage";

describe("authClient", () => {
  it("injects the Bearer token when an access token is stored", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = "not-checked";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/protected/header-check`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        return HttpResponse.json({ ok: true });
      }),
    );

    const response = await authClient.get("/api/v1/protected/header-check");

    expect(response.data).toEqual({ ok: true });
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
  });

  it("does not inject Authorization when there is no access token", async () => {
    let observedAuthorizationHeader: string | null = "not-checked";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/protected/header-check`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        return HttpResponse.json({ ok: true });
      }),
    );

    const response = await authClient.get("/api/v1/protected/header-check");

    expect(response.data).toEqual({ ok: true });
    expect(observedAuthorizationHeader).toBeNull();
  });

  it("logs in, stores tokens, and injects the access token into the next protected request", async () => {
    let observedAuthorizationHeader: string | null = "not-checked";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/protected/profile`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        return HttpResponse.json({ id: 1, name: "Protected User" });
      }),
    );

    const loginResponse = await login(DEFAULT_LOGIN_REQUEST);
    const protectedResponse = await authClient.get("/api/v1/protected/profile");

    expect(loginResponse.accessToken).toBe(VALID_ACCESS_TOKEN);
    expect(getAccessToken()).toBe(VALID_ACCESS_TOKEN);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(protectedResponse.data).toEqual({ id: 1, name: "Protected User" });
  });

  it("refreshes an expired access token and retries the original request", async () => {
    const observedProtectedHeaders: Array<string | null> = [];
    let refreshRequestCount = 0;

    setTokens(EXPIRED_ACCESS_TOKEN, VALID_REFRESH_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/protected/profile`, ({ request }) => {
        const authorizationHeader = request.headers.get("authorization");
        observedProtectedHeaders.push(authorizationHeader);

        if (authorizationHeader === `Bearer ${EXPIRED_ACCESS_TOKEN}`) {
          return HttpResponse.json({ message: "Access token expired" }, { status: 401 });
        }

        if (authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`) {
          return HttpResponse.json({ id: 1, refreshed: true });
        }

        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
      http.post(`${API_BASE_URL}/api/v1/auth/refresh`, async ({ request }) => {
        refreshRequestCount += 1;

        const body = await request.json();

        expect(body).toEqual({ refreshToken: VALID_REFRESH_TOKEN });

        return HttpResponse.json({
          accessToken: REFRESHED_ACCESS_TOKEN,
          refreshToken: REFRESHED_REFRESH_TOKEN,
          tokenType: "Bearer",
        });
      }),
    );

    const response = await authClient.get("/api/v1/protected/profile");

    expect(observedProtectedHeaders).toEqual([
      `Bearer ${EXPIRED_ACCESS_TOKEN}`,
      `Bearer ${REFRESHED_ACCESS_TOKEN}`,
    ]);
    expect(refreshRequestCount).toBe(1);
    expect(getAccessToken()).toBe(REFRESHED_ACCESS_TOKEN);
    expect(getRefreshToken()).toBe(REFRESHED_REFRESH_TOKEN);
    expect(response.data).toEqual({ id: 1, refreshed: true });
  });

  it("clears stored tokens and rejects when refresh fails", async () => {
    setTokens(EXPIRED_ACCESS_TOKEN, VALID_REFRESH_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/protected/profile`, () => {
        return HttpResponse.json({ message: "Access token expired" }, { status: 401 });
      }),
      http.post(`${API_BASE_URL}/api/v1/auth/refresh`, () => {
        return HttpResponse.json({ message: "Refresh expired" }, { status: 401 });
      }),
    );

    await expect(authClient.get("/api/v1/protected/profile")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("stops after a single retry to prevent infinite refresh loops", async () => {
    let protectedRequestCount = 0;
    let refreshRequestCount = 0;

    setTokens(EXPIRED_ACCESS_TOKEN, VALID_REFRESH_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/protected/profile`, () => {
        protectedRequestCount += 1;
        return HttpResponse.json({ message: "Still unauthorized" }, { status: 401 });
      }),
      http.post(`${API_BASE_URL}/api/v1/auth/refresh`, () => {
        refreshRequestCount += 1;
        return HttpResponse.json({
          accessToken: REFRESHED_ACCESS_TOKEN,
          refreshToken: REFRESHED_REFRESH_TOKEN,
          tokenType: "Bearer",
        });
      }),
    );

    await expect(authClient.get("/api/v1/protected/profile")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(protectedRequestCount).toBe(2);
    expect(refreshRequestCount).toBe(1);
  });
});
