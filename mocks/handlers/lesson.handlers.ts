import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const LESSON_LIST_RESPONSE = [
  {
    lessonId: 1,
    date: "2026-04-10",
    period: 1,
    startTime: "14:00",
    endTime: "15:00",
    teacherName: "Teacher One",
    subjectName: "English",
  },
];

export const LESSON_DETAIL_RESPONSE = {
  lessonId: 1,
  date: "2026-04-10",
  period: 1,
  startTime: "14:00",
  endTime: "15:00",
  status: "SCHEDULED",
  teacherAttendance: "PRESENT",
  teacherName: "Teacher One",
  subjectName: "English",
  note: "Bring workbook",
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const lessonHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/lessons`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(LESSON_LIST_RESPONSE);
  }),
  http.get(`${API_BASE_URL}/api/v1/lessons/me`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(LESSON_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/lessons`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      subjectId?: number;
      teacherId?: number;
      date?: string;
      startTime?: string;
      endTime?: string;
      period?: number;
    };

    if (!body.subjectId || !body.teacherId) {
      return HttpResponse.json({ message: "Invalid lesson payload" }, { status: 400 });
    }

    return HttpResponse.json({
      ...LESSON_DETAIL_RESPONSE,
      lessonId: 2,
      subjectName: "Created Subject",
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      period: body.period,
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/lessons/:lessonId`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ ...LESSON_DETAIL_RESPONSE, lessonId: Number(params.lessonId) });
  }),
  http.patch(`${API_BASE_URL}/api/v1/lessons/:lessonId`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...LESSON_DETAIL_RESPONSE,
      lessonId: Number(params.lessonId),
      ...body,
    });
  }),
  http.delete(`${API_BASE_URL}/api/v1/lessons/:lessonId`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API_BASE_URL}/api/v1/lessons/:lessonId/note`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ lessonId: Number(params.lessonId), note: LESSON_DETAIL_RESPONSE.note });
  }),
  http.put(`${API_BASE_URL}/api/v1/lessons/:lessonId/note`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { note?: string };

    return HttpResponse.json({
      lessonId: Number(params.lessonId),
      note: body.note ?? "",
    });
  }),
  http.patch(`${API_BASE_URL}/api/v1/lessons/:lessonId/status`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { status?: string };
    return HttpResponse.json({
      ...LESSON_DETAIL_RESPONSE,
      lessonId: Number(params.lessonId),
      status: body.status ?? LESSON_DETAIL_RESPONSE.status,
    });
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/lessons/:lessonId/teacher-attendance`,
    async ({ request, params }) => {
      if (!hasValidAuthorization(request)) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as { status?: string };
      return HttpResponse.json({
        ...LESSON_DETAIL_RESPONSE,
        lessonId: Number(params.lessonId),
        teacherAttendance: body.status ?? LESSON_DETAIL_RESPONSE.teacherAttendance,
      });
    },
  ),
  http.get(`${API_BASE_URL}/api/v1/lessons/:lessonId/student-attendances`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json([
      { studentId: 1, studentName: "Student One", status: "PRESENT", memo: "" },
    ]);
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/lessons/:lessonId/student-attendances`,
    async ({ request }) => {
      if (!hasValidAuthorization(request)) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as {
        attendances?: Array<{ studentId: number; status: string; memo?: string }>;
      };
      return HttpResponse.json(body.attendances ?? []);
    },
  ),
];
