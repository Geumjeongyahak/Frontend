import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createEvent, deleteEvent, getEvents, updateEvent } from "./event.api";

describe("event.api", () => {
  it("returns public events with date range query params", async () => {
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/events`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [{ id: 1, title: "문학의 밤", eventDate: "2026-05-13" }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getEvents({
      startDate: "2026-05-01",
      endDate: "2026-05-31",
    });

    expect(response.content?.[0]).toMatchObject({ id: 1, title: "문학의 밤" });
    expect(observedQueryString).toContain("startDate=2026-05-01");
    expect(observedQueryString).toContain("endDate=2026-05-31");
  });

  it("creates and updates events through admin endpoints", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedUpdateBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/admin/events`, async ({ request }) => {
        observedCreateBody = await request.json();
        return HttpResponse.json({ id: 2, title: "행사", eventDate: "2026-06-01" });
      }),
      http.patch(`${API_BASE_URL}/api/v1/admin/events/2`, async ({ request }) => {
        observedUpdateBody = await request.json();
        return HttpResponse.json({ id: 2, title: "수정 행사", eventDate: "2026-06-02" });
      }),
    );

    await expect(
      createEvent({ title: "행사", eventDate: "2026-06-01" }),
    ).resolves.toMatchObject({ id: 2 });
    await expect(updateEvent({ eventId: 2 }, { title: "수정 행사" })).resolves.toMatchObject({
      title: "수정 행사",
    });

    expect(observedCreateBody).toEqual({ title: "행사", eventDate: "2026-06-01" });
    expect(observedUpdateBody).toEqual({ title: "수정 행사" });
  });

  it("deletes an event through the admin endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";

    server.use(
      http.delete(`${API_BASE_URL}/api/v1/admin/events/2`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await deleteEvent({ eventId: 2 });

    expect(observedPathname).toBe("/api/v1/admin/events/2");
  });
});
