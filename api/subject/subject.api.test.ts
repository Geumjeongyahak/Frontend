/**
 * Tests representative subject API functions: getSubjects, createSubject,
 * and updateSubject.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { SUBJECT_LIST_RESPONSE } from "../../mocks/handlers/subject.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  assignSubjectTeacher,
  createSubject,
  getSubjects,
  updateSubject,
  updateSubjectSchedule,
} from "./subject.api";

describe("subject.api", () => {
  it("returns subjects with auth header and classroom query", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/subjects`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(SUBJECT_LIST_RESPONSE);
      }),
    );

    const response = await getSubjects({ classroomId: 2 });

    expect(response).toEqual(SUBJECT_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("classroomId=2");
  });

  it("creates a subject with the expected POST body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/subjects`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...SUBJECT_LIST_RESPONSE[0],
          id: 2,
          name: "English Writing",
        });
      }),
    );

    const response = await createSubject({
      classroomId: 2,
      teacherId: 3,
      name: "English Writing",
      startAt: "2026-04-01",
      endAt: "2026-06-30",
      dayOfWeek: "MONDAY",
      startTime: "16:00",
      endTime: "17:00",
      period: 2,
      description: "Writing practice",
    });

    expect(response.id).toBe(2);
    expect(observedBody).toEqual({
      classroomId: 2,
      teacherId: 3,
      name: "English Writing",
      startAt: "2026-04-01",
      endAt: "2026-06-30",
      dayOfWeek: "MONDAY",
      startTime: "16:00",
      endTime: "17:00",
      period: 2,
      description: "Writing practice",
    });
  });

  it("updates subject teacher and schedule through dedicated Swagger routes", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedTeacherBody: unknown;
    let observedScheduleBody: unknown;

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/subjects/1/teacher`, async ({ request }) => {
        observedTeacherBody = await request.json();
        return HttpResponse.json({ ...SUBJECT_LIST_RESPONSE[0], teacherId: 5 });
      }),
      http.patch(`${API_BASE_URL}/api/v1/subjects/1/schedule`, async ({ request }) => {
        observedScheduleBody = await request.json();
        return HttpResponse.json({ ...SUBJECT_LIST_RESPONSE[0], period: 2 });
      }),
    );

    await expect(assignSubjectTeacher({ subjectId: 1 }, { teacherId: 5 })).resolves.toMatchObject({
      teacherId: 5,
    });
    await expect(
      updateSubjectSchedule({ subjectId: 1 }, { dayOfWeek: "TUESDAY", period: 2 }),
    ).resolves.toMatchObject({ period: 2 });

    expect(observedTeacherBody).toEqual({ teacherId: 5 });
    expect(observedScheduleBody).toEqual({ dayOfWeek: "TUESDAY", period: 2 });
  });

  it("throws when updating a missing subject fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/subjects/999`, () => {
        return HttpResponse.json({ message: "Subject not found" }, { status: 404 });
      }),
    );

    await expect(
      updateSubject({ subjectId: 999 }, { name: "Missing Subject" }),
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});
