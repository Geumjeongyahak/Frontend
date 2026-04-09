export type UserRole = string;

export interface RoleResponseDto {
  name?: string;
  level?: string | number;
  code?: number;
}

export interface UserResponseDto {
  id?: number;
  username?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  roles?: RoleResponseDto[];
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
  username: string;
  password: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UpdateUserRequestDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UpdateSelfRequestDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}

export interface AddSubRoleRequestDto {
  subRole?: string;
}

export interface RemoveSubRoleRequestDto {
  subRole?: string;
}

export interface JoinDepartmentRequestDto {
  departmentId: number;
}

export interface UserPathParamsDto {
  userId: number;
}

export interface LeaveDepartmentPathParamsDto {
  userId: number;
  departmentId: number;
}
