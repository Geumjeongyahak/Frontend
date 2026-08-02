import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  acceptLessonExchangeProposal,
  approveLessonExchangeRequest,
  createLessonExchangeProposal,
  createLessonExchangeRequest,
  getLessonExchangeProposals,
  getLessonExchangeRequests,
  rejectLessonExchangeRequest,
  updateLessonExchangeProposal,
  updateLessonExchangeRequest,
  withdrawLessonExchangeProposal,
} from "./lessonExchange.api";

const LESSON_EXCHANGE_DETAIL = {
  id: 1,
  dailyScheduleId: 10,
  classroomName: "한글반",
  lessonDate: "2026-06-01",
  requestedById: 3,
  requestedByName: "홍길동",
  title: "수업 교환 요청",
  content: "교환이 필요합니다.",
  status: "PENDING",
  expiresAt: "2026-05-31T22:00:00",
};

const LESSON_EXCHANGE_PROPOSAL = {
  id: 7,
  requestId: 1,
  proposedById: 4,
  proposedByName: "김교사",
  lessonDate: "2026-06-02",
  content: "대체 가능합니다.",
  status: "ACTIVE",
};

describe("lessonExchange.api", () => {
  it("returns lesson exchange requests with filters and auth header", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [LESSON_EXCHANGE_DETAIL],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getLessonExchangeRequests({
      status: "PENDING",
      mine: true,
      keyword: "교환",
    });

    expect(response.content[0]).toMatchObject({ id: 1, status: "PENDING" });
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("status=PENDING");
    expect(observedQueryString).toContain("mine=true");
    expect(observedQueryString).toContain("keyword=");
  });

  it("creates and updates a lesson exchange request with expiresDate bodies", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedUpdateBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, async ({ request }) => {
        observedCreateBody = await request.json();
        return HttpResponse.json({ ...LESSON_EXCHANGE_DETAIL, id: 2 });
      }),
      http.patch(`${API_BASE_URL}/api/v1/lesson-exchange-requests/2`, async ({ request }) => {
        observedUpdateBody = await request.json();
        return HttpResponse.json({ ...LESSON_EXCHANGE_DETAIL, id: 2, title: "수정 요청" });
      }),
    );

    await createLessonExchangeRequest({
      lessonDate: "2026-06-01",
      title: "수업 교환 요청",
      content: "교환이 필요합니다.",
      expiresDate: "2026-05-31",
    });
    await updateLessonExchangeRequest({ requestId: 2 }, {
      title: "수정 요청",
      expiresDate: "2026-05-30",
    });

    expect(observedCreateBody).toEqual({
      lessonDate: "2026-06-01",
      title: "수업 교환 요청",
      content: "교환이 필요합니다.",
      expiresDate: "2026-05-31",
    });
    expect(observedUpdateBody).toEqual({ title: "수정 요청", expiresDate: "2026-05-30" });

    await createLessonExchangeRequest({
      lessonDate: "2026-06-01",
      title: "수업 교환 요청",
      content: "교환이 필요합니다.",
    });
    expect(observedCreateBody).toEqual({
      lessonDate: "2026-06-01",
      title: "수업 교환 요청",
      content: "교환이 필요합니다.",
    });
  });

  it("approves and rejects a lesson exchange request with expected bodies", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedApproveBody: unknown;
    let observedRejectBody: unknown;

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/lesson-exchange-requests/1/approve`, async ({ request }) => {
        observedApproveBody = await request.json();
        return HttpResponse.json({ ...LESSON_EXCHANGE_DETAIL, status: "APPROVED" });
      }),
      http.patch(`${API_BASE_URL}/api/v1/lesson-exchange-requests/1/reject`, async ({ request }) => {
        observedRejectBody = await request.json();
        return HttpResponse.json({ ...LESSON_EXCHANGE_DETAIL, status: "REJECTED" });
      }),
    );

    await approveLessonExchangeRequest({ requestId: 1 }, { proposalId: 7 });
    await rejectLessonExchangeRequest({ requestId: 1 }, { note: "일정 불가" });

    expect(observedApproveBody).toEqual({ proposalId: 7 });
    expect(observedRejectBody).toEqual({ note: "일정 불가" });
  });

  it("handles proposal list, create, update, withdraw, and accept routes", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedUpdateBody: unknown;
    const observedPaths: string[] = [];

    server.use(
      http.get(`${API_BASE_URL}/api/v1/lesson-exchange-requests/1/proposals`, ({ request }) => {
        observedPaths.push(new URL(request.url).pathname);
        return HttpResponse.json([LESSON_EXCHANGE_PROPOSAL]);
      }),
      http.post(
        `${API_BASE_URL}/api/v1/lesson-exchange-requests/1/proposals`,
        async ({ request }) => {
          observedCreateBody = await request.json();
          return HttpResponse.json({ ...LESSON_EXCHANGE_PROPOSAL, id: 8 });
        },
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/lesson-exchange-requests/1/proposals/8`,
        async ({ request }) => {
          observedUpdateBody = await request.json();
          return HttpResponse.json({ ...LESSON_EXCHANGE_PROPOSAL, id: 8, content: "수정" });
        },
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/lesson-exchange-requests/1/proposals/8/withdraw`,
        ({ request }) => {
          observedPaths.push(new URL(request.url).pathname);
          return HttpResponse.json({ ...LESSON_EXCHANGE_PROPOSAL, id: 8, status: "WITHDRAWN" });
        },
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/lesson-exchange-requests/1/proposals/8/accept`,
        ({ request }) => {
          observedPaths.push(new URL(request.url).pathname);
          return HttpResponse.json({ ...LESSON_EXCHANGE_PROPOSAL, id: 8, status: "ACCEPTED" });
        },
      ),
    );

    await expect(getLessonExchangeProposals({ requestId: 1 })).resolves.toEqual([
      expect.objectContaining({ id: 7 }),
    ]);
    await createLessonExchangeProposal({ requestId: 1 }, { content: "대체 가능합니다." });
    await updateLessonExchangeProposal({ requestId: 1, proposalId: 8 }, { content: "수정" });
    await withdrawLessonExchangeProposal({ requestId: 1, proposalId: 8 });
    await acceptLessonExchangeProposal({ requestId: 1, proposalId: 8 });

    expect(observedCreateBody).toEqual({ content: "대체 가능합니다." });
    expect(observedUpdateBody).toEqual({ content: "수정" });
    expect(observedPaths).toContain("/api/v1/lesson-exchange-requests/1/proposals");
    expect(observedPaths).toContain("/api/v1/lesson-exchange-requests/1/proposals/8/withdraw");
    expect(observedPaths).toContain("/api/v1/lesson-exchange-requests/1/proposals/8/accept");
  });
});
