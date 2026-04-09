/**
 * Tests representative lesson API functions: getLessons, createLesson,
 * updateLessonStatus, and getLessonDetail.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import {
  LESSON_DETAIL_RESPONSE,
  LESSON_LIST_RESPONSE,
} from "../../mocks/handlers/lesson.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createLesson, getLessonDetail, getLessons, updateLessonStatus } from "./lesson.api";

describe("lesson.api", () => {
  it("returns lessons with auth header and date range params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/lessons`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(LESSON_LIST_RESPONSE);
      }),
    );

    const response = await getLessons({ from: "2026-04-01", to: "2026-04-30" });

    expect(response).toEqual(LESSON_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("from=2026-04-01");
    expect(observedQueryString).toContain("to=2026-04-30");
  });

  it("creates a lesson with the expected POST body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/lessons`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...LESSON_DETAIL_RESPONSE,
          lessonId: 2,
          subjectName: "Created Subject",
        });
      }),
    );

    const response = await createLesson({
      subjectId: 11,
      teacherId: 22,
      date: "2026-04-15",
      startTime: "15:00",
      endTime: "16:00",
      period: 2,
    });

    expect(response.lessonId).toBe(2);
    expect(observedBody).toEqual({
      subjectId: 11,
      teacherId: 22,
      date: "2026-04-15",
      startTime: "15:00",
      endTime: "16:00",
      period: 2,
    });
  });

  it("updates lesson status using the expected PATCH endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedBody: unknown;

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/lessons/1/status`, async ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        observedBody = await request.json();
        return HttpResponse.json({
          ...LESSON_DETAIL_RESPONSE,
          lessonId: 1,
          status: "COMPLETED",
        });
      }),
    );

    const response = await updateLessonStatus({ lessonId: 1 }, { status: "COMPLETED" });

    expect(response.status).toBe("COMPLETED");
    expect(observedPathname).toBe("/api/v1/lessons/1/status");
    expect(observedBody).toEqual({ status: "COMPLETED" });
  });

  it("throws when lesson detail lookup fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/lessons/404`, () => {
        return HttpResponse.json({ message: "Lesson not found" }, { status: 404 });
      }),
    );

    await expect(getLessonDetail({ lessonId: 404 })).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});
