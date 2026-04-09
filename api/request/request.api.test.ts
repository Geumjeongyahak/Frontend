/**
 * Tests representative request API functions across absence, purchase, lesson
 * exchange, and subject exchange flows.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import {
  ABSENCE_REQUEST_RESPONSE,
  LESSON_EXCHANGE_REQUEST_RESPONSE,
  SUBJECT_EXCHANGE_REQUEST_RESPONSE,
} from "../../mocks/handlers/request.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  approveSubjectExchangeRequest,
  createLessonExchangeRequest,
  getAbsenceRequests,
} from "./request.api";

describe("request.api", () => {
  it("returns absence requests with auth header and status query", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/absence-requests`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json([ABSENCE_REQUEST_RESPONSE]);
      }),
    );

    const response = await getAbsenceRequests({ status: "PENDING" });

    expect(response).toEqual([ABSENCE_REQUEST_RESPONSE]);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("status=PENDING");
  });

  it("creates a lesson exchange request with the expected body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...LESSON_EXCHANGE_REQUEST_RESPONSE,
          id: 30,
          lessonId: 22,
          title: "Emergency swap",
          content: "Need a replacement",
        });
      }),
    );

    const response = await createLessonExchangeRequest({
      lessonId: 22,
      title: "Emergency swap",
      content: "Need a replacement",
    });

    expect(response.id).toBe(30);
    expect(observedBody).toEqual({
      lessonId: 22,
      title: "Emergency swap",
      content: "Need a replacement",
    });
  });

  it("approves a subject exchange request through the expected endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedBody: unknown;

    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/subject-exchange-requests/4/approve`,
        async ({ request }) => {
          observedPathname = new URL(request.url).pathname;
          observedBody = await request.json();
          return HttpResponse.json({
            ...SUBJECT_EXCHANGE_REQUEST_RESPONSE,
            id: 4,
            status: "APPROVED",
            approvalByName: "User 77",
          });
        },
      ),
    );

    const response = await approveSubjectExchangeRequest(
      { requestId: 4 },
      { exchangeWithUserId: 77 },
    );

    expect(response.status).toBe("APPROVED");
    expect(observedPathname).toBe("/api/v1/subject-exchange-requests/4/approve");
    expect(observedBody).toEqual({ exchangeWithUserId: 77 });
  });

  it("throws when a subject exchange approval fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/subject-exchange-requests/999/approve`, () => {
        return HttpResponse.json({ message: "Request not found" }, { status: 404 });
      }),
    );

    await expect(
      approveSubjectExchangeRequest({ requestId: 999 }, { exchangeWithUserId: 77 }),
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});
