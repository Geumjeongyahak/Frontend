import authClient from "../client/authClient";
import type {
  CreateLessonRequestDto,
  LessonDetailResponseDto,
  LessonPathParamsDto,
  LessonRangeQueryParamsDto,
  LessonSummaryResponseDto,
  UpdateLessonRequestDto,
  UpdateLessonStatusRequestDto,
} from "./lesson.dto";

// 기간 조건에 맞는 수업 목록을 조회하는 요청
export async function getLessons(query: LessonRangeQueryParamsDto) {
  const response = await authClient.get<LessonSummaryResponseDto[]>("/api/v1/lessons", {
    params: query,
  });
  return response.data;
}

// 현재 사용자 기준 수업 목록을 조회하는 요청
export async function getMyLessons(query: LessonRangeQueryParamsDto) {
  const response = await authClient.get<LessonSummaryResponseDto[]>("/api/v1/lessons/me", {
    params: query,
  });
  return response.data;
}

// 새 수업을 생성하는 요청
export async function createLesson(body: CreateLessonRequestDto) {
  const response = await authClient.post<LessonDetailResponseDto>("/api/v1/lessons", body);
  return response.data;
}

// 특정 수업 상세 정보를 조회하는 요청
export async function getLessonDetail(pathParams: LessonPathParamsDto) {
  const response = await authClient.get<LessonDetailResponseDto>(
    `/api/v1/lessons/${pathParams.lessonId}`,
  );
  return response.data;
}

// 특정 수업 정보를 수정하는 요청
export async function updateLesson(pathParams: LessonPathParamsDto, body: UpdateLessonRequestDto) {
  const response = await authClient.patch<LessonDetailResponseDto>(
    `/api/v1/lessons/${pathParams.lessonId}`,
    body,
  );
  return response.data;
}

// 특정 수업을 삭제하는 요청
export async function deleteLesson(pathParams: LessonPathParamsDto) {
  await authClient.delete(`/api/v1/lessons/${pathParams.lessonId}`);
}

// 특정 수업의 상태를 변경하는 요청
export async function updateLessonStatus(
  pathParams: LessonPathParamsDto,
  body: UpdateLessonStatusRequestDto,
) {
  const response = await authClient.patch<LessonDetailResponseDto>(
    `/api/v1/lessons/${pathParams.lessonId}/status`,
    body,
  );
  return response.data;
}
