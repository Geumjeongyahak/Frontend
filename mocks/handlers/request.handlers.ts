import { HttpResponse, http, type RequestHandler } from "msw";

import { API_BASE_URL, REFRESHED_ACCESS_TOKEN, VALID_ACCESS_TOKEN } from "./auth.handlers";

export const ABSENCE_REQUEST_RESPONSE = {
  id: 1,
  dailyScheduleId: 11,
  lessonDate: "2026-04-10",
  classroomId: 21,
  classroomName: "한글반",
  requestedById: 5,
  requestedByName: "Teacher One",
  title: "Absence request",
  reason: "Family matter",
  status: "PENDING",
};

export const PURCHASE_REQUEST_RESPONSE = {
  id: 2,
  classroomId: 21,
  classroomName: "한글반",
  requestedById: 5,
  requestedByName: "Teacher One",
  title: "Workbook",
  content: "Need new workbook copies",
  totalPrice: 30000,
  status: "PENDING",
  vendorBalances: [{ vendorName: "문구점", balance: 30000 }],
  items: [
    {
      id: 1,
      name: "Workbook",
      quantity: 1,
      reason: "Need new workbook copies",
      paymentType: "ACTUAL",
    },
  ],
  transactions: [],
};

export const LESSON_EXCHANGE_REQUEST_RESPONSE = {
  id: 3,
  dailyScheduleId: 31,
  classroomName: "한글반",
  lessonDate: "2026-04-11",
  requestedById: 5,
  requestedByName: "Teacher One",
  title: "Swap lesson",
  content: "Need coverage",
  status: "PENDING",
  expiresAt: "2026-04-08T22:00:00",
};

export const SUBJECT_EXCHANGE_REQUEST_RESPONSE = {
  id: 4,
  subjectId: 41,
  subjectName: "Math",
  requestedById: 5,
  requestedByName: "Teacher One",
  title: "Swap subject",
  content: "Need another teacher",
  status: "PENDING",
};

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

export const requestHandlers: RequestHandler[] = [
  http.get(`${API_BASE_URL}/api/v1/absence-requests`, ({ request }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({
        content: [ABSENCE_REQUEST_RESPONSE],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      })
    );
  }),
  http.post(`${API_BASE_URL}/api/v1/absence-requests`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as {
      lessonDate?: string;
      title?: string;
      reason?: string;
    };
    if (!body.lessonDate || !body.title || !body.reason) {
      return HttpResponse.json({ message: "Invalid absence payload" }, { status: 400 });
    }

    return HttpResponse.json({ ...ABSENCE_REQUEST_RESPONSE, ...body, id: 10 });
  }),
  http.get(`${API_BASE_URL}/api/v1/absence-requests/:requestId`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({ ...ABSENCE_REQUEST_RESPONSE, id: Number(params.requestId) })
    );
  }),
  http.patch(`${API_BASE_URL}/api/v1/absence-requests/:requestId/approve`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({
        ...ABSENCE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "APPROVED",
      })
    );
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/absence-requests/:requestId/reject`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { note?: string };
      return HttpResponse.json({
        ...ABSENCE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "REJECTED",
        note: body.note ?? "",
      });
    },
  ),
  http.delete(`${API_BASE_URL}/api/v1/absence-requests/:requestId`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API_BASE_URL}/api/v1/purchase-requests`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json([PURCHASE_REQUEST_RESPONSE]);
  }),
  http.post(`${API_BASE_URL}/api/v1/purchase-requests`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as {
      classroomId?: number;
      title?: string;
      content?: string;
      items?: {
        name?: string;
        quantity?: number;
        reason?: string;
        paymentType?: "PREPAID" | "ACTUAL";
      }[];
    };
    return HttpResponse.json({ ...PURCHASE_REQUEST_RESPONSE, ...body, id: 20 });
  }),
  http.get(`${API_BASE_URL}/api/v1/purchase-requests/:requestId`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({ ...PURCHASE_REQUEST_RESPONSE, id: Number(params.requestId) })
    );
  }),
  http.delete(`${API_BASE_URL}/api/v1/purchase-requests/:requestId`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE_URL}/api/v1/purchase-requests/:requestId/report`, async ({ request, params }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as {
      transactions?: {
        vendorId?: number;
        itemNames?: string[];
        amount?: number;
        receiptFileId?: string;
      }[];
    };
    return HttpResponse.json({
      ...PURCHASE_REQUEST_RESPONSE,
      id: Number(params.requestId),
      transactions:
        body.transactions?.map((transaction, index) => ({
          id: index + 1,
          vendorId: transaction.vendorId,
          vendorName: transaction.vendorId ? `거래처 ${transaction.vendorId}` : undefined,
          itemNames: transaction.itemNames,
          amount: transaction.amount,
          receiptFileId: transaction.receiptFileId,
        })) ?? [],
      status: "PURCHASED",
    });
  }),
  http.post(
    `${API_BASE_URL}/api/v1/purchase-requests/:requestId/item-receipts`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as {
        transactions?: {
          vendorId?: number;
          itemNames?: string[];
          amount?: number;
          receiptFileId?: string;
        }[];
      };
      return HttpResponse.json({
        ...PURCHASE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        transactions:
          body.transactions?.map((transaction, index) => ({
            id: index + 1,
            vendorId: transaction.vendorId,
            vendorName: transaction.vendorId ? `거래처 ${transaction.vendorId}` : undefined,
            itemNames: transaction.itemNames,
            amount: transaction.amount,
            receiptFileId: transaction.receiptFileId,
          })) ?? [],
        status: "PURCHASED",
      });
    },
  ),
  http.post(`${API_BASE_URL}/api/v1/purchase-requests/:requestId/reconfirmation`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json({ message: "재확인을 요청했습니다." });
  }),
  http.get(`${API_BASE_URL}/api/v1/admin/purchase-requests`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json([PURCHASE_REQUEST_RESPONSE]);
  }),
  http.get(`${API_BASE_URL}/api/v1/admin/purchase-requests/:requestId`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({ ...PURCHASE_REQUEST_RESPONSE, id: Number(params.requestId) })
    );
  }),
  http.delete(`${API_BASE_URL}/api/v1/admin/purchase-requests/:requestId`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? new HttpResponse(null, { status: 204 });
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/admin/purchase-requests/:requestId/approve`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { note?: string };
      return HttpResponse.json({
        ...PURCHASE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "APPROVED",
        note: body.note ?? "",
      });
    },
  ),
  http.patch(
    `${API_BASE_URL}/api/v1/admin/purchase-requests/:requestId/reject`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { note?: string };
      return HttpResponse.json({
        ...PURCHASE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "REJECTED",
        note: body.note ?? "",
      });
    },
  ),
  http.patch(`${API_BASE_URL}/api/v1/admin/purchase-requests/:requestId/confirm`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({
        ...PURCHASE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "CONFIRMED",
      })
    );
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/admin/purchase-requests/:requestId/item-receipts`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as {
        transactions?: {
          vendorId?: number;
          itemNames?: string[];
          amount?: number;
          receiptFileId?: string;
        }[];
      };
      return HttpResponse.json({
        ...PURCHASE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        transactions:
          body.transactions?.map((transaction, index) => ({
            id: index + 1,
            vendorId: transaction.vendorId,
            vendorName: transaction.vendorId ? `거래처 ${transaction.vendorId}` : undefined,
            itemNames: transaction.itemNames,
            amount: transaction.amount,
            receiptFileId: transaction.receiptFileId,
          })) ?? [],
        status: "PURCHASED",
      });
    },
  ),
  http.get(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json([LESSON_EXCHANGE_REQUEST_RESPONSE]);
  }),
  http.post(`${API_BASE_URL}/api/v1/lesson-exchange-requests`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as {
      lessonDate?: string;
      title?: string;
      content?: string;
      expiresAt?: string;
    };
    return HttpResponse.json({ ...LESSON_EXCHANGE_REQUEST_RESPONSE, ...body, id: 30 });
  }),
  http.get(`${API_BASE_URL}/api/v1/lesson-exchange-requests/:requestId`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({ ...LESSON_EXCHANGE_REQUEST_RESPONSE, id: Number(params.requestId) })
    );
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/lesson-exchange-requests/:requestId/approve`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { exchangeWithUserId?: number };
      return HttpResponse.json({
        ...LESSON_EXCHANGE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "APPROVED",
        approvalByName: `User ${body.exchangeWithUserId}`,
      });
    },
  ),
  http.patch(
    `${API_BASE_URL}/api/v1/lesson-exchange-requests/:requestId/reject`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { note?: string };
      return HttpResponse.json({
        ...LESSON_EXCHANGE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "REJECTED",
        note: body.note ?? "",
      });
    },
  ),
  http.get(`${API_BASE_URL}/api/v1/subject-exchange-requests`, ({ request }) => {
    return unauthorizedWhenNeeded(request) ?? HttpResponse.json([SUBJECT_EXCHANGE_REQUEST_RESPONSE]);
  }),
  http.post(`${API_BASE_URL}/api/v1/subject-exchange-requests`, async ({ request }) => {
    const unauthorizedResponse = unauthorizedWhenNeeded(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const body = (await request.json()) as { subjectId?: number; title?: string; content?: string };
    return HttpResponse.json({ ...SUBJECT_EXCHANGE_REQUEST_RESPONSE, ...body, id: 40 });
  }),
  http.get(`${API_BASE_URL}/api/v1/subject-exchange-requests/:requestId`, ({ request, params }) => {
    return (
      unauthorizedWhenNeeded(request) ??
      HttpResponse.json({ ...SUBJECT_EXCHANGE_REQUEST_RESPONSE, id: Number(params.requestId) })
    );
  }),
  http.patch(
    `${API_BASE_URL}/api/v1/subject-exchange-requests/:requestId/approve`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { exchangeWithUserId?: number };
      return HttpResponse.json({
        ...SUBJECT_EXCHANGE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "APPROVED",
        approvalByName: `User ${body.exchangeWithUserId}`,
      });
    },
  ),
  http.patch(
    `${API_BASE_URL}/api/v1/subject-exchange-requests/:requestId/reject`,
    async ({ request, params }) => {
      const unauthorizedResponse = unauthorizedWhenNeeded(request);
      if (unauthorizedResponse) return unauthorizedResponse;

      const body = (await request.json()) as { note?: string };
      return HttpResponse.json({
        ...SUBJECT_EXCHANGE_REQUEST_RESPONSE,
        id: Number(params.requestId),
        status: "REJECTED",
        note: body.note ?? "",
      });
    },
  ),
];
