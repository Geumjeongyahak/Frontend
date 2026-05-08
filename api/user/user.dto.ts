export type UserRole = string;

export interface PermissionResponseDto {
  name?: string;
  code?: string;
}

export interface UserResponseDto {
  id?: number;
  name?: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  departmentId?: number | null;
  permissions?: PermissionResponseDto[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserListItemDto = UserResponseDto;

export interface UserListResponseDto {
  content?: UserListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface DepartmentResponseDto {
  id?: number;
  name?: string;
  description?: string;
}

export interface DepartmentListResponseDto {
  departments?: DepartmentResponseDto[];
}

export interface UserListQueryParamsDto {
  page?: number;
  size?: number;
}

export interface CreateUserRequestDto {
  email: string;
  nickname: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role?: UserRole;
  departmentId?: number | null;
}

export interface UpdateUserRequestDto {
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  departmentId?: number | null;
}

export interface UpdateSelfRequestDto {
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}

export interface UserPermissionRequestDto {
  permissionCode: string;
}

export interface UserPathParamsDto {
  userId: number;
}

export type RoleResponseDto = PermissionResponseDto;
