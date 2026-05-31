import authClient from "../client/authClient";
import type {
  ApproveTeacherApplicationRequestDto,
  CreateTeacherApplicationRequestDto,
  MyTeacherApplicationResponseDto,
  RejectTeacherApplicationRequestDto,
  TeacherApplicationListQueryParamsDto,
  TeacherApplicationListResponseDto,
  TeacherApplicationPathParamsDto,
  TeacherApplicationResponseDto,
  UpdateTeacherApplicationRequestDto,
} from "./teacherApplication.dto";

// 교원 신청서를 제출하는 요청
export async function createTeacherApplication(body: CreateTeacherApplicationRequestDto) {
  const response = await authClient.post<TeacherApplicationResponseDto>(
    "/api/v1/teacher-applications",
    body,
  );
  return response.data;
}

// 현재 사용자의 교원 신청 상태를 조회하는 요청
export async function getMyTeacherApplication() {
  const response = await authClient.get<MyTeacherApplicationResponseDto>(
    "/api/v1/teacher-applications/me",
  );
  return response.data;
}

// 현재 사용자의 교원 신청서를 수정하는 요청
export async function updateTeacherApplication(
  pathParams: TeacherApplicationPathParamsDto,
  body: UpdateTeacherApplicationRequestDto,
) {
  const response = await authClient.patch<TeacherApplicationResponseDto>(
    `/api/v1/teacher-applications/${pathParams.applicationId}`,
    body,
  );
  return response.data;
}

// 현재 사용자의 교원 신청을 취소하는 요청
export async function cancelTeacherApplication(pathParams: TeacherApplicationPathParamsDto) {
  await authClient.delete(`/api/v1/teacher-applications/${pathParams.applicationId}`);
}

// 관리자 권한으로 교원 신청 목록을 조회하는 요청
export async function getTeacherApplications(query?: TeacherApplicationListQueryParamsDto) {
  const response = await authClient.get<TeacherApplicationListResponseDto>(
    "/api/v1/admin/teacher-applications",
    { params: query },
  );
  return response.data;
}

// 관리자 권한으로 교원 신청 상세를 조회하는 요청
export async function getTeacherApplication(pathParams: TeacherApplicationPathParamsDto) {
  const response = await authClient.get<TeacherApplicationResponseDto>(
    `/api/v1/admin/teacher-applications/${pathParams.applicationId}`,
  );
  return response.data;
}

// 관리자 권한으로 교원 신청을 승인하는 요청
export async function approveTeacherApplication(
  pathParams: TeacherApplicationPathParamsDto,
  body: ApproveTeacherApplicationRequestDto,
) {
  const response = await authClient.patch<TeacherApplicationResponseDto>(
    `/api/v1/admin/teacher-applications/${pathParams.applicationId}/approve`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 교원 신청을 반려하는 요청
export async function rejectTeacherApplication(
  pathParams: TeacherApplicationPathParamsDto,
  body: RejectTeacherApplicationRequestDto,
) {
  const response = await authClient.patch<TeacherApplicationResponseDto>(
    `/api/v1/admin/teacher-applications/${pathParams.applicationId}/reject`,
    body,
  );
  return response.data;
}
