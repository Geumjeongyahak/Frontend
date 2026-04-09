/**
 * Tests representative department API functions: getDepartments,
 * createDepartment, and updateDepartment.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { DEPARTMENT_LIST_RESPONSE } from "../../mocks/handlers/department.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createDepartment, getDepartments, updateDepartment } from "./department.api";

describe("department.api", () => {
  it("returns departments and injects the auth header", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;

    server.use(
      http.get(`${API_BASE_URL}/api/v1/departments`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        return HttpResponse.json(DEPARTMENT_LIST_RESPONSE);
      }),
    );

    const response = await getDepartments();

    expect(response).toEqual(DEPARTMENT_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
  });

  it("creates a department with the expected POST body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/departments`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          id: 2,
          name: "Operations",
          description: "Operations team",
        });
      }),
    );

    const response = await createDepartment({
      name: "Operations",
      description: "Operations team",
    });

    expect(response).toEqual({
      id: 2,
      name: "Operations",
      description: "Operations team",
    });
    expect(observedBody).toEqual({
      name: "Operations",
      description: "Operations team",
    });
  });

  it("throws when updating a missing department fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.put(`${API_BASE_URL}/api/v1/departments/999`, () => {
        return HttpResponse.json({ message: "Department not found" }, { status: 404 });
      }),
    );

    await expect(
      updateDepartment({ id: 999 }, { name: "Missing Department" }),
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it("uses the default department handler for a valid list request", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const response = await getDepartments();

    expect(response).toEqual(DEPARTMENT_LIST_RESPONSE);
  });
});
