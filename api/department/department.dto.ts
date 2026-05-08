export interface DepartmentResponseDto {
  id?: number;
  name?: string;
  description?: string;
}

export interface PermissionResponseDto {
  name?: string;
  code?: string;
}

export interface DepartmentPermissionRequestDto {
  permissionCode?: string;
}

export interface DepartmentUserSummaryDto {
  id?: number;
  name?: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  departmentId?: number | null;
}

export interface DepartmentListResponseDto {
  departments?: DepartmentResponseDto[];
}

export interface DepartmentDetailResponseDto extends DepartmentResponseDto {
  permissions?: PermissionResponseDto[];
  users?: DepartmentUserSummaryDto[];
  createdAt?: string;
  updatedAt?: string;
}

export type DepartmentListItemDto = DepartmentResponseDto;

export interface CreateDepartmentRequestDto {
  name: string;
  description: string;
  permissions?: DepartmentPermissionRequestDto[];
}

export interface UpdateDepartmentRequestDto {
  name?: string;
  description?: string;
  permissions?: DepartmentPermissionRequestDto[];
}

export type RoleResponseDto = PermissionResponseDto;

export interface DepartmentPathParamsDto {
  id: number;
}
