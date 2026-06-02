import { HttpResponse, http, type RequestHandler } from "msw";
import type {
  MeetingAbsenceReportResponseDto,
  MeetingRecordDetailResponseDto,
} from "@/api/meetingRecord/meetingRecord.dto";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

let nextMeetingRecordId = 3;
let nextAbsenceReportId = 10;

type MockMeetingRecord = MeetingRecordDetailResponseDto & {
  id: number;
  absenceReports: MeetingAbsenceReportResponseDto[];
};

const MEETING_RECORDS: MockMeetingRecord[] = [
  {
    id: 1,
    title: "26.06.01 교학 회의록 입니다",
    authorId: 1,
    author: "Teacher One",
    createdAt: "2026-06-01T05:00:00Z",
    status: "BEFORE_MEETING",
    viewCount: 3,
    agenda: "학사 운영 안건",
    discussion: "",
    suggestion: "",
    absenceReports: [],
  },
  {
    id: 2,
    title: "26.05.25 교학 회의록 입니다",
    authorId: 2,
    author: "Teacher Two",
    createdAt: "2026-05-25T05:00:00Z",
    status: "AFTER_MEETING",
    viewCount: 8,
    agenda: "행사 준비",
    discussion: "행사 일정을 논의했습니다.",
    suggestion: "부서별 준비 항목을 확정했습니다.",
    absenceReports: [{ id: 1, authorId: 1, author: "Teacher One", reason: "수업", opinion: "" }],
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

export const meetingRecordHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/meeting-records`, ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 10);
    const keyword = url.searchParams.get("keyword")?.toLowerCase() ?? "";
    const mineOnly = url.searchParams.get("mineOnly") === "true";
    const filtered = MEETING_RECORDS.filter(
      (record) =>
        (!keyword || (record.title ?? "").toLowerCase().includes(keyword)) &&
        (!mineOnly || record.authorId === 1),
    );

    return HttpResponse.json({
      content: filtered.slice(page * size, page * size + size),
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    });
  }),
  http.post(`${API_BASE_URL}/api/v1/meeting-records`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { title?: string; agenda?: string };
    const createdRecord: MockMeetingRecord = {
      id: nextMeetingRecordId,
      title: body.title ?? "",
      authorId: 1,
      author: "Teacher One",
      createdAt: "2026-06-01T06:00:00Z",
      status: "BEFORE_MEETING",
      agenda: body.agenda ?? "",
      discussion: "",
      suggestion: "",
      absenceReports: [],
      viewCount: 0,
    };

    nextMeetingRecordId += 1;
    MEETING_RECORDS.unshift(createdRecord);

    return HttpResponse.json(createdRecord);
  }),
  http.get(`${API_BASE_URL}/api/v1/meeting-records/:recordId`, ({ request, params }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const record = MEETING_RECORDS.find((item) => item.id === Number(params.recordId));

    if (!record) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return HttpResponse.json(record);
  }),
  http.patch(`${API_BASE_URL}/api/v1/meeting-records/:recordId`, async ({ request, params }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as Record<string, unknown>;
    const recordIndex = MEETING_RECORDS.findIndex((item) => item.id === Number(params.recordId));

    if (recordIndex < 0) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const updatedRecord = {
      ...MEETING_RECORDS[recordIndex],
      ...body,
    };

    MEETING_RECORDS[recordIndex] = updatedRecord;

    return HttpResponse.json(updatedRecord);
  }),
  http.delete(`${API_BASE_URL}/api/v1/meeting-records/:recordId`, ({ request, params }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const recordIndex = MEETING_RECORDS.findIndex((item) => item.id === Number(params.recordId));
    if (recordIndex >= 0) {
      MEETING_RECORDS.splice(recordIndex, 1);
    }

    return new HttpResponse(null, { status: 204 });
  }),
  http.post(
    `${API_BASE_URL}/api/v1/meeting-records/:recordId/absence-reports`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { reason?: string; opinion?: string };
      const record = MEETING_RECORDS.find((item) => item.id === Number(params.recordId));
      if (!record) {
        return HttpResponse.json({ message: "Not Found" }, { status: 404 });
      }

      const createdReport = {
        id: nextAbsenceReportId,
        authorId: 1,
        author: "Teacher One",
        reason: body.reason,
        opinion: body.opinion,
        createdAt: "2026-06-01T06:10:00Z",
      };

      nextAbsenceReportId += 1;
      record.absenceReports.unshift(createdReport);

      return HttpResponse.json(createdReport);
    },
  ),
];
