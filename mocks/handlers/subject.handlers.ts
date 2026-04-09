import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const SUBJECT_LIST_RESPONSE = [
  {
    id: 1,
    classroomId: 2,
    teacherId: 3,
    name: "English Reading",
    startAt: "2026-04-01",
    endAt: "2026-07-01",
    times: 12,
    dayOfWeek: "MONDAY",
    startTime: "14:00",
    endTime: "15:00",
    period: 1,
    description: "Reading class",
    isActive: true,
  },
];

export const SUBJECT_DETAIL_RESPONSE = SUBJECT_LIST_RESPONSE[0];

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const subjectHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/subjects`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(SUBJECT_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/subjects`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { classroomId?: number; teacherId?: number; name?: string };

    if (!body.classroomId || !body.teacherId || !body.name) {
      return HttpResponse.json({ message: "Invalid subject payload" }, { status: 400 });
    }

    return HttpResponse.json({
      ...SUBJECT_DETAIL_RESPONSE,
      id: 2,
      ...body,
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/subjects/:subjectId`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ ...SUBJECT_DETAIL_RESPONSE, id: Number(params.subjectId) });
  }),
  http.patch(`${API_BASE_URL}/api/v1/subjects/:subjectId`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...SUBJECT_DETAIL_RESPONSE,
      id: Number(params.subjectId),
      ...body,
    });
  }),
  http.delete(`${API_BASE_URL}/api/v1/subjects/:subjectId`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
