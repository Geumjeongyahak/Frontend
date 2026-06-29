import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  attachMeetingRecordFile,
  createAbsenceReport,
  createMeetingRecord,
  deleteMeetingRecordAttachment,
  getMeetingRecords,
  updateMeetingRecord,
} from "./meetingRecord.api";

describe("meetingRecord.api", () => {
  it("returns meeting records with query params", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/meeting-records`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [{ id: 1, title: "교학 회의", status: "BEFORE_MEETING" }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getMeetingRecords({ keyword: "교학", mineOnly: true });

    expect(response.content?.[0]).toMatchObject({ id: 1 });
    expect(observedQueryString).toContain("keyword=");
    expect(observedQueryString).toContain("mineOnly=true");
  });

  it("creates and updates meeting records with expected bodies", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedUpdateBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/meeting-records`, async ({ request }) => {
        observedCreateBody = await request.json();
        return HttpResponse.json({ id: 1, title: "회의", agenda: "안건" });
      }),
      http.patch(`${API_BASE_URL}/api/v1/meeting-records/1`, async ({ request }) => {
        observedUpdateBody = await request.json();
        return HttpResponse.json({ id: 1, title: "회의", discussion: "논의" });
      }),
    );

    await createMeetingRecord({ title: "회의", agenda: "안건" });
    await updateMeetingRecord({ recordId: 1 }, { discussion: "논의" });

    expect(observedCreateBody).toEqual({ title: "회의", agenda: "안건" });
    expect(observedUpdateBody).toEqual({ discussion: "논의" });
  });

  it("uploads a file to a meeting record via multipart", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedUrl = "";
    let observedContentType = "";

    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/meeting-records/1/attachments`,
        ({ request }) => {
          observedUrl = request.url;
          observedContentType = request.headers.get("content-type") ?? "";
          return HttpResponse.json({
            fileId: "mock-uuid",
            originalName: "test.pdf",
            isGoogleDrive: false,
          });
        },
      ),
    );

    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    const response = await attachMeetingRecordFile({ recordId: 1 }, file, "test.pdf");

    expect(response.fileId).toBe("mock-uuid");
    expect(response.originalName).toBe("test.pdf");
    expect(observedUrl).toContain("/meeting-records/1/attachments");
    expect(observedContentType).toContain("multipart/form-data");
  });

  it("deletes a meeting record attachment", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedUrl = "";

    server.use(
      http.delete(
        `${API_BASE_URL}/api/v1/meeting-records/1/attachments/file-abc`,
        ({ request }) => {
          observedUrl = request.url;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await deleteMeetingRecordAttachment({ recordId: 1, fileId: "file-abc" });

    expect(observedUrl).toContain("/meeting-records/1/attachments/file-abc");
  });

  it("creates an absence report for a meeting record", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/meeting-records/1/absence-reports`,
        async ({ request }) => {
          observedBody = await request.json();
          return HttpResponse.json({ id: 10, reason: "수업", opinion: "의견" });
        },
      ),
    );

    const response = await createAbsenceReport(
      { recordId: 1 },
      { reason: "수업", opinion: "의견" },
    );

    expect(response).toMatchObject({ id: 10, reason: "수업" });
    expect(observedBody).toEqual({ reason: "수업", opinion: "의견" });
  });
});
