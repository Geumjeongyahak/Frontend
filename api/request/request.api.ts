import authClient from "../client/authClient";
import type {
  AbsenceRequestResponseDto,
  ApproveLessonExchangeRequestDto,
  CreateAbsenceRequestDto,
  CreateLessonExchangeRequestDto,
  CreatePurchaseRequestDto,
  LessonExchangeRequestResponseDto,
  PurchaseRequestResponseDto,
  PurchaseRequestSummaryResponseDto,
  PurchaseRequestStatusQueryParamsDto,
  RejectRequestDto,
  ReportPurchaseRequestDto,
  RequestPathParamsDto,
  RequestReconfirmationResponseDto,
  ReviewPurchaseRequestDto,
  RequestStatusQueryParamsDto,
} from "./request.dto";

// 결석 요청 목록을 조회하는 요청
export async function getAbsenceRequests(query?: RequestStatusQueryParamsDto) {
  const response = await authClient.get<AbsenceRequestResponseDto[]>("/api/v1/absence-requests", {
    params: query,
  });
  return response.data;
}

// 결석 요청을 생성하는 요청
export async function createAbsenceRequest(body: CreateAbsenceRequestDto) {
  const response = await authClient.post<AbsenceRequestResponseDto>(
    "/api/v1/absence-requests",
    body,
  );
  return response.data;
}

// 특정 결석 요청 상세를 조회하는 요청
export async function getAbsenceRequestDetail(pathParams: RequestPathParamsDto) {
  const response = await authClient.get<AbsenceRequestResponseDto>(
    `/api/v1/absence-requests/${pathParams.requestId}`,
  );
  return response.data;
}

// 특정 결석 요청을 승인하는 요청
export async function approveAbsenceRequest(pathParams: RequestPathParamsDto) {
  const response = await authClient.patch<AbsenceRequestResponseDto>(
    `/api/v1/absence-requests/${pathParams.requestId}/approve`,
  );
  return response.data;
}

// 특정 결석 요청을 반려하는 요청
export async function rejectAbsenceRequest(
  pathParams: RequestPathParamsDto,
  body: RejectRequestDto,
) {
  const response = await authClient.patch<AbsenceRequestResponseDto>(
    `/api/v1/absence-requests/${pathParams.requestId}/reject`,
    body,
  );
  return response.data;
}

// 특정 결석 요청을 삭제하는 요청
export async function deleteAbsenceRequest(pathParams: RequestPathParamsDto) {
  await authClient.delete(`/api/v1/absence-requests/${pathParams.requestId}`);
}

// 구매 요청 목록을 조회하는 요청
export async function getPurchaseRequests(query?: PurchaseRequestStatusQueryParamsDto) {
  const response = await authClient.get<PurchaseRequestSummaryResponseDto[]>(
    "/api/v1/purchase-requests",
    {
      params: query,
    },
  );
  return response.data;
}

// 구매 요청을 생성하는 요청
export async function createPurchaseRequest(body: CreatePurchaseRequestDto) {
  const requestBody: CreatePurchaseRequestDto = {
    title: body.title,
    content: body.content,
    classroomId: body.classroomId,
    ...(typeof body.advancePaymentRequestedAmount === "number"
      ? { advancePaymentRequestedAmount: body.advancePaymentRequestedAmount }
      : {}),
    items: body.items.map((item) => ({
      name: item.name,
      ...(item.reason ? { reason: item.reason } : {}),
      ...(typeof item.expectedPrice === "number" ? { expectedPrice: item.expectedPrice } : {}),
    })),
  };

  const response = await authClient.post<PurchaseRequestResponseDto>(
    "/api/v1/purchase-requests",
    requestBody,
  );
  return response.data;
}

// 특정 구매 요청 상세를 조회하는 요청
export async function getPurchaseRequestDetail(pathParams: RequestPathParamsDto) {
  const response = await authClient.get<PurchaseRequestResponseDto>(
    `/api/v1/purchase-requests/${pathParams.requestId}`,
  );
  return response.data;
}

// 특정 구매 요청을 승인하는 요청
export async function approvePurchaseRequest(
  pathParams: RequestPathParamsDto,
  body: ReviewPurchaseRequestDto,
) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/admin/purchase-requests/${pathParams.requestId}/approve`,
    body,
  );
  return response.data;
}

// 특정 구매 요청을 삭제하는 요청
export async function deletePurchaseRequest(pathParams: RequestPathParamsDto) {
  await authClient.delete(`/api/v1/purchase-requests/${pathParams.requestId}`);
}

// 특정 구매 요청을 반려하는 요청
export async function rejectPurchaseRequest(
  pathParams: RequestPathParamsDto,
  body: RejectRequestDto,
) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/admin/purchase-requests/${pathParams.requestId}/reject`,
    body,
  );
  return response.data;
}

// 관리자 기준 구매 요청 목록을 조회하는 요청
export async function getAllPurchaseRequests(query?: PurchaseRequestStatusQueryParamsDto) {
  const response = await authClient.get<PurchaseRequestSummaryResponseDto[]>(
    "/api/v1/admin/purchase-requests",
    {
      params: query,
    },
  );
  return response.data;
}

// 관리자 기준 구매 요청 상세를 조회하는 요청
export async function getAdminPurchaseRequestDetail(pathParams: RequestPathParamsDto) {
  const response = await authClient.get<PurchaseRequestResponseDto>(
    `/api/v1/admin/purchase-requests/${pathParams.requestId}`,
  );
  return response.data;
}

// 관리자 기준 구매 요청을 삭제하는 요청
export async function deleteAdminPurchaseRequest(pathParams: RequestPathParamsDto) {
  await authClient.delete(`/api/v1/admin/purchase-requests/${pathParams.requestId}`);
}

// 관리자 기준 구매 요청을 승인하는 요청
export async function approveAdminPurchaseRequest(
  pathParams: RequestPathParamsDto,
  body: ReviewPurchaseRequestDto,
) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/admin/purchase-requests/${pathParams.requestId}/approve`,
    body,
  );
  return response.data;
}

// 관리자 기준 구매 요청을 반려하는 요청
export async function rejectAdminPurchaseRequest(
  pathParams: RequestPathParamsDto,
  body: RejectRequestDto,
) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/admin/purchase-requests/${pathParams.requestId}/reject`,
    body,
  );
  return response.data;
}

// 관리자 기준 구매 완료 요청을 결재 확인하는 요청
export async function confirmPurchase(pathParams: RequestPathParamsDto) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/admin/purchase-requests/${pathParams.requestId}/confirm`,
  );
  return response.data;
}

// 구매 완료 보고를 제출하는 요청
export async function reportPurchase(
  pathParams: RequestPathParamsDto,
  body: ReportPurchaseRequestDto,
) {
  const response = await authClient.post<PurchaseRequestResponseDto>(
    `/api/v1/purchase-requests/${pathParams.requestId}/report`,
    body,
  );
  return response.data;
}

// 구매 요청 재확인을 요청하는 요청
export async function requestReconfirmation(pathParams: RequestPathParamsDto) {
  const response = await authClient.post<RequestReconfirmationResponseDto>(
    `/api/v1/purchase-requests/${pathParams.requestId}/reconfirmation`,
  );
  return response.data;
}

// 수업 교환 요청 목록을 조회하는 요청
export async function getLessonExchangeRequests(query?: RequestStatusQueryParamsDto) {
  const response = await authClient.get<LessonExchangeRequestResponseDto[]>(
    "/api/v1/lesson-exchange-requests",
    {
      params: query,
    },
  );
  return response.data;
}

// 수업 교환 요청을 생성하는 요청
export async function createLessonExchangeRequest(body: CreateLessonExchangeRequestDto) {
  const response = await authClient.post<LessonExchangeRequestResponseDto>(
    "/api/v1/lesson-exchange-requests",
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청 상세를 조회하는 요청
export async function getLessonExchangeRequestDetail(pathParams: RequestPathParamsDto) {
  const response = await authClient.get<LessonExchangeRequestResponseDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}`,
  );
  return response.data;
}

// 특정 수업 교환 요청을 승인하는 요청
export async function approveLessonExchangeRequest(
  pathParams: RequestPathParamsDto,
  body: ApproveLessonExchangeRequestDto,
) {
  const response = await authClient.patch<LessonExchangeRequestResponseDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/approve`,
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청을 반려하는 요청
export async function rejectLessonExchangeRequest(
  pathParams: RequestPathParamsDto,
  body: RejectRequestDto,
) {
  const response = await authClient.patch<LessonExchangeRequestResponseDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/reject`,
    body,
  );
  return response.data;
}
