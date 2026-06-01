/**
 * Tests representative request API functions across absence, purchase, and
 * lesson exchange flows.
 */
import "../../test/setup";

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_BASE_URL, VALID_ACCESS_TOKEN } from "../../mocks/handlers/auth.handlers";
import {
  ABSENCE_REQUEST_RESPONSE,
  LESSON_EXCHANGE_REQUEST_RESPONSE,
} from "../../mocks/handlers/request.handlers";
import { server } from "../../mocks/server";
import { setAccessToken } from "../client/tokenStorage";

import {
  approvePurchaseRequest,
  createPurchaseRequest,
  createLessonExchangeRequest,
  getAbsenceRequests,
  reportPurchase,
  updateAdminPurchaseItemReceipts,
  updatePurchaseItemReceipts,
} from "./request.api";

describe("request.api", () => {
  it("returns absence requests with auth header and status query", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedAuthorizationHeader: string | null = null;
    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/absence-requests`, ({ request }) => {
        observedAuthorizationHeader = request.headers.get("authorization");
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [ABSENCE_REQUEST_RESPONSE],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getAbsenceRequests({ status: "PENDING" });

    expect(response).toEqual({
      content: [ABSENCE_REQUEST_RESPONSE],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("status=PENDING");
  });

  it("creates a lesson exchange request with the expected body", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({
          ...LESSON_EXCHANGE_REQUEST_RESPONSE,
          id: 30,
          lessonDate: "2026-06-10",
          title: "Emergency swap",
          content: "Need a replacement",
        });
      }),
    );

    const response = await createLessonExchangeRequest({
      lessonDate: "2026-06-10",
      title: "Emergency swap",
      content: "Need a replacement",
      expiresAt: "2026-06-07T22:00:00",
    });

    expect(response.id).toBe(30);
    expect(observedBody).toEqual({
      lessonDate: "2026-06-10",
      title: "Emergency swap",
      content: "Need a replacement",
      expiresAt: "2026-06-07T22:00:00",
    });
  });

  it("approves a purchase request through the admin endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedBody: unknown;

    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/admin/purchase-requests/4/approve`,
        async ({ request }) => {
          observedPathname = new URL(request.url).pathname;
          observedBody = await request.json();
          return HttpResponse.json({
            id: 4,
            status: "APPROVED",
            note: "승인합니다.",
          });
        },
      ),
    );

    const response = await approvePurchaseRequest({ requestId: 4 }, { note: "승인합니다." });

    expect(response.status).toBe("APPROVED");
    expect(observedPathname).toBe("/api/v1/admin/purchase-requests/4/approve");
    expect(observedBody).toEqual({ note: "승인합니다." });
  });

  it("creates a purchase request with payment type and without expected price", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/purchase-requests`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ id: 21, status: "PENDING" });
      }),
    );

    await createPurchaseRequest({
      title: "교재 결제 신청",
      content: "신청자: 홍길동",
      classroomId: 1,
      items: [
        {
          name: "국어 교재",
          quantity: 3,
          reason: "수업 교재",
          paymentType: "PREPAID",
        },
      ],
    });

    expect(observedBody).toEqual({
      title: "교재 결제 신청",
      content: "신청자: 홍길동",
      classroomId: 1,
      items: [
        {
          name: "국어 교재",
          quantity: 3,
          reason: "수업 교재",
          paymentType: "PREPAID",
        },
      ],
    });
  });

  it("reports purchase completion with vendor, item names, amount, and optional receipt ids", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/purchase-requests/4/report`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ id: 4, status: "PURCHASED" });
      }),
    );

    await reportPurchase(
      { requestId: 4 },
      {
        transactions: [
          {
            vendorId: 2,
            itemNames: ["국어 교재", "수학 교재"],
            amount: 45000,
            receiptFileId: "11111111-1111-1111-1111-111111111111",
          },
        ],
      },
    );

    expect(observedBody).toEqual({
      transactions: [
        {
          vendorId: 2,
          itemNames: ["국어 교재", "수학 교재"],
          amount: 45000,
          receiptFileId: "11111111-1111-1111-1111-111111111111",
        },
      ],
    });
  });

  it("updates purchase item receipts through the requester endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedBody: unknown;

    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/purchase-requests/4/item-receipts`,
        async ({ request }) => {
          observedPathname = new URL(request.url).pathname;
          observedBody = await request.json();
          return HttpResponse.json({ id: 4, status: "PURCHASED" });
        },
      ),
    );

    await updatePurchaseItemReceipts(
      { requestId: 4 },
      {
        transactions: [
          {
            vendorId: 2,
            itemNames: ["국어 교재"],
            amount: 15000,
          },
        ],
      },
    );

    expect(observedPathname).toBe("/api/v1/purchase-requests/4/item-receipts");
    expect(observedBody).toEqual({
      transactions: [
        {
          vendorId: 2,
          itemNames: ["국어 교재"],
          amount: 15000,
        },
      ],
    });
  });

  it("updates purchase item receipts through the admin endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/admin/purchase-requests/4/item-receipts`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        return HttpResponse.json({ id: 4, status: "PURCHASED" });
      }),
    );

    await updateAdminPurchaseItemReceipts(
      { requestId: 4 },
      {
        transactions: [
          {
            vendorId: 2,
            itemNames: ["국어 교재"],
            amount: 15000,
          },
        ],
      },
    );

    expect(observedPathname).toBe("/api/v1/admin/purchase-requests/4/item-receipts");
  });

  it("throws when purchase approval fails", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.patch(`${API_BASE_URL}/api/v1/admin/purchase-requests/999/approve`, () => {
        return HttpResponse.json({ message: "Request not found" }, { status: 404 });
      }),
    );

    await expect(
      approvePurchaseRequest({ requestId: 999 }, { note: "승인합니다." }),
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});
