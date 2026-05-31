import authClient from "../client/authClient";
import type {
  AssignSubjectTeacherRequestDto,
  CreateSubjectRequestDto,
  SubjectDetailResponseDto,
  SubjectListQueryParamsDto,
  SubjectPathParamsDto,
  UpdateSubjectScheduleRequestDto,
  UpdateSubjectRequestDto,
} from "./subject.dto";

// 과목 목록을 조회하는 요청
export async function getSubjects(query?: SubjectListQueryParamsDto) {
  const response = await authClient.get<SubjectDetailResponseDto[]>("/api/v1/subjects", {
    params: query,
  });
  return response.data;
}

// 담당 교사가 배정되지 않은 과목 목록을 조회하는 요청
export async function getUnassignedSubjects() {
  const response = await authClient.get<SubjectDetailResponseDto[]>(
    "/api/v1/subjects/unassigned",
  );
  return response.data;
}

// 새 과목을 생성하는 요청
export async function createSubject(body: CreateSubjectRequestDto) {
  const response = await authClient.post<SubjectDetailResponseDto>("/api/v1/subjects", body);
  return response.data;
}

// 특정 과목 상세 정보를 조회하는 요청
export async function getSubjectDetail(pathParams: SubjectPathParamsDto) {
  const response = await authClient.get<SubjectDetailResponseDto>(
    `/api/v1/subjects/${pathParams.subjectId}`,
  );
  return response.data;
}

// 특정 과목 정보를 수정하는 요청
export async function updateSubject(
  pathParams: SubjectPathParamsDto,
  body: UpdateSubjectRequestDto,
) {
  const response = await authClient.patch<SubjectDetailResponseDto>(
    `/api/v1/subjects/${pathParams.subjectId}`,
    body,
  );
  return response.data;
}

// 특정 과목 담당 교사를 배정하거나 해제하는 요청
export async function assignSubjectTeacher(
  pathParams: SubjectPathParamsDto,
  body: AssignSubjectTeacherRequestDto,
) {
  const response = await authClient.patch<SubjectDetailResponseDto>(
    `/api/v1/subjects/${pathParams.subjectId}/teacher`,
    body,
  );
  return response.data;
}

// 특정 과목 일정을 수정하는 요청
export async function updateSubjectSchedule(
  pathParams: SubjectPathParamsDto,
  body: UpdateSubjectScheduleRequestDto,
) {
  const response = await authClient.patch<SubjectDetailResponseDto>(
    `/api/v1/subjects/${pathParams.subjectId}/schedule`,
    body,
  );
  return response.data;
}

// 특정 과목을 삭제하는 요청
export async function deleteSubject(pathParams: SubjectPathParamsDto) {
  await authClient.delete(`/api/v1/subjects/${pathParams.subjectId}`);
}
