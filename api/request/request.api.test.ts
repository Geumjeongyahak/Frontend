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
  createAdminPurchaseRequest,
  createLessonExchangeRequest,
  createPurchaseRequest,
  generateExpenseDocument,
  getAbsenceRequests,
  getAllPurchaseRequests,
  getLessonExchangeRequests,
  getPurchaseRequests,
  reportAdminPurchase,
  reportPurchase,
  updateAdminPurchaseRequest,
  updatePurchaseRequest,
  updateAdminPurchaseItemReceipts,
  updatePurchaseItemReceipts,
  attachAdminPurchaseRequestProposalReceipt,
  attachPurchaseRequestProposalReceipt,
  deleteAdminPurchaseRequestProposalReceipt,
  deletePurchaseRequest,
  deletePurchaseRequestProposalReceipt,
  generateAdminPurchaseRequestResolutionDocument,
  savePurchaseRequestProposal,
} from "./request.api";

describe("request.api", () => {
  it("returns absence requests with auth header and supports mine filtering", async () => {
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

    const response = await getAbsenceRequests({ status: "PENDING", mine: true });

    expect(response).toEqual({
      content: [ABSENCE_REQUEST_RESPONSE],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    expect(observedAuthorizationHeader).toBe(`Bearer ${VALID_ACCESS_TOKEN}`);
    expect(observedQueryString).toContain("status=PENDING");
    expect(observedQueryString).toContain("mine=true");
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
      expiresDate: "2026-06-07",
    });

    expect(response.id).toBe(30);
    expect(observedBody).toEqual({
      lessonDate: "2026-06-10",
      title: "Emergency swap",
      content: "Need a replacement",
      expiresDate: "2026-06-07",
    });
  });

  it("returns lesson exchange requests as paginated data", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [LESSON_EXCHANGE_REQUEST_RESPONSE],
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

    expect(response.content).toEqual([LESSON_EXCHANGE_REQUEST_RESPONSE]);
    expect(observedQueryString).toContain("status=PENDING");
    expect(observedQueryString).toContain("mine=true");
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

  it("creates a purchase request with department affiliation and payment type", async () => {
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
      paymentType: "PREPAID",
      classroomId: null,
      departmentId: 7,
      items: [
        {
          name: "국어 교재",
          quantity: 3,
          reason: "수업 교재",
        },
      ],
    });

    expect(observedBody).toEqual({
      title: "교재 결제 신청",
      content: "신청자: 홍길동",
      paymentType: "PREPAID",
      classroomId: null,
      departmentId: 7,
      items: [
        {
          name: "국어 교재",
          quantity: 3,
          reason: "수업 교재",
        },
      ],
    });
  });

  it("returns paginated purchase requests with search filters", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/purchase-requests`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [{ id: 21, title: "교재 결제 신청", status: "PENDING" }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getPurchaseRequests({
      mine: true,
      paymentType: "PREPAID",
      departmentName: "교육연구부",
      keyword: "교재",
      page: 0,
      size: 10,
    });

    expect(response.content).toEqual([{ id: 21, title: "교재 결제 신청", status: "PENDING" }]);
    expect(observedQueryString).toContain("mine=true");
    expect(observedQueryString).toContain("paymentType=PREPAID");
    expect(observedQueryString).toContain("departmentName=%EA%B5%90%EC%9C%A1%EC%97%B0%EA%B5%AC%EB%B6%80");
    expect(observedQueryString).toContain("keyword=%EA%B5%90%EC%9E%AC");
    expect(observedQueryString).toContain("page=0");
    expect(observedQueryString).toContain("size=10");
  });

  it("returns paginated admin purchase requests with search filters", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedQueryString = "";

    server.use(
      http.get(`${API_BASE_URL}/api/v1/admin/purchase-requests`, ({ request }) => {
        observedQueryString = new URL(request.url).search;
        return HttpResponse.json({
          content: [{ id: 31, title: "문구 구입", status: "APPROVED" }],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    const response = await getAllPurchaseRequests({
      status: "APPROVED",
      paymentType: "ACTUAL",
      keyword: "문구",
      page: 0,
      size: 20,
    });

    expect(response.content).toEqual([{ id: 31, title: "문구 구입", status: "APPROVED" }]);
    expect(observedQueryString).toContain("status=APPROVED");
    expect(observedQueryString).toContain("paymentType=ACTUAL");
    expect(observedQueryString).toContain("keyword=%EB%AC%B8%EA%B5%AC");
    expect(observedQueryString).toContain("page=0");
    expect(observedQueryString).toContain("size=20");
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
            paymentMethod: "CARD",
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
          paymentMethod: "CARD",
          receiptFileId: "11111111-1111-1111-1111-111111111111",
        },
      ],
    });
  });

  it("creates and updates admin purchase requests through admin endpoints", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedCreateBody: unknown;
    let observedUpdateBody: unknown;

    server.use(
      http.post(`${API_BASE_URL}/api/v1/admin/purchase-requests`, async ({ request }) => {
        observedCreateBody = await request.json();
        return HttpResponse.json({ id: 50, status: "PENDING" });
      }),
      http.put(`${API_BASE_URL}/api/v1/admin/purchase-requests/50`, async ({ request }) => {
        observedUpdateBody = await request.json();
        return HttpResponse.json({ id: 50, status: "PENDING", title: "수정됨" });
      }),
    );

    await createAdminPurchaseRequest({
      requestedById: 3,
      title: "대리 구입 요청",
      content: "관리자가 대신 등록",
      paymentType: "ACTUAL",
      classroomId: 1,
      items: [
        {
          name: "프린트 용지",
          quantity: 2,
        },
      ],
    });

    await updateAdminPurchaseRequest(
      { requestId: 50 },
      {
        title: "수정됨",
        content: "품목 수정",
        paymentType: "PREPAID",
        classroomId: null,
        departmentId: 7,
        items: [
          {
            name: "프린트 용지",
            quantity: 3,
          },
        ],
      },
    );

    expect(observedCreateBody).toEqual({
      requestedById: 3,
      title: "대리 구입 요청",
      content: "관리자가 대신 등록",
      paymentType: "ACTUAL",
      classroomId: 1,
      items: [
        {
          name: "프린트 용지",
          quantity: 2,
        },
      ],
    });
    expect(observedUpdateBody).toEqual({
      title: "수정됨",
      content: "품목 수정",
      paymentType: "PREPAID",
      classroomId: null,
      departmentId: 7,
      items: [
        {
          name: "프린트 용지",
          quantity: 3,
        },
      ],
    });
  });

  it("reports admin purchase completion through the admin endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";

    server.use(
      http.post(`${API_BASE_URL}/api/v1/admin/purchase-requests/4/report`, ({ request }) => {
        observedPathname = new URL(request.url).pathname;
        return HttpResponse.json({ id: 4, status: "PURCHASED" });
      }),
    );

    await reportAdminPurchase(
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

    expect(observedPathname).toBe("/api/v1/admin/purchase-requests/4/report");
  });

  it("generates an expense document blob through the admin endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedBody: unknown;

    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/admin/purchase-requests/4/expense-document`,
        async ({ request }) => {
          observedPathname = new URL(request.url).pathname;
          observedBody = await request.json();
          return new HttpResponse(new Blob(["docx-content"]), {
            status: 200,
            headers: {
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
          });
        },
      ),
    );

    const response = await generateExpenseDocument(
      { requestId: 4 },
      {
        fiscalYear: "2026년",
        paymentMethod: "TRANSFER",
        items: [{ spec: "A4", unitPrice: 3000 }],
        draftApprovals: [{ position: "담당", name: "김담당" }],
      },
    );

    expect(response).toBeInstanceOf(Blob);
    expect(observedPathname).toBe("/api/v1/admin/purchase-requests/4/expense-document");
    expect(observedBody).toEqual({
      fiscalYear: "2026년",
      paymentMethod: "TRANSFER",
      items: [{ spec: "A4", unitPrice: 3000 }],
      draftApprovals: [{ position: "담당", name: "김담당" }],
    });
  });

  it("updates a requester purchase request through the documented PUT endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;
    server.use(
      http.put(`${API_BASE_URL}/api/v1/purchase-requests/21`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ id: 21, status: "PENDING" });
      }),
    );

    await updatePurchaseRequest(
      { requestId: 21 },
      {
        title: "교재 수량 변경",
        content: "수량을 조정합니다.",
        departmentId: 7,
        items: [{ name: "국어 교재", quantity: 4, paymentType: "PREPAID" }],
      },
    );

    expect(observedBody).toEqual({
      title: "교재 수량 변경",
      content: "수량을 조정합니다.",
      departmentId: 7,
      items: [{ name: "국어 교재", quantity: 4 }],
    });
  });

  it("deletes a newly created purchase request through the requester endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let deletedPathname = "";
    server.use(
      http.delete(`${API_BASE_URL}/api/v1/purchase-requests/21`, ({ request }) => {
        deletedPathname = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await expect(deletePurchaseRequest({ requestId: 21 })).resolves.toBeUndefined();
    expect(deletedPathname).toBe("/api/v1/purchase-requests/21");
  });

  it("saves proposal data with the documented PUT method", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedBody: unknown;
    server.use(
      http.put(`${API_BASE_URL}/api/v1/purchase-requests/4/proposal`, async ({ request }) => {
        observedBody = await request.json();
        return HttpResponse.json({ id: 1, proposalTitle: "7월 교재 구입" });
      }),
    );

    const response = await savePurchaseRequestProposal(
      { requestId: 4 },
      { proposalTitle: "7월 교재 구입", items: [] },
    );

    expect(response.proposalTitle).toBe("7월 교재 구입");
    expect(observedBody).toEqual({ proposalTitle: "7월 교재 구입", items: [] });
  });

  it("attaches and removes a proposal receipt through documented endpoints", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let attachedBody: unknown;
    let deletedPathname = "";
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/purchase-requests/4/proposal/receipts`,
        async ({ request }) => {
          attachedBody = await request.json();
          return HttpResponse.json({ id: 1, receipts: [{ id: 9, fileId: "file-1" }] });
        },
      ),
      http.delete(`${API_BASE_URL}/api/v1/purchase-requests/4/proposal/receipts/9`, ({ request }) => {
        deletedPathname = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const response = await attachPurchaseRequestProposalReceipt(
      { requestId: 4 },
      { fileId: "file-1" },
    );
    await deletePurchaseRequestProposalReceipt({ requestId: 4, receiptId: 9 });

    expect(response.receipts).toEqual([{ id: 9, fileId: "file-1" }]);
    expect(attachedBody).toEqual({ fileId: "file-1" });
    expect(deletedPathname).toBe("/api/v1/purchase-requests/4/proposal/receipts/9");
  });

  it("attaches a proposal receipt through the admin endpoint with the file ID payload", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let observedPathname = "";
    let observedBody: unknown;
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/admin/purchase-requests/4/proposal/receipts`,
        async ({ request }) => {
          observedPathname = new URL(request.url).pathname;
          observedBody = await request.json();
          return HttpResponse.json({ id: 1, receipts: [{ id: 9, fileId: "file-1" }] });
        },
      ),
    );

    const response = await attachAdminPurchaseRequestProposalReceipt(
      { requestId: 4 },
      { fileId: "file-1" },
    );

    expect(response.receipts).toEqual([{ id: 9, fileId: "file-1" }]);
    expect(observedPathname).toBe("/api/v1/admin/purchase-requests/4/proposal/receipts");
    expect(observedBody).toEqual({ fileId: "file-1" });
  });

  it("removes a proposal receipt through the admin endpoint", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    let deletedPathname = "";
    server.use(
      http.delete(
        `${API_BASE_URL}/api/v1/admin/purchase-requests/4/proposal/receipts/9`,
        ({ request }) => {
          deletedPathname = new URL(request.url).pathname;
          return new HttpResponse(null, { status: 200 });
        },
      ),
    );

    await deleteAdminPurchaseRequestProposalReceipt({ requestId: 4, receiptId: 9 });

    expect(deletedPathname).toBe("/api/v1/admin/purchase-requests/4/proposal/receipts/9");
  });

  it("returns an admin resolution document as a blob", async () => {
    setAccessToken(VALID_ACCESS_TOKEN);

    server.use(
      http.post(`${API_BASE_URL}/api/v1/admin/purchase-requests/4/resolution-document`, () =>
        new HttpResponse(new Blob(["docx-content"]), { status: 200 }),
      ),
    );

    await expect(generateAdminPurchaseRequestResolutionDocument({ requestId: 4 })).resolves.toBeInstanceOf(
      Blob,
    );
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
