import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const CLASSROOM_LIST_RESPONSE = {
  content: [{ id: 1, name: "Blue Room", type: "LECTURE", description: "Main classroom" }],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

export const CLASSROOM_DETAIL_RESPONSE = {
  id: 1,
  name: "Blue Room",
  type: "LECTURE",
  description: "Main classroom",
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const classroomHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/classrooms`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(CLASSROOM_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/classrooms`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string; type?: string; description?: string };

    if (!body.name || !body.type) {
      return HttpResponse.json({ message: "Invalid classroom payload" }, { status: 400 });
    }

    return HttpResponse.json({
      id: 2,
      name: body.name,
      type: body.type,
      description: body.description ?? "",
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/classrooms/:id`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      ...CLASSROOM_DETAIL_RESPONSE,
      id: Number(params.id),
    });
  }),
  http.put(`${API_BASE_URL}/api/v1/classrooms/:id`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string; type?: string; description?: string };

    return HttpResponse.json({
      id: Number(params.id),
      name: body.name ?? CLASSROOM_DETAIL_RESPONSE.name,
      type: body.type ?? CLASSROOM_DETAIL_RESPONSE.type,
      description: body.description ?? CLASSROOM_DETAIL_RESPONSE.description,
    });
  }),
  http.delete(`${API_BASE_URL}/api/v1/classrooms/:id`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
