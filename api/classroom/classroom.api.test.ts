/**
 * Tests representative classroom API functions: getClassrooms, createClassroom,
 * and getClassroomDetail.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import {
  CLASSROOM_DETAIL_RESPONSE,
  CLASSROOM_LIST_RESPONSE,
} from "../../mocks/handlers/classroom.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import { createClassroom, getClassroomDetail, getClassrooms } from "./classroom.api";

describe("classroom.api", () => {
  it("returns classrooms and sends authorization header with query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/classrooms`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json(CLASSROOM_LIST_RESPONSE);
      }),
    );

    const response = await getClassrooms({ name: "Blue", page: 0, size: 10 });

    expect(response).toEqual(CLASSROOM_LIST_RESPONSE);
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("name=Blue");
    expect(observedQueryString).toContain("page=0");
    expect(observedQueryString).toContain("size=10");
  });

  it("creates a classroom with the expected request body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedMethod = "";
    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/classrooms`, async ({ request }) => {
        observedMethod = request.method;
        observedBody = await request.json();
        return HttpResponse.json({
          id: 2,
          name: "Green Room",
          type: "LAB",
          description: "Science class",
        });
      }),
    );

    const response = await createClassroom({
      name: "Green Room",
      type: "LAB",
      description: "Science class",
    });

    expect(response).toEqual({
      id: 2,
      name: "Green Room",
      type: "LAB",
      description: "Science class",
    });
    expect(observedMethod).toBe("POST");
    expect(observedBody).toEqual({
      name: "Green Room",
      type: "LAB",
      description: "Science class",
    });
  });

  it("throws when classroom detail lookup fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.get(`${API_BASE_URL}/api/v1/classrooms/999`, () => {
        return HttpResponse.json({ message: "Classroom not found" }, { status: 404 });
      }),
    );

    await expect(getClassroomDetail({ id: 999 })).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it("uses the default classroom handler for detail success", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    const response = await getClassroomDetail({ id: 1 });

    expect(response).toEqual(CLASSROOM_DETAIL_RESPONSE);
  });
});
