import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  createJournal,
  getDailyScheduleDetail,
  getDailySchedules,
  getVolunteerHours,
  updateStudentAttendances,
  updateTeacherAttendance,
} from "./dailySchedule.api";

const DAILY_SCHEDULE_DETAIL = {
  dailyScheduleId: 1,
  lessonDate: "2026-06-01",
  classroomId: 2,
  classroomName: "한글반",
  teacherId: 3,
  teacherName: "홍길동",
  activityStartTime: "19:00:00",
  activityEndTime: "22:00:00",
  status: "SCHEDULED",
  lessonCount: 1,
  lessons: [{ lessonId: 10, period: 1, subjectName: "국어", note: null }],
};

describe("dailySchedule.api", () => {
  it("returns daily schedules with auth header and list query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/daily-schedules`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [DAILY_SCHEDULE_DETAIL],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getDailySchedules({ keyword: "한글", mine: true, page: 0, size: 10 });

    expect(response.content[0]).toMatchObject({ dailyScheduleId: 1, classroomName: "한글반" });
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("keyword=");
    expect(observedQueryString).toContain("mine=true");
    expect(observedQueryString).toContain("page=0");
    expect(observedQueryString).toContain("size=10");
  });

  it("returns detail and volunteer hours with expected query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedDetailQueryString = "";
    let observedVolunteerQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/daily-schedules/detail`, ({ request }) => {
        observedDetailQueryString = new URL(request.url).search;
        return HttpResponse.json(DAILY_SCHEDULE_DETAIL);
      }),
      http.get(`${API_BASE_URL}/api/v1/daily-schedules/volunteer-hours`, ({ request }) => {
        observedVolunteerQueryString = new URL(request.url).search;
        return HttpResponse.json({
          teacherId: 3,
          from: "2026-06-01",
          to: "2026-06-30",
          totalVolunteerServiceMinutes: 180,
          totalVolunteerServiceHours: 3,
        });
      }),
    );

    await expect(
      getDailyScheduleDetail({ classroomId: 2, lessonDate: "2026-06-01" }),
    ).resolves.toMatchObject({ dailyScheduleId: 1 });
    await expect(
      getVolunteerHours({ teacherId: 3, from: "2026-06-01", to: "2026-06-30" }),
    ).resolves.toMatchObject({ totalVolunteerServiceHours: 3 });

    expect(observedDetailQueryString).toContain("classroomId=2");
    expect(observedDetailQueryString).toContain("lessonDate=2026-06-01");
    expect(observedVolunteerQueryString).toContain("teacherId=3");
    expect(observedVolunteerQueryString).toContain("from=2026-06-01");
    expect(observedVolunteerQueryString).toContain("to=2026-06-30");
  });

  it("creates a journal with the expected request body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/daily-schedules/journal`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...DAILY_SCHEDULE_DETAIL,
          personalInfoConsent: true,
          residentRegistrationNumberPrefix: "900101",
        });
      }),
    );

    const body = {
      lessonDate: "2026-06-01",
      classroomId: 2,
      personalInfoConsent: true,
      residentRegistrationNumberPrefix: "900101",
      lessonJournals: [{ lessonId: 10, note: "수업 내용" }],
    };

    const response = await createJournal(body);

    expect(response).toMatchObject({ dailyScheduleId: 1, personalInfoConsent: true });
    expect(observedBody).toEqual(body);
  });

  it("updates teacher and student attendance with expected bodies", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedTeacherBody: unknown;
    let observedStudentBody: unknown;

    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/daily-schedules/1/teacher-attendance`,
        async ({ request }) => {
          observedTeacherBody = await request.json();
          return HttpResponse.json({
            ...DAILY_SCHEDULE_DETAIL,
            teacherAttendance: { attendanceId: 1, status: "PRESENT" },
          });
        },
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/daily-schedules/1/student-attendances`,
        async ({ request }) => {
          observedStudentBody = await request.json();
          return HttpResponse.json({
            ...DAILY_SCHEDULE_DETAIL,
            studentAttendances: [{ attendanceId: 1, studentId: 5, status: "ABSENT" }],
          });
        },
      ),
    );

    await updateTeacherAttendance(
      { dailyScheduleId: 1 },
      { status: "PRESENT", latitude: 35.2, longitude: 129.1 },
    );
    await updateStudentAttendances(
      { dailyScheduleId: 1 },
      { attendances: [{ studentId: 5, status: "ABSENT" }] },
    );

    expect(observedTeacherBody).toEqual({
      status: "PRESENT",
      latitude: 35.2,
      longitude: 129.1,
    });
    expect(observedStudentBody).toEqual({ attendances: [{ studentId: 5, status: "ABSENT" }] });
  });
});
