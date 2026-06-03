import type { ClassroomType } from "@/api/classroom/classroom.dto";
import type { CreateSubjectRequestDto, SubjectDayOfWeek } from "@/api/subject/subject.dto";
import { normalizeLessonTimeForApi } from "@/components/admin/lesson-management/lessonCreateError";

export const SUBJECT_DAY_OPTIONS: { value: SubjectDayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "월" },
  { value: "TUESDAY", label: "화" },
  { value: "WEDNESDAY", label: "수" },
  { value: "THURSDAY", label: "목" },
  { value: "FRIDAY", label: "금" },
  { value: "SATURDAY", label: "토" },
  { value: "SUNDAY", label: "일" },
];

export function formatClassroomTypeLabel(type?: ClassroomType) {
  if (type === "WEEKDAY") return "주중반";
  if (type === "WEEKEND") return "주말반";
  return type ?? "";
}

export function compareIsoDates(startAt: string, endAt: string) {
  if (!startAt || !endAt) return 0;
  return startAt.localeCompare(endAt);
}

export type SubjectCreateFormValues = {
  classroomId: number | null;
  teacherId: number | null;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  dayOfWeek: SubjectDayOfWeek | null;
  startTime: string;
  endTime: string;
  period: string;
};

export function validateSubjectCreateForm(values: SubjectCreateFormValues) {
  if (values.classroomId == null) return "분반을 선택해 주세요.";
  if (!values.name.trim()) return "과목명을 입력해 주세요.";
  if (!values.startAt) return "시작일을 선택해 주세요.";
  if (!values.endAt) return "종료일을 선택해 주세요.";
  if (compareIsoDates(values.startAt, values.endAt) > 0) {
    return "시작일은 종료일보다 늦을 수 없습니다.";
  }
  if (!values.dayOfWeek) return "요일을 선택해 주세요.";
  if (!values.startTime.trim()) return "시작 시간을 선택해 주세요.";
  if (!values.endTime.trim()) return "종료 시간을 선택해 주세요.";

  const parsedPeriod = Number(values.period);
  if (!Number.isInteger(parsedPeriod) || parsedPeriod < 1) {
    return "교시는 1 이상의 숫자로 입력해 주세요.";
  }

  return null;
}

export function mapSubjectCreateFormToPayload(
  values: SubjectCreateFormValues,
): CreateSubjectRequestDto {
  const classroomId = values.classroomId as number;
  const payload: CreateSubjectRequestDto = {
    classroomId,
    name: values.name.trim(),
    startAt: values.startAt,
    endAt: values.endAt,
    dayOfWeek: values.dayOfWeek as SubjectDayOfWeek,
    startTime: normalizeLessonTimeForApi(values.startTime),
    endTime: normalizeLessonTimeForApi(values.endTime),
    period: Number(values.period),
  };

  if (values.teacherId != null) {
    payload.teacherId = values.teacherId;
  }

  const description = values.description.trim();
  if (description) {
    payload.description = description;
  }

  return payload;
}
