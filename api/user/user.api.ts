import authClient from "../client/authClient";
import type {
  AddSubRoleRequestDto,
  CreateUserRequestDto,
  DepartmentListResponseDto,
  JoinDepartmentRequestDto,
  LeaveDepartmentPathParamsDto,
  RemoveSubRoleRequestDto,
  RoleResponseDto,
  UpdateSelfRequestDto,
  UpdateUserRequestDto,
  UserListQueryParamsDto,
  UserListResponseDto,
  UserPathParamsDto,
  UserResponseDto,
} from "./user.dto";

// 사용자 목록을 조회하는 요청
export async function getUsers(query?: UserListQueryParamsDto) {
  const response = await authClient.get<UserListResponseDto>("/api/v1/users", {
    params: query,
  });
  return response.data;
}

// 새 사용자를 생성하는 요청
export async function createUser(body: CreateUserRequestDto) {
  const response = await authClient.post<UserResponseDto>("/api/v1/users", body);
  return response.data;
}

// 특정 사용자 상세 정보를 조회하는 요청
export async function getUserDetail(pathParams: UserPathParamsDto) {
  const response = await authClient.get<UserResponseDto>(`/api/v1/users/${pathParams.userId}`);
  return response.data;
}

// 특정 사용자 정보를 수정하는 요청
export async function updateUser(pathParams: UserPathParamsDto, body: UpdateUserRequestDto) {
  const response = await authClient.patch<UserResponseDto>(
    `/api/v1/users/${pathParams.userId}`,
    body,
  );
  return response.data;
}

// 특정 사용자를 삭제하는 요청
export async function deleteUser(pathParams: UserPathParamsDto) {
  await authClient.delete(`/api/v1/users/${pathParams.userId}`);
}

// 현재 로그인한 사용자 정보를 조회하는 요청
export async function getCurrentUser() {
  const response = await authClient.get<UserResponseDto>("/api/v1/users/me");
  return response.data;
}

// 현재 로그인한 사용자 정보를 수정하는 요청
export async function updateCurrentUser(body: UpdateSelfRequestDto) {
  const response = await authClient.patch<UserResponseDto>("/api/v1/users/me", body);
  return response.data;
}

// 특정 사용자의 역할 목록을 조회하는 요청
export async function getUserRoles(pathParams: UserPathParamsDto) {
  const response = await authClient.get<RoleResponseDto[]>(
    `/api/v1/users/${pathParams.userId}/roles`,
  );
  return response.data;
}

// 특정 사용자에게 서브 역할을 추가하는 요청
export async function addUserSubRole(pathParams: UserPathParamsDto, body: AddSubRoleRequestDto) {
  const response = await authClient.post<RoleResponseDto[]>(
    `/api/v1/users/${pathParams.userId}/roles`,
    body,
  );
  return response.data;
}

// 특정 사용자에게서 서브 역할을 제거하는 요청
export async function removeUserSubRole(
  pathParams: UserPathParamsDto,
  body: RemoveSubRoleRequestDto,
) {
  const response = await authClient.delete<RoleResponseDto[]>(
    `/api/v1/users/${pathParams.userId}/roles`,
    {
      data: body,
    },
  );
  return response.data;
}

// 특정 사용자의 부서 목록을 조회하는 요청
export async function getUserDepartments(pathParams: UserPathParamsDto) {
  const response = await authClient.get<DepartmentListResponseDto>(
    `/api/v1/users/${pathParams.userId}/departments`,
  );
  return response.data;
}

// 현재 로그인한 사용자의 부서 목록을 조회하는 요청
export async function getMyDepartments() {
  const response = await authClient.get<DepartmentListResponseDto>("/api/v1/users/me/departments");
  return response.data;
}

// 특정 사용자를 부서에 소속시키는 요청
export async function joinUserDepartment(
  pathParams: UserPathParamsDto,
  body: JoinDepartmentRequestDto,
) {
  await authClient.post(`/api/v1/users/${pathParams.userId}/departments`, body);
}

// 특정 사용자를 부서에서 제외하는 요청
export async function leaveUserDepartment(pathParams: LeaveDepartmentPathParamsDto) {
  await authClient.delete(
    `/api/v1/users/${pathParams.userId}/departments/${pathParams.departmentId}`,
  );
}
