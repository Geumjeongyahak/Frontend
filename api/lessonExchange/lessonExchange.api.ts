import authClient from "../client/authClient";
import type {
  ApproveLessonExchangeRequestDto,
  CreateLessonExchangeRequestDto,
  LessonExchangeListQueryParamsDto,
  LessonExchangePathParamsDto,
  LessonExchangeProposalDto,
  LessonExchangeProposalListResponseDto,
  LessonExchangeProposalPathParamsDto,
  LessonExchangeProposalRequestDto,
  LessonExchangeRequestDetailDto,
  LessonExchangeRequestListResponseDto,
  RejectLessonExchangeRequestDto,
  UpdateLessonExchangeProposalRequestDto,
  UpdateLessonExchangeRequestDto,
} from "./lessonExchange.dto";

// 수업 교환 요청 목록을 조회하는 요청
export async function getLessonExchangeRequests(query?: LessonExchangeListQueryParamsDto) {
  const response = await authClient.get<LessonExchangeRequestListResponseDto>(
    "/api/v1/lesson-exchange-requests",
    {
      params: query,
    },
  );
  return response.data.content;
}

// 수업 교환 요청을 생성하는 요청
export async function createLessonExchangeRequest(body: CreateLessonExchangeRequestDto) {
  const response = await authClient.post<LessonExchangeRequestDetailDto>(
    "/api/v1/lesson-exchange-requests",
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청 상세를 조회하는 요청
export async function getLessonExchangeRequestDetail(pathParams: LessonExchangePathParamsDto) {
  const response = await authClient.get<LessonExchangeRequestDetailDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}`,
  );
  return response.data;
}

// 특정 수업 교환 요청을 수정하는 요청
export async function updateLessonExchangeRequest(
  pathParams: LessonExchangePathParamsDto,
  body: UpdateLessonExchangeRequestDto,
) {
  const response = await authClient.patch<LessonExchangeRequestDetailDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}`,
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청을 반려하는 요청
export async function rejectLessonExchangeRequest(
  pathParams: LessonExchangePathParamsDto,
  body: RejectLessonExchangeRequestDto,
) {
  const response = await authClient.patch<LessonExchangeRequestDetailDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/reject`,
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청을 취소하는 요청
export async function cancelLessonExchangeRequest(pathParams: LessonExchangePathParamsDto) {
  const response = await authClient.patch<LessonExchangeRequestDetailDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/cancel`,
  );
  return response.data;
}

// 특정 수업 교환 요청을 승인하는 요청
export async function approveLessonExchangeRequest(
  pathParams: LessonExchangePathParamsDto,
  body?: ApproveLessonExchangeRequestDto,
) {
  const response = await authClient.patch<LessonExchangeRequestDetailDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/approve`,
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청의 제안 목록을 조회하는 요청
export async function getLessonExchangeProposals(pathParams: LessonExchangePathParamsDto) {
  const response = await authClient.get<LessonExchangeProposalListResponseDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/proposals`,
  );
  return response.data;
}

// 특정 수업 교환 요청에 제안을 생성하는 요청
export async function createLessonExchangeProposal(
  pathParams: LessonExchangePathParamsDto,
  body: LessonExchangeProposalRequestDto,
) {
  const response = await authClient.post<LessonExchangeProposalDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/proposals`,
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청의 특정 제안을 수정하는 요청
export async function updateLessonExchangeProposal(
  pathParams: LessonExchangeProposalPathParamsDto,
  body: UpdateLessonExchangeProposalRequestDto,
) {
  const response = await authClient.patch<LessonExchangeProposalDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/proposals/${pathParams.proposalId}`,
    body,
  );
  return response.data;
}

// 특정 수업 교환 요청의 특정 제안을 철회하는 요청
export async function withdrawLessonExchangeProposal(
  pathParams: LessonExchangeProposalPathParamsDto,
) {
  const response = await authClient.patch<LessonExchangeProposalDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/proposals/${pathParams.proposalId}/withdraw`,
  );
  return response.data;
}

// 특정 수업 교환 요청의 특정 제안을 수락하는 요청
export async function acceptLessonExchangeProposal(
  pathParams: LessonExchangeProposalPathParamsDto,
) {
  const response = await authClient.patch<LessonExchangeProposalDto>(
    `/api/v1/lesson-exchange-requests/${pathParams.requestId}/proposals/${pathParams.proposalId}/accept`,
  );
  return response.data;
}
