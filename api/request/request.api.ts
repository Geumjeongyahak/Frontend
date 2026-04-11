import authClient from "../client/authClient";
import type {
  AbsenceRequestResponseDto,
  ApproveLessonExchangeRequestDto,
  ApproveSubjectExchangeRequestDto,
  CreateAbsenceRequestDto,
  CreateLessonExchangeRequestDto,
  CreatePurchaseRequestDto,
  CreateSubjectExchangeRequestDto,
  LessonExchangeRequestResponseDto,
  PurchaseRequestResponseDto,
  RejectRequestDto,
  RequestPathParamsDto,
  RequestStatusQueryParamsDto,
  SubjectExchangeRequestResponseDto,
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
export async function getPurchaseRequests(query?: RequestStatusQueryParamsDto) {
  const response = await authClient.get<PurchaseRequestResponseDto[]>("/api/v1/purchase-requests", {
    params: query,
  });
  return response.data;
}

// 구매 요청을 생성하는 요청
export async function createPurchaseRequest(body: CreatePurchaseRequestDto) {
  const response = await authClient.post<PurchaseRequestResponseDto>(
    "/api/v1/purchase-requests",
    body,
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
export async function approvePurchaseRequest(pathParams: RequestPathParamsDto) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/purchase-requests/${pathParams.requestId}/approve`,
  );
  return response.data;
}

// 특정 구매 요청을 반려하는 요청
export async function rejectPurchaseRequest(
  pathParams: RequestPathParamsDto,
  body: RejectRequestDto,
) {
  const response = await authClient.patch<PurchaseRequestResponseDto>(
    `/api/v1/purchase-requests/${pathParams.requestId}/reject`,
    body,
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

// 과목 교환 요청 목록을 조회하는 요청
export async function getSubjectExchangeRequests(query?: RequestStatusQueryParamsDto) {
  const response = await authClient.get<SubjectExchangeRequestResponseDto[]>(
    "/api/v1/subject-exchange-requests",
    {
      params: query,
    },
  );
  return response.data;
}

// 과목 교환 요청을 생성하는 요청
export async function createSubjectExchangeRequest(body: CreateSubjectExchangeRequestDto) {
  const response = await authClient.post<SubjectExchangeRequestResponseDto>(
    "/api/v1/subject-exchange-requests",
    body,
  );
  return response.data;
}

// 특정 과목 교환 요청 상세를 조회하는 요청
export async function getSubjectExchangeRequestDetail(pathParams: RequestPathParamsDto) {
  const response = await authClient.get<SubjectExchangeRequestResponseDto>(
    `/api/v1/subject-exchange-requests/${pathParams.requestId}`,
  );
  return response.data;
}

// 특정 과목 교환 요청을 승인하는 요청
export async function approveSubjectExchangeRequest(
  pathParams: RequestPathParamsDto,
  body: ApproveSubjectExchangeRequestDto,
) {
  const response = await authClient.patch<SubjectExchangeRequestResponseDto>(
    `/api/v1/subject-exchange-requests/${pathParams.requestId}/approve`,
    body,
  );
  return response.data;
}

// 특정 과목 교환 요청을 반려하는 요청
export async function rejectSubjectExchangeRequest(
  pathParams: RequestPathParamsDto,
  body: RejectRequestDto,
) {
  const response = await authClient.patch<SubjectExchangeRequestResponseDto>(
    `/api/v1/subject-exchange-requests/${pathParams.requestId}/reject`,
    body,
  );
  return response.data;
}
