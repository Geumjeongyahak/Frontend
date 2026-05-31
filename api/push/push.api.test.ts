import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { subscribePush, unsubscribePush } from "./push.api";

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
          endpoint: "https://push.example.com/subscription",
          createdAt: "2026-06-01T10:00:00",
        });
      }),
    );

    const body = {
      endpoint: "https://push.example.com/subscription",
      keys: {
        p256dh: "p256dh-key",
        auth: "auth-key",
      },
    };

    const response = await subscribePush(body);

    expect(response).toMatchObject({ id: 1, endpoint: body.endpoint });
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
});
