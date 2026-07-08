import authClient from "../client/authClient";
import { toBirthDateInputValue, toResidentRegistrationNumberPrefix } from "../../utils/birthDate";
import type {
  AssignUserClassroomRequestDto,
  CreateUserRequestDto,
  PermissionDefinitionDto,
  PermissionResponseDto,
  UpdateSelfRequestDto,
  UpdateUserRequestDto,
  UserPermissionRequestDto,
  UserListQueryParamsDto,
  UserListResponseDto,
  UserPathParamsDto,
  UserResponseDto,
  TeacherContactResponseDto,
} from "./user.dto";

function normalizeUserResponse(user: UserResponseDto) {
  const birthDate = toBirthDateInputValue(user.birthDate ?? user.residentRegistrationNumberPrefix);
  const residentRegistrationNumberPrefix =
    user.residentRegistrationNumberPrefix ??
    (user.birthDate ? toResidentRegistrationNumberPrefix(user.birthDate) || undefined : undefined);

  return {
    ...user,
    birthDate: birthDate || user.birthDate,
    residentRegistrationNumberPrefix,
  };
}

// 사용자 목록을 조회하는 요청
export async function getUsers(query?: UserListQueryParamsDto) {
  const response = await authClient.get<UserListResponseDto>("/api/v1/users", {
    params: query,
  });
  return {
    ...response.data,
    content: response.data.content?.map(normalizeUserResponse),
  };
}

// 새 사용자를 생성하는 요청
export async function createUser(body: CreateUserRequestDto) {
  const response = await authClient.post<UserResponseDto>("/api/v1/users", body);
  return normalizeUserResponse(response.data);
}

// 특정 사용자 상세 정보를 조회하는 요청
export async function getUserDetail(pathParams: UserPathParamsDto) {
  const response = await authClient.get<UserResponseDto>(`/api/v1/users/${pathParams.userId}`);
  return normalizeUserResponse(response.data);
}

// 특정 사용자 정보를 수정하는 요청
export async function updateUser(pathParams: UserPathParamsDto, body: UpdateUserRequestDto) {
  const response = await authClient.patch<UserResponseDto>(
    `/api/v1/users/${pathParams.userId}`,
    body,
  );
  return normalizeUserResponse(response.data);
}

// 특정 사용자의 대표 분반을 지정/변경하는 요청
export async function assignUserClassroom(
  pathParams: UserPathParamsDto,
  body: AssignUserClassroomRequestDto,
) {
  const response = await authClient.put<UserResponseDto>(
    `/api/v1/users/${pathParams.userId}/classroom`,
    body,
  );
  return normalizeUserResponse(response.data);
}

// 특정 사용자의 대표 분반을 해제하는 요청
export async function releaseUserClassroom(pathParams: UserPathParamsDto) {
  await authClient.delete(`/api/v1/users/${pathParams.userId}/classroom`);
}

// 특정 사용자를 삭제하는 요청
export async function deleteUser(pathParams: UserPathParamsDto) {
  await authClient.delete(`/api/v1/users/${pathParams.userId}`);
}

// 현재 로그인한 사용자 정보를 조회하는 요청
export async function getCurrentUser() {
  const response = await authClient.get<UserResponseDto>("/api/v1/users/me");
  return normalizeUserResponse(response.data);
}

// 현재 로그인한 사용자 정보를 수정하는 요청
export async function updateCurrentUser(body: UpdateSelfRequestDto) {
  const response = await authClient.patch<UserResponseDto>("/api/v1/users/me", body);
  return normalizeUserResponse(response.data);
}

// 특정 사용자의 역할 목록을 조회하는 요청
export async function getUserPermissions(pathParams: UserPathParamsDto) {
  const response = await authClient.get<PermissionResponseDto[]>(
    `/api/v1/users/${pathParams.userId}/permissions`,
  );
  return response.data;
}

// 특정 사용자에게 직접 권한을 추가하는 요청
export async function addUserPermission(
  pathParams: UserPathParamsDto,
  body: UserPermissionRequestDto,
) {
  const response = await authClient.post<PermissionResponseDto[]>(
    `/api/v1/users/${pathParams.userId}/permissions`,
    body,
  );
  return response.data;
}

// 특정 사용자에게서 직접 권한을 제거하는 요청
export async function removeUserPermission(
  pathParams: UserPathParamsDto,
  body: UserPermissionRequestDto,
) {
  const response = await authClient.delete<PermissionResponseDto[]>(
    `/api/v1/users/${pathParams.userId}/permissions`,
    {
      data: body,
    },
  );
  return response.data;
}

// 사용자에게 부여할 수 있는 권한 선택지를 조회하는 요청
export async function getAssignablePermissions() {
  const response = await authClient.get<PermissionDefinitionDto[]>(
    "/api/v1/permission-registry",
  );
  return response.data;
}

// 현재 활동 중인 교사 연락망을 조회하는 요청
export async function getTeacherContacts() {
  const response = await authClient.get<TeacherContactResponseDto[]>(
    "/api/v1/teachers/contact-list",
  );
  return response.data;
}
