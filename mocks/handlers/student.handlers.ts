import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const STUDENT_LIST_RESPONSE = [
  {
    id: 1,
    name: "Kim Student",
    phoneNumber: "010-1111-2222",
    description: "Middle school student",
    classrooms: [{ id: 1, name: "벚꽃반" }],
    status: "ENROLLED",
  },
];

export const STUDENT_DETAIL_RESPONSE = {
  id: 1,
  name: "Kim Student",
  phoneNumber: "010-1111-2222",
  description: "Middle school student",
  classrooms: [{ id: 1, name: "벚꽃반" }],
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

    const url = new URL(request.url);
    const classroomId = url.searchParams.get("classroomId");
    const status = url.searchParams.get("status");

    let students = [...STUDENT_LIST_RESPONSE];

    if (classroomId) {
      const parsedClassroomId = Number(classroomId);
      students = students.filter((student) =>
        student.classrooms.some((classroom) => classroom.id === parsedClassroomId),
      );
    }

    if (status) {
      students = students.filter((student) => student.status === status);
    }

    return HttpResponse.json(students);
  }),
  http.post(`${API_BASE_URL}/api/v1/students`, async ({ request }) => {
    if (!hasValidAuthorization(request)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      phoneNumber?: string;
      description?: string;
      classroomIds?: number[];
    };

    if (!body.name || !body.classroomIds?.length) {
      return HttpResponse.json({ message: "Invalid student payload" }, { status: 400 });
    }

    const classroomId = body.classroomIds[0];

    return HttpResponse.json({
      id: 2,
      name: body.name,
      phoneNumber: body.phoneNumber,
      description: body.description,
      classrooms: [{ id: classroomId, name: "벚꽃반" }],
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
