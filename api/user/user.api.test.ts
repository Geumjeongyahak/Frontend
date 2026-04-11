/**
 * Tests representative user API functions: getUsers, updateCurrentUser,
 * removeUserSubRole, and joinUserDepartment.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { USER_LIST_RESPONSE } from "../../mocks/handlers/user.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  getUsers,
  joinUserDepartment,
  removeUserSubRole,
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

  it("sends DELETE body data when removing a user sub role", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.delete(`${API_BASE_URL}/api/v1/users/1/roles`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json([]);
      }),
    );

    const response = await removeUserSubRole({ userId: 1 }, { subRole: "ASSISTANT" });

    expect(response).toEqual([]);
    expect(observedBody).toEqual({ subRole: "ASSISTANT" });
  });

  it("throws when joining a department fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.post(`${API_BASE_URL}/api/v1/users/1/departments`, () => {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      }),
    );

    await expect(
      joinUserDepartment({ userId: 1 }, { departmentId: 10 }),
    ).rejects.toMatchObject({
      response: { status: 403 },
    });
  });
});
