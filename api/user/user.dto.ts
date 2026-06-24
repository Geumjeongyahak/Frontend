import type { SubjectDayOfWeek } from "@/api/subject/subject.dto";
import type { ClassroomType } from "@/api/classroom/classroom.dto";

export type UserRole = string;

export interface PermissionResponseDto {
  id?: number;
  permissionCode?: string;
  resourceCode?: string;
  resourceLabel?: string;
  actionCode?: string;
  actionLabel?: string;
  scope?: string;
  targetId?: number | null;
  targetName?: string | null;
  label?: string;
  description?: string;
  name?: string;
  code?: string;
}

export interface PermissionDefinitionDto {
  permissionCode?: string;
  resourceCode?: string;
  resourceLabel?: string;
  actionCode?: string;
  actionLabel?: string;
  scope?: string;
  globalAllowed?: boolean;
  targetAllowed?: boolean;
  label?: string;
  description?: string;
}

export interface UserClassroomResponseDto {
  id?: number;
  name?: string;
  type?: ClassroomType;
}

export interface UserTeacherAssignmentResponseDto {
  subjectId?: number;
  classroomId?: number;
  classNameId?: number;
  classroomName?: string;
  subjectName?: string;
  dayOfWeek?: SubjectDayOfWeek;
  startTime?: string;
  endTime?: string;
  period?: number;
  startAt?: string;
  endAt?: string;
  teacherAssignedAt?: string;
}

export interface UserResponseDto {
  id?: number;
  name?: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  departmentId?: number | null;
  department?: DepartmentResponseDto;
  classroom?: UserClassroomResponseDto;
  teacherAssignments?: UserTeacherAssignmentResponseDto[];
  birthDate?: string;
  residentRegistrationNumberPrefix?: string;
  teacherStartAt?: string;
  teacherEndAt?: string;
  permissions?: PermissionResponseDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherContactResponseDto {
  id?: number;
  name?: string;
  classroomName?: string | null;
  phoneNumber?: string;
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
  role?: UserRole;
  name?: string;
  currentTeacher?: boolean;
  page?: number;
  size?: number;
}

export interface CreateUserRequestDto {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  birthDate: string;
  role?: UserRole;
  departmentId?: number | null;
  classroomId?: number | null;
}

export interface UpdateUserRequestDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  role?: UserRole;
  departmentId?: number | null;
  classroomId?: number | null;
}

export interface UpdateSelfRequestDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  birthDate?: string;
}

export interface UserPermissionRequestDto {
  permissionCode: string;
}

export interface UserPathParamsDto {
  userId: number;
}

export type RoleResponseDto = PermissionResponseDto;
