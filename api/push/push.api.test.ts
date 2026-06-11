import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  getAdminPushConfig,
  sendAdminPushDiagnostics,
  subscribeAdminPush,
  subscribePush,
  unsubscribeAdminPush,
  unsubscribePush,
} from "./push.api";

describe("push.api", () => {
  it("subscribes push notifications with expected body and auth header", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/push/subscriptions`, async ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedBody = await request.json();
        return HttpResponse.json({
          id: 1,
          userId: 10,
          deviceType: "WEB",
          active: true,
          subscribedAt: "2026-06-01T10:00:00",
          failureCount: 0,
        });
      }),
    );

    const body = {
      token: "fcm-token",
      deviceType: "WEB" as const,
    };

    const response = await subscribePush(body);

    expect(response).toMatchObject({ id: 1, deviceType: "WEB", active: true });
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedBody).toEqual(body);
  });

  it("unsubscribes push notifications through the expected endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";

    server.use(
      http.delete(`${API_BASE_URL}/api/v1/push/subscriptions/1`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await unsubscribePush({ subscriptionId: 1 });

    expect(observedPathname).toBe("/api/v1/push/subscriptions/1");
  });

  it("supports admin push config, diagnostics, subscription and unsubscribe routes", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const observedPaths: string[] = [];
    let observedDiagnosticBody: unknown;
    let observedSubscribeBody: unknown;

    server.use(
      http.get(`${API_BASE_URL}/admin/push/config`, ({ request }) => {
        observedPaths.push(new URL(request.url).pathname);
        return HttpResponse.json({ enabled: true, projectId: "geumjeong" });
      }),
      http.post(`${API_BASE_URL}/admin/push/diagnostics`, async ({ request }) => {
        observedPaths.push(new URL(request.url).pathname);
        observedDiagnosticBody = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
      http.post(`${API_BASE_URL}/admin/push/subscriptions`, async ({ request }) => {
        observedPaths.push(new URL(request.url).pathname);
        observedSubscribeBody = await request.json();
        return HttpResponse.json({ id: 2, userId: 10, deviceType: "WEB", active: true });
      }),
      http.delete(`${API_BASE_URL}/admin/push/subscriptions/2`, ({ request }) => {
        observedPaths.push(new URL(request.url).pathname);
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await expect(getAdminPushConfig()).resolves.toMatchObject({ enabled: true });
    await sendAdminPushDiagnostics({ step: "register", message: "ok" });
    await expect(
      subscribeAdminPush({ token: "admin-fcm-token", deviceType: "WEB" }),
    ).resolves.toMatchObject({ id: 2 });
    await unsubscribeAdminPush({ subscriptionId: 2 });

    expect(observedPaths).toEqual([
      "/admin/push/config",
      "/admin/push/diagnostics",
      "/admin/push/subscriptions",
      "/admin/push/subscriptions/2",
    ]);
    expect(observedDiagnosticBody).toEqual({ step: "register", message: "ok" });
    expect(observedSubscribeBody).toEqual({ token: "admin-fcm-token", deviceType: "WEB" });
  });
});
