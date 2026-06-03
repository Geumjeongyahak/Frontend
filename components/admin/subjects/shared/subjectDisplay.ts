import type { SubjectDayOfWeek, SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { SUBJECT_DAY_OPTIONS } from "@/components/admin/subjects/shared/subjectCreateForm";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

export const SUBJECT_NO_TEACHER_LABEL = "배정된 교사 없음";

export function isSubjectTeacherUnassigned(teacherName?: string | null) {
  return !teacherName?.trim();
}

export function formatSubjectDayOfWeek(dayOfWeek?: SubjectDayOfWeek) {
  return SUBJECT_DAY_OPTIONS.find((option) => option.value === dayOfWeek)?.label ?? dayOfWeek ?? "—";
}

export function formatSubjectTeacherName(teacherName?: string | null) {
  const trimmed = teacherName?.trim();
  return trimmed ? trimmed : SUBJECT_NO_TEACHER_LABEL;
}

export function formatSubjectDateRange(startAt?: string, endAt?: string) {
  if (!startAt && !endAt) return "—";
  return `${startAt ?? "—"} ~ ${endAt ?? "—"}`;
}

export function formatSubjectTimeRange(startTime?: string, endTime?: string) {
  const start = startTime ? startTime.slice(0, 5) : "—";
  const end = endTime ? endTime.slice(0, 5) : "—";
  return `${start} ~ ${end}`;
}

export function formatSubjectTeacherAssignedAt(teacherAssignedAt?: string | null) {
  if (!teacherAssignedAt?.trim()) return "—";
  const formatted = formatUtcToKstShortDate(teacherAssignedAt);
  return formatted === "00.00.00" ? "—" : formatted;
}

export function getSubjectId(subject: SubjectDetailResponseDto) {
  return typeof subject.id === "number" ? subject.id : null;
}

export function filterActiveSubjects(subjects: SubjectDetailResponseDto[]) {
  return subjects.filter((subject) => subject.isActive !== false);
}
