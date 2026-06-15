/**
 * Tests representative user API functions: getUsers, updateCurrentUser,
 * and removeUserPermission.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { USER_LIST_RESPONSE } from "../../mocks/handlers/user.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  getAssignablePermissions,
  getTeacherContacts,
  getUsers,
  removeUserPermission,
  updateUser,
  updateCurrentUser,
} from "./user.api";

describe("user.api", () => {
  it("returns users with auth header and pagination params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(USER_LIST_RESPONSE);
      }),
    );

    const response = await getUsers({ page: 0, size: 10 });

    expect(response).toEqual(USER_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("page=0");
    expect(observedQueryString).toContain("size=10");
  });

  it("updates the current user with the expected PATCH body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/users/me`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...USER_LIST_RESPONSE.content[0],
          name: "Updated Teacher",
        });
      }),
    );

    const response = await updateCurrentUser({
      name: "Updated Teacher",
      email: "updated@example.com",
    });

    expect(response.name).toBe("Updated Teacher");
    expect(observedBody).toEqual({
      name: "Updated Teacher",
      email: "updated@example.com",
    });
  });

  it("updates a user with departmentId in the expected PATCH body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/users/1`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...USER_LIST_RESPONSE.content[0],
          departmentId: 2,
        });
      }),
    );

    const response = await updateUser(
      { userId: 1 },
      {
        name: "Teacher One",
        email: "teacher1@example.com",
        phoneNumber: "010-2222-3333",
        role: "VOLUNTEER",
        departmentId: 2,
      },
    );

    expect(response.departmentId).toBe(2);
    expect(observedBody).toEqual({
      name: "Teacher One",
      email: "teacher1@example.com",
      phoneNumber: "010-2222-3333",
      role: "VOLUNTEER",
      departmentId: 2,
    });
  });

  it("sends DELETE body data when removing a user permission", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.delete(`${API_BASE_URL}/api/v1/users/1/permissions`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json([]);
      }),
    );

    const response = await removeUserPermission(
      { userId: 1 },
      { permissionCode: "post:manage:*" },
    );

    expect(response).toEqual([]);
    expect(observedBody).toEqual({ permissionCode: "post:manage:*" });
  });

  it("throws when removing a permission fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.delete(`${API_BASE_URL}/api/v1/users/1/permissions`, () => {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      }),
    );

    await expect(
      removeUserPermission({ userId: 1 }, { permissionCode: "post:manage:*" }),
    ).rejects.toMatchObject({
      response: { status: 403 },
    });
  });

  it("returns assignable permission definitions", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/permission-registry`, () => {
        return HttpResponse.json([
          {
            permissionCode: "post:manage:*",
            resourceCode: "post",
            actionCode: "manage",
            globalAllowed: true,
            targetAllowed: false,
            label: "게시글 관리",
          },
        ]);
      }),
    );

    await expect(getAssignablePermissions()).resolves.toEqual([
      expect.objectContaining({ permissionCode: "post:manage:*" }),
    ]);
  });

  it("returns teacher contacts with authorization header", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;

    server.use(
      http.get(`${API_BASE_URL}/api/v1/teachers/contact-list`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        return HttpResponse.json([
          {
            id: 1,
            name: "Teacher",
            classroomName: "국화반",
            phoneNumber: "010-1234-5678",
          },
        ]);
      }),
    );

    const response = await getTeacherContacts();

    expect(response).toEqual([
      expect.objectContaining({
        id: 1,
        name: "Teacher",
      }),
    ]);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
  });
});
