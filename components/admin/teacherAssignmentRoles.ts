import type { UserListItemDto, UserRole } from "@/api/user/user.dto";

const ASSIGNABLE_TEACHER_ROLES: UserRole[] = ["VOLUNTEER", "MANAGER", "ADMIN"];

export function isAssignableTeacherRole(role?: UserRole | null) {
  return role == null || ASSIGNABLE_TEACHER_ROLES.includes(role);
}

export function filterAssignableTeachers(users: UserListItemDto[] | undefined) {
  return (users ?? []).filter((user) => isAssignableTeacherRole(user.role));
}
