import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const USER_LIST_RESPONSE = {
  content: [
    {
      id: 1,
      username: "teacher-1",
      name: "Teacher One",
      email: "teacher1@example.com",
      phoneNumber: "010-2222-3333",
      roles: [{ name: "TEACHER", level: 1, code: 101 }],
    },
  ],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

export const USER_DETAIL_RESPONSE = USER_LIST_RESPONSE.content[0];

function hasValidAuthorization(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return (
    authorizationHeader === `Bearer ${VALID_ACCESS_TOKEN}` ||
    authorizationHeader === `Bearer ${REFRESHED_ACCESS_TOKEN}`
  );
}

function unauthorizedWhenNeeded(request: Request) {
  if (!hasValidAuthorization(request)) {
    return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export const userHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/users`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(USER_LIST_RESPONSE);
  }),
  http.post(`${API_BASE_URL}/api/v1/users`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { username?: string; name?: string; email?: string };
    if (!body.username || !body.name) {
      return HttpResponse.json({ message: "Invalid user payload" }, { status: 400 });
    }

    return HttpResponse.json({ id: 2, ...USER_DETAIL_RESPONSE, ...body });
  }),
  http.get(`${API_BASE_URL}/api/v1/users/me`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(USER_DETAIL_RESPONSE);
  }),
  http.patch(`${API_BASE_URL}/api/v1/users/me`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...USER_DETAIL_RESPONSE, ...body });
  }),
  http.get(`${API_BASE_URL}/api/v1/users/:userId`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({ ...USER_DETAIL_RESPONSE, id: Number(params.userId) })
    );
  }),
  http.patch(`${API_BASE_URL}/api/v1/users/:userId`, async ({ request, params }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...USER_DETAIL_RESPONSE, id: Number(params.userId), ...body });
  }),
  http.delete(`${API_BASE_URL}/api/v1/users/:userId`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API_BASE_URL}/api/v1/users/:userId/roles`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(USER_DETAIL_RESPONSE.roles);
  }),
  http.post(`${API_BASE_URL}/api/v1/users/:userId/roles`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { subRole?: string };
    return HttpResponse.json([
      ...(USER_DETAIL_RESPONSE.roles ?? []),
      { name: body.subRole ?? "ASSISTANT", level: 2, code: 202 },
    ]);
  }),
  http.delete(`${API_BASE_URL}/api/v1/users/:userId/roles`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { subRole?: string };
    return HttpResponse.json(
      (USER_DETAIL_RESPONSE.roles ?? []).filter((role) => role.name !== body.subRole),
    );
  }),
  http.get(`${API_BASE_URL}/api/v1/users/:userId/departments`, ({ request }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({
        departments: [{ id: 1, name: "Education", description: "Education team" }],
      })
    );
  }),
  http.get(`${API_BASE_URL}/api/v1/users/me/departments`, ({ request }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({
        departments: [{ id: 1, name: "Education", description: "Education team" }],
      })
    );
  }),
  http.post(`${API_BASE_URL}/api/v1/users/:userId/departments`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 204 });
  }),
  http.delete(
    `${API_BASE_URL}/api/v1/users/:userId/departments/:departmentId`,
    ({ request }) => {
      return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 204 });
    },
  ),
];
