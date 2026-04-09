/**
 * Tests the unauthenticated axios client to ensure public requests stay free of
 * implicit auth headers while still returning MSW-backed responses.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import {
  API_BASE_URL,
  VALID_ACCESS_TOKEN,
} from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";

import { publicClient } from "./publicClient";
import { setAccessToken } from "./tokenStorage";

describe("publicClient", () => {
  it("does not attach an Authorization header automatically", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = "not-checked";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/public/ping`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        return HttpResponse.json({ ok: true });
      }),
    );

    const response = await publicClient.get("/api/v1/public/ping");

    expect(response.data).toEqual({ ok: true });
    expect(observedAuthorizationHeader).toBeNull();
  });

  it("returns the public API response payload", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/public/news`, () => {
        return HttpResponse.json({
          items: [{ id: 1, title: "Public notice" }],
        });
      }),
    );

    const response = await publicClient.get("/api/v1/public/news");

    expect(response.data).toEqual({
      items: [{ id: 1, title: "Public notice" }],
    });
  });
});
