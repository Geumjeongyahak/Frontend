import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const USER_LIST_RESPONSE = {
  content: [
    {
      id: 1,
      name: "Teacher One",
      nickname: "teacher-1",
      email: "teacher1@example.com",
      phoneNumber: "010-2222-3333",
      role: "VOLUNTEER",
      departmentId: 1,
      permissions: [{ name: "게시판 관리", code: "post:manage:*" }],
    },
  ],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

export const USER_DETAIL_RESPONSE = USER_LIST_RESPONSE.content[0];

export const TEACHER_CONTACT_LIST_RESPONSE = [
  {
    id: 1,
    name: "Teacher One",
    classroomName: "벚꽃반",
    phoneNumber: "010-2222-3333",
  },
];

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

    const body = (await request.json()) as {
      email?: string;
      nickname?: string;
      name?: string;
    };
    if (!body.email || !body.nickname || !body.name) {
      return HttpResponse.json({ message: "Invalid user payload" }, { status: 400 });
    }

    return HttpResponse.json({ ...USER_DETAIL_RESPONSE, ...body, id: 2 });
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
  http.get(`${API_BASE_URL}/api/v1/users/:userId/permissions`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(USER_DETAIL_RESPONSE.permissions);
  }),
  http.post(`${API_BASE_URL}/api/v1/users/:userId/permissions`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { permissionCode?: string };
    return HttpResponse.json([
      ...(USER_DETAIL_RESPONSE.permissions ?? []),
      { name: "추가 권한", code: body.permissionCode ?? "post:write:*" },
    ]);
  }),
  http.delete(`${API_BASE_URL}/api/v1/users/:userId/permissions`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { permissionCode?: string };
    return HttpResponse.json(
      (USER_DETAIL_RESPONSE.permissions ?? []).filter(
        (permission) => permission.code !== body.permissionCode,
      ),
    );
  }),
  http.get(`${API_BASE_URL}/api/v1/teachers/contact-list`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json(TEACHER_CONTACT_LIST_RESPONSE);
  }),
];
