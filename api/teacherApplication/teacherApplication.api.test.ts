import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  approveTeacherApplication,
  createTeacherApplication,
  getAvailableTeacherSchedules,
  getTeacherApplications,
  rejectTeacherApplication,
} from "./teacherApplication.api";
import type { CreateTeacherApplicationRequestDto } from "./teacherApplication.dto";

const APPLICATION_BODY: CreateTeacherApplicationRequestDto = {
  birthDate: "1999-03-15",
  phoneNumber: "010-0000-0000",
  email: "hong@example.com",
  address: "부산광역시 금정구",
  educationAndMajor: "부산대학교 국어국문학과",
  preferredSubjectId: 3,
  motivation: "지원 동기",
  desiredTeacherImage: "희망 교사상",
  meaningOfSharing: "나눔의 의미",
};

describe("teacherApplication.api", () => {
  it("submits a teacher application with the expected body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/teacher-applications`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ id: 1, status: "PENDING", ...APPLICATION_BODY });
      }),
    );

    const response = await createTeacherApplication(APPLICATION_BODY);

    expect(response).toMatchObject({ id: 1, status: "PENDING" });
    expect(observedBody).toEqual(APPLICATION_BODY);
  });

  it("returns admin teacher applications with filters", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/admin/teacher-applications`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [{ id: 1, applicantName: "홍길동", status: "PENDING" }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getTeacherApplications({ keyword: "홍길동", status: "PENDING" });

    expect(response.content?.[0]).toMatchObject({ applicantName: "홍길동" });
    expect(observedQueryString).toContain("keyword=");
    expect(observedQueryString).toContain("status=PENDING");
  });

  it("returns available teacher schedules for application choices", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/teacher-applications/available-schedules`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        return HttpResponse.json([
          {
            scheduleKey: "1:FRIDAY:2026-03-01:2026-06-30",
            classroomId: 1,
            classroomName: "벚꽃반",
            dayOfWeek: "FRIDAY",
            subjectIds: [100, 101],
            subjects: [{ subjectId: 100, subjectName: "국어", period: 1 }],
          },
        ]);
      }),
    );

    const response = await getAvailableTeacherSchedules();

    expect(response[0]).toMatchObject({ classroomName: "벚꽃반", subjectIds: [100, 101] });
    expect(observedPathname).toBe("/api/v1/teacher-applications/available-schedules");
  });

  it("approves and rejects teacher applications through admin endpoints", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedApproveBody: unknown;
    let observedRejectBody: unknown;

    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/admin/teacher-applications/1/approve`,
        async ({ request }) => {
          observedApproveBody = await request.json();
          return HttpResponse.json({ id: 1, status: "APPROVED" });
        },
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/admin/teacher-applications/2/reject`,
        async ({ request }) => {
          observedRejectBody = await request.json();
          return HttpResponse.json({ id: 2, status: "REJECTED" });
        },
      ),
    );

    await approveTeacherApplication(
      { applicationId: 1 },
      {
        assignedSubjectIds: [1, 2],
        teacherStartAt: "2026-06-01",
        teacherEndAt: "2026-12-31",
        note: "승인",
      },
    );
    await rejectTeacherApplication({ applicationId: 2 }, { note: "반려" });

    expect(observedApproveBody).toEqual({
      assignedSubjectIds: [1, 2],
      teacherStartAt: "2026-06-01",
      teacherEndAt: "2026-12-31",
      note: "승인",
    });
    expect(observedRejectBody).toEqual({ note: "반려" });
  });
});
