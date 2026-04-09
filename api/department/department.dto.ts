export interface DepartmentResponseDto {
  id?: number;
  name?: string;
  description?: string;
}

export interface RoleResponseDto {
  name?: string;
  level?: string | number;
  code?: number;
}

export interface DepartmentUserSummaryDto {
  id?: number;
  username?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  roles?: RoleResponseDto[];
}

export interface DepartmentListResponseDto {
  departments?: DepartmentResponseDto[];
}

export interface DepartmentDetailResponseDto extends DepartmentResponseDto {
  assignedRole?: RoleResponseDto;
  users?: DepartmentUserSummaryDto[];
}

export type DepartmentListItemDto = DepartmentResponseDto;

export interface CreateDepartmentRequestDto {
  name: string;
  description: string;
}

export interface UpdateDepartmentRequestDto {
  name?: string;
  description?: string;
}

export interface DepartmentPathParamsDto {
  id: number;
}
