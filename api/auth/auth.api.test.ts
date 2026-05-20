/**
 * Tests the auth API module against MSW so login, signup, refresh, and logout
 * behavior stays aligned with the real axios clients and token storage.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../mocks/server";
import {
  API_BASE_URL,
  DEFAULT_LOGIN_REQUEST,
  DEFAULT_SIGNUP_REQUEST,
  REFRESHED_ACCESS_TOKEN,
  REFRESHED_REFRESH_TOKEN,
  VALID_ACCESS_TOKEN,
  VALID_REFRESH_TOKEN,
} from "../../mocks/handlers/auth.handlers";

import { getAccessToken, getRefreshToken, setTokens } from "../client/tokenStorage";
import {
  connectLocalAccount,
  googleLogin,
  googleSignup,
  login,
  logout,
  logoutAllDevices,
  refreshToken,
  signup,
} from "./auth.api";

describe("auth.api", () => {
  it("returns the login token DTO and stores the received tokens", async () => {
    const response = await login(DEFAULT_LOGIN_REQUEST);

    expect(response).toEqual({
      accessToken: VALID_ACCESS_TOKEN,
      refreshToken: VALID_REFRESH_TOKEN,
      tokenType: "Bearer",
    });
    expect(getAccessToken()).toBe(VALID_ACCESS_TOKEN);
    expect(getRefreshToken()).toBe(VALID_REFRESH_TOKEN);
  });

  it("throws an error when login fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () => {
        return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }),
    );

    await expect(login(DEFAULT_LOGIN_REQUEST)).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("sends the expected login request URL, method, and body", async () => {
    const observedRequest = {
      method: "",
      pathname: "",
      body: {} as unknown,
    };

    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, async ({ request }) => {
        observedRequest.method = request.method;
        observedRequest.pathname = new URL(request.url).pathname;
        observedRequest.body = await request.json();
        return HttpResponse.json({
          accessToken: VALID_ACCESS_TOKEN,
          refreshToken: VALID_REFRESH_TOKEN,
          tokenType: "Bearer",
        });
      }),
    );

    await login(DEFAULT_LOGIN_REQUEST);

    expect(observedRequest).toEqual({
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: DEFAULT_LOGIN_REQUEST,
    });
  });

  it("returns tokens for a successful signup", async () => {
    const response = await signup(DEFAULT_SIGNUP_REQUEST);

    expect(response.accessToken).toBe(VALID_ACCESS_TOKEN);
    expect(response.refreshToken).toBe(VALID_REFRESH_TOKEN);
  });

  it("throws an error when signup fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/signup`, () => {
        return HttpResponse.json({ message: "User already exists" }, { status: 409 });
      }),
    );

    await expect(signup(DEFAULT_SIGNUP_REQUEST)).rejects.toMatchObject({
      response: { status: 409 },
    });
  });

  it("returns refreshed tokens for a successful refresh request", async () => {
    const response = await refreshToken({ refreshToken: VALID_REFRESH_TOKEN });

    expect(response).toEqual({
      accessToken: REFRESHED_ACCESS_TOKEN,
      refreshToken: REFRESHED_REFRESH_TOKEN,
      tokenType: "Bearer",
    });
    expect(getAccessToken()).toBe(REFRESHED_ACCESS_TOKEN);
    expect(getRefreshToken()).toBe(REFRESHED_REFRESH_TOKEN);
  });

  it("throws an error when refresh fails", async () => {
    await expect(refreshToken({ refreshToken: "bad-refresh-token" })).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("calls logout successfully and clears stored tokens", async () => {
    setTokens(VALID_ACCESS_TOKEN, VALID_REFRESH_TOKEN);

    const response = await logout({ refreshToken: VALID_REFRESH_TOKEN });

    expect(response).toEqual({ message: "Logged out" });
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("calls logout-all successfully and clears stored tokens", async () => {
    setTokens(VALID_ACCESS_TOKEN, VALID_REFRESH_TOKEN);

    const response = await logoutAllDevices();

    expect(response).toEqual({ message: "Logged out from all devices" });
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("returns and stores tokens for Google auth flows", async () => {
    let observedSignupBody: unknown;
    let observedLoginBody: unknown;
    let observedConnectBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/google/signup`, async ({ request }) => {
        observedSignupBody = await request.json();
        return HttpResponse.json({
          accessToken: VALID_ACCESS_TOKEN,
          refreshToken: VALID_REFRESH_TOKEN,
          tokenType: "Bearer",
        });
      }),
      http.post(`${API_BASE_URL}/api/v1/auth/google/login`, async ({ request }) => {
        observedLoginBody = await request.json();
        return HttpResponse.json({
          accessToken: REFRESHED_ACCESS_TOKEN,
          refreshToken: REFRESHED_REFRESH_TOKEN,
          tokenType: "Bearer",
        });
      }),
      http.post(`${API_BASE_URL}/api/v1/auth/google/connect`, async ({ request }) => {
        observedConnectBody = await request.json();
        return HttpResponse.json({
          accessToken: VALID_ACCESS_TOKEN,
          refreshToken: VALID_REFRESH_TOKEN,
          tokenType: "Bearer",
        });
      }),
    );

    await googleSignup({
      tempToken: "temp-token",
      name: "User",
      phoneNumber: "010-0000-0000",
    });
    await googleLogin({ tempToken: "temp-token" });
    await connectLocalAccount({ tempToken: "temp-token" });

    expect(observedSignupBody).toEqual({
      tempToken: "temp-token",
      name: "User",
      phoneNumber: "010-0000-0000",
    });
    expect(observedLoginBody).toEqual({ tempToken: "temp-token" });
    expect(observedConnectBody).toEqual({ tempToken: "temp-token" });
    expect(getAccessToken()).toBe(VALID_ACCESS_TOKEN);
    expect(getRefreshToken()).toBe(VALID_REFRESH_TOKEN);
  });
});
