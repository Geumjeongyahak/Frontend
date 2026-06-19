import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const DEPARTMENT_LIST_RESPONSE = {
  departments: [{ id: 1, name: "Education", description: "Education team" }],
};

export const DEPARTMENT_DETAIL_RESPONSE = {
  id: 1,
  name: "Education",
  description: "Education team",
  permissions: [
    {
      id: 11,
      permissionCode: "channel:write:1",
      resourceCode: "channel",
      resourceLabel: "채널",
      actionCode: "write",
      actionLabel: "작성",
      scope: "target",
      targetId: 1,
      targetName: "1",
      source: "MEMBER",
    },
  ],
  users: [{ id: 10, name: "Teacher One", email: "teacher-1@example.com", role: "VOLUNTEER" }],
};

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

export const departmentHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/departments`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(DEPARTMENT_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/departments`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string; description?: string };

    if (!body.name || !body.description) {
      return HttpResponse.json({ message: "Invalid department payload" }, { status: 400 });
    }

    return HttpResponse.json({
      id: 2,
      name: body.name,
      description: body.description,
    });
  }),
  http.get(`${API_BASE_URL}/api/v1/departments/:id`, ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ ...DEPARTMENT_DETAIL_RESPONSE, id: Number(params.id) });
  }),
  http.put(`${API_BASE_URL}/api/v1/departments/:id`, async ({ request, params }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      permissions?: unknown[];
    };

    return HttpResponse.json({
      id: Number(params.id),
      name: body.name ?? DEPARTMENT_DETAIL_RESPONSE.name,
      description: body.description ?? DEPARTMENT_DETAIL_RESPONSE.description,
    });
  }),
  http.delete(`${API_BASE_URL}/api/v1/departments/:id`, ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
