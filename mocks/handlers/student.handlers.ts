import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const STUDENT_LIST_RESPONSE = {
  content: [{ id: 1, name: "Kim Student", phoneNumber: "010-1111-2222", status: "ENROLLED" }],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

export const STUDENT_DETAIL_RESPONSE = {
  id: 1,
  name: "Kim Student",
  phoneNumber: "010-1111-2222",
  description: "Middle school student",
  status: "ENROLLED",
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const studentHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/students`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(STUDENT_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/students`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string; phoneNumber?: string; description?: string };

    if (!body.name) {
      return HttpResponse.json({ message: "Invalid student payload" }, { status: 400 });
    }

    return HttpResponse.json({
      id: 2,
      name: body.name,
      phoneNumber: body.phoneNumber,
      description: body.description,
      status: "ENROLLED",
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/students/:studentId`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ ...STUDENT_DETAIL_RESPONSE, id: Number(params.studentId) });
  }),
  http.patch(`${API_BASE_URL}/api/v1/students/:studentId`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...STUDENT_DETAIL_RESPONSE,
      id: Number(params.studentId),
      ...body,
    });
  }),
  http.delete(`${API_BASE_URL}/api/v1/students/:studentId`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
