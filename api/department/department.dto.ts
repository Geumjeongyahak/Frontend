export interface DepartmentResponseDto {
  id?: number;
  name?: string;
  description?: string;
}

export interface PermissionResponseDto {
  id?: number | null;
  name?: string;
  code?: string;
  permissionCode?: string;
  resourceCode?: string;
  resourceLabel?: string;
  actionCode?: string;
  actionLabel?: string;
  scope?: "global" | "target";
  targetId?: number | null;
  targetName?: string | null;
  source?: "MANUAL" | "MEMBER" | "MANAGER" | null;
}

export interface DepartmentPermissionRequestDto {
  permissionCode: string;
  roleType?: "MEMBER" | "MANAGER";
}

export interface DepartmentUserSummaryDto {
  id?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  departmentId?: number | null;
  classroomId?: number | null;
  teacherAssignmentCount?: number;
  teacherAssignmentClassroomNames?: string[];
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
