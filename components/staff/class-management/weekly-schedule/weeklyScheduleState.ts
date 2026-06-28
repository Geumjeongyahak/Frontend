import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { SubjectDayOfWeek, SubjectDetailResponseDto } from "@/api/subject/subject.dto";

dayjs.extend(isoWeek);

export const WEEKDAY_COLUMNS: { value: SubjectDayOfWeek; label: string; isoWeekday: number }[] = [
  { value: "MONDAY", label: "월", isoWeekday: 1 },
  { value: "TUESDAY", label: "화", isoWeekday: 2 },
  { value: "WEDNESDAY", label: "수", isoWeekday: 3 },
  { value: "THURSDAY", label: "목", isoWeekday: 4 },
  { value: "FRIDAY", label: "금", isoWeekday: 5 },
];

export const WEEKEND_COLUMNS: { value: SubjectDayOfWeek; label: string; isoWeekday: number }[] = [
  { value: "SATURDAY", label: "토", isoWeekday: 6 },
  { value: "SUNDAY", label: "일", isoWeekday: 7 },
];

export const DISPLAY_PERIODS = [1, 2, 3] as const;

export type WeeklyScheduleStatus = "EXCHANGED" | "SUBSTITUTED" | "CANCELLED";

export type WeeklyScheduleOverride = {
  status?: WeeklyScheduleStatus;
  teacherName?: string;
  subjectName?: string;
  relatedDate?: string;
};

export function formatRelatedLessonDate(value?: string) {
  if (!value) return "";
  return `(${dayjs(value).format("MM/DD")})`;
}

export function getWeekRange(anchorDate = new Date()) {
  const anchor = dayjs(anchorDate);
  return {
    from: anchor.startOf("isoWeek").format("YYYY-MM-DD"),
    to: anchor.endOf("isoWeek").format("YYYY-MM-DD"),
  };
}

export function getDateForColumn(weekStartDate: string, isoWeekday: number) {
  return dayjs(weekStartDate).isoWeekday(isoWeekday).format("YYYY-MM-DD");
}

export function getSubjectsForCell(
  subjects: SubjectDetailResponseDto[],
  classroomId: number | null,
  dayOfWeek: SubjectDayOfWeek,
  date?: string,
) {
  if (classroomId == null) return [];

  return subjects
    .filter((subject) => {
      if (subject.classroomId !== classroomId || subject.dayOfWeek !== dayOfWeek) {
        return false;
      }

      if (date && subject.startAt && subject.startAt > date) {
        return false;
      }

      if (date && subject.endAt && subject.endAt < date) {
        return false;
      }

      return true;
    })
    .sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
}

export function getPeriodSubject(subjects: SubjectDetailResponseDto[], period: number) {
  return subjects.find((subject) => subject.period === period);
}

export function buildScheduleOverrides(
  cellSubjects: SubjectDetailResponseDto[],
  lessons: LessonSummaryResponseDto[],
  classroomId: number | null,
  date: string,
) {
  const overrides = new Map<number, WeeklyScheduleOverride>();
  if (classroomId == null) return overrides;

  for (const lesson of lessons) {
    if (lesson.classroomId !== classroomId || lesson.date !== date || typeof lesson.period !== "number") {
      continue;
    }

    const lessonOverrideBase = {
      teacherName: lesson.teacherName,
      subjectName: lesson.subjectName,
    };

    if (lesson.isAbsent || lesson.status === "CANCELED" || lesson.status === "CANCELLED") {
      overrides.set(lesson.period, {
        ...lessonOverrideBase,
        status: "CANCELLED",
      });
      continue;
    }

    if (lesson.isExchanged) {
      overrides.set(lesson.period, {
        ...lessonOverrideBase,
        status: lesson.exchangedLessonDate ? "EXCHANGED" : "SUBSTITUTED",
        relatedDate: lesson.exchangedLessonDate ?? undefined,
      });
      continue;
    }

    if (lesson.teacherName?.trim() || lesson.subjectName?.trim()) {
      overrides.set(lesson.period, lessonOverrideBase);
    }
  }

  return overrides;
}
