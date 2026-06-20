import authClient from "../client/authClient";
import type {
  CreateDepartmentRequestDto,
  DepartmentDetailResponseDto,
  DepartmentListResponseDto,
  DepartmentPermissionRequestDto,
  DepartmentPathParamsDto,
  DepartmentResponseDto,
  PermissionResponseDto,
  UpdateDepartmentRequestDto,
} from "./department.dto";

export async function getDepartments() {
  const response = await authClient.get<DepartmentListResponseDto>("/api/v1/departments");
  return response.data;
}

export async function createDepartment(body: CreateDepartmentRequestDto) {
  const response = await authClient.post<DepartmentResponseDto>("/api/v1/departments", body);
  return response.data;
}

export async function getDepartmentDetail(pathParams: DepartmentPathParamsDto) {
  const response = await authClient.get<DepartmentDetailResponseDto>(
    `/api/v1/departments/${pathParams.id}`,
  );
  return response.data;
}

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

export async function deleteDepartment(pathParams: DepartmentPathParamsDto) {
  await authClient.delete(`/api/v1/departments/${pathParams.id}`);
}

function toDepartmentPermissionRequest(
  permission: PermissionResponseDto,
): DepartmentPermissionRequestDto | null {
  const permissionCode = permission.permissionCode ?? permission.code;

  if (!permissionCode) {
    return null;
  }

  if (permission.source === "MANAGER") {
    return { permissionCode, roleType: "MANAGER" };
  }

  if (permission.source === "MEMBER") {
    return { permissionCode, roleType: "MEMBER" };
  }

  return { permissionCode };
}

function dedupeDepartmentPermissions(
  permissions: DepartmentPermissionRequestDto[],
): DepartmentPermissionRequestDto[] {
  const seen = new Set<string>();

  return permissions.filter((permission) => {
    const key = `${permission.roleType ?? "MEMBER"}:${permission.permissionCode}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function updateDepartmentPermissions(
  pathParams: DepartmentPathParamsDto,
  transform: (permissions: DepartmentPermissionRequestDto[]) => DepartmentPermissionRequestDto[],
) {
  const detail = await getDepartmentDetail(pathParams);
  const currentPermissions = (detail.permissions ?? [])
    .map(toDepartmentPermissionRequest)
    .filter((permission): permission is DepartmentPermissionRequestDto => permission !== null);
  const nextPermissions = dedupeDepartmentPermissions(transform(currentPermissions));

  return updateDepartment(pathParams, { permissions: nextPermissions });
}

export async function addDepartmentPermission(
  pathParams: DepartmentPathParamsDto,
  body: DepartmentPermissionRequestDto,
) {
  return updateDepartmentPermissions(pathParams, (permissions) => [...permissions, body]);
}

export async function removeDepartmentPermission(
  pathParams: DepartmentPathParamsDto,
  body: DepartmentPermissionRequestDto,
) {
  return updateDepartmentPermissions(
    pathParams,
    (permissions) =>
      permissions.filter((permission) => {
        if (permission.permissionCode !== body.permissionCode) {
          return true;
        }

        if (!body.roleType) {
          return false;
        }

        return (permission.roleType ?? "MEMBER") !== body.roleType;
      }),
  );
}
