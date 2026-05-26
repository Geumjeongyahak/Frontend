import type { UserListItemDto } from "@/api/user/user.dto";

// TODO(backend): 분반 DB 연동 후 이 파일 삭제하고 classroomId는 API 응답만 사용
const TEACHER_CLASSROOM_FALLBACK: Record<string, number> = {
  김철수: 2,
  홍길동: 1,
};

export function resolveLessonCreateClassroomId(
  teacher?: Pick<UserListItemDto, "name" | "classroom"> | null,
) {
  if (!teacher) return null;

  return teacher.classroom?.id ?? TEACHER_CLASSROOM_FALLBACK[teacher.name?.trim() ?? ""] ?? null;
}
