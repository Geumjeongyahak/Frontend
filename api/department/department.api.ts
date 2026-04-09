import authClient from "../client/authClient";
import type {
  CreateDepartmentRequestDto,
  DepartmentDetailResponseDto,
  DepartmentListResponseDto,
  DepartmentPathParamsDto,
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
