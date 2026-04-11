/**
 * Tests representative student API functions: getStudents, createStudent,
 * and updateStudent.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { STUDENT_LIST_RESPONSE } from "../../mocks/handlers/student.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createStudent, getStudents, updateStudent } from "./student.api";

describe("student.api", () => {
  it("returns students with auth header and query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/students`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(STUDENT_LIST_RESPONSE);
      }),
    );

    const response = await getStudents({ status: "ENROLLED", page: 0, size: 10 });

    expect(response).toEqual(STUDENT_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("status=ENROLLED");
  });

  it("creates a student with the expected POST body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/students`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          id: 2,
          name: "Park Student",
          phoneNumber: "010-4444-5555",
          description: "New student",
          status: "ENROLLED",
        });
      }),
    );

    const response = await createStudent({
      name: "Park Student",
      phoneNumber: "010-4444-5555",
      description: "New student",
    });

    expect(response.name).toBe("Park Student");
    expect(observedBody).toEqual({
      name: "Park Student",
      phoneNumber: "010-4444-5555",
      description: "New student",
    });
  });

  it("throws when updating a missing student fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/students/999`, () => {
        return HttpResponse.json({ message: "Student not found" }, { status: 404 });
      }),
    );

    await expect(
      updateStudent({ studentId: 999 }, { status: "COMPLETED" }),
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});
