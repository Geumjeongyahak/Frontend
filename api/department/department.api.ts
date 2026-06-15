import authClient from "../client/authClient";
import type {
  CreateDepartmentRequestDto,
  DepartmentDetailResponseDto,
  DepartmentListResponseDto,
  DepartmentPermissionRequestDto,
  DepartmentPathParamsDto,
  PermissionResponseDto,
  DepartmentResponseDto,
  UpdateDepartmentRequestDto,
} from "./department.dto";

// 부서 목록을 조회하는 요청
export async function getDepartments() {
  const response = await authClient.get<DepartmentListResponseDto>("/api/v1/departments");
  return response.data;
}

// 새 부서를 생성하는 요청
export async function createDepartment(body: CreateDepartmentRequestDto) {
  const response = await authClient.post<DepartmentResponseDto>("/api/v1/departments", body);
  return response.data;
}

// 특정 부서 상세 정보를 조회하는 요청
export async function getDepartmentDetail(pathParams: DepartmentPathParamsDto) {
  const response = await authClient.get<DepartmentDetailResponseDto>(
    `/api/v1/departments/${pathParams.id}`,
  );
  return response.data;
}

// 특정 부서 정보를 수정하는 요청
export async function updateDepartment(
  pathParams: DepartmentPathParamsDto,
  body: UpdateDepartmentRequestDto,
) {
  const response = await authClient.put<DepartmentResponseDto>(
    `/api/v1/departments/${pathParams.id}`,
    body,
  );
  return response.data;
}

// 특정 부서를 삭제하는 요청
export async function deleteDepartment(pathParams: DepartmentPathParamsDto) {
  await authClient.delete(`/api/v1/departments/${pathParams.id}`);
}

// 특정 부서에 권한을 추가하는 요청
export async function addDepartmentPermission(
  pathParams: DepartmentPathParamsDto,
  body: DepartmentPermissionRequestDto,
) {
  const response = await authClient.post<PermissionResponseDto[]>(
    `/api/v1/departments/${pathParams.id}/permissions`,
    body,
  );
  return response.data;
}

// 특정 부서에서 권한을 제거하는 요청
export async function removeDepartmentPermission(
  pathParams: DepartmentPathParamsDto,
  body: DepartmentPermissionRequestDto,
) {
  const response = await authClient.delete<PermissionResponseDto[]>(
    `/api/v1/departments/${pathParams.id}/permissions`,
    {
      data: body,
    },
  );
  return response.data;
}
