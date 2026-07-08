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
];

export const DISPLAY_PERIODS = [1, 2, 3] as const;

export type WeeklyScheduleStatus =
  | "EXCHANGED"
  | "SUBSTITUTED"
  | "CANCELLED"
  | "ABSENT"
  | "ATTENDED"
  | "CHECKED_OUT";

export type WeeklyScheduleLessonStatus = Extract<
  WeeklyScheduleStatus,
  "EXCHANGED" | "SUBSTITUTED" | "CANCELLED"
>;

export type WeeklyScheduleAttendanceStatus = Extract<
  WeeklyScheduleStatus,
  "ABSENT" | "ATTENDED" | "CHECKED_OUT"
>;

export type WeeklyScheduleOverride = {
  status?: WeeklyScheduleStatus;
  lessonStatus?: WeeklyScheduleLessonStatus;
  attendanceStatus?: WeeklyScheduleAttendanceStatus;
  teacherName?: string;
  subjectName?: string;
  relatedDate?: string;
  attendedAt?: string;
  checkedOutAt?: string;
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

function hasLessonStarted(date?: string, startTime?: string) {
  if (!date || !startTime) {
    return false;
  }

  const startAt = dayjs(`${date}T${startTime}`);

  if (!startAt.isValid()) {
    return false;
  }

  return !startAt.isAfter(dayjs());
}

function getAttendanceStatus(
  lesson: LessonSummaryResponseDto,
  hasAssignedTeacher: boolean,
  canShowAttendanceStatus: boolean,
) {
  if (!hasAssignedTeacher || !canShowAttendanceStatus) {
    return undefined;
  }

  const isTeacherAttended = lesson.teacherAttendance?.isAttended === true;
  const isTeacherCheckedOut = lesson.teacherAttendance?.isCheckedOut === true;

  if (isTeacherCheckedOut) {
    return "CHECKED_OUT" as const;
  }

  if (isTeacherAttended) {
    return "ATTENDED" as const;
  }

  if (
    lesson.teacherAttendance &&
    lesson.teacherAttendance.isAttended === false &&
    lesson.teacherAttendance.isCheckedOut === false
  ) {
    return "ABSENT" as const;
  }

  return undefined;
}

export function formatWeeklyScheduleStatusLabel(status?: WeeklyScheduleStatus) {
  if (status === "EXCHANGED") return "교환";
  if (status === "SUBSTITUTED") return "대체";
  if (status === "CANCELLED") return "결강";
  if (status === "ABSENT") return "결근";
  if (status === "ATTENDED") return "출근";
  if (status === "CHECKED_OUT") return "퇴근";
  return "";
}

export function formatTeacherAttendanceTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("HH:mm") : "";
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

    const periodSubject = getPeriodSubject(cellSubjects, lesson.period);
    const lessonOverrideBase = {
      teacherName: lesson.teacherName,
      subjectName: lesson.subjectName,
      attendedAt: lesson.teacherAttendance?.attendedAt ?? undefined,
      checkedOutAt: lesson.teacherAttendance?.checkedOutAt ?? undefined,
    };

    if (lesson.isAbsent || lesson.status === "CANCELED" || lesson.status === "CANCELLED") {
      overrides.set(lesson.period, {
        ...lessonOverrideBase,
        status: "CANCELLED",
        lessonStatus: "CANCELLED",
      });
      continue;
    }

    const hasAssignedTeacher =
      Boolean(lesson.teacherName?.trim()) || Boolean(periodSubject?.teacherName?.trim());
    const canShowAttendanceStatus = hasLessonStarted(
      lesson.date,
      lesson.startTime ?? periodSubject?.startTime,
    );
    const attendanceStatus = getAttendanceStatus(
      lesson,
      hasAssignedTeacher,
      canShowAttendanceStatus,
    );

    if (lesson.isExchanged) {
      const lessonStatus = lesson.exchangedLessonDate ? "EXCHANGED" : "SUBSTITUTED";

      overrides.set(lesson.period, {
        ...lessonOverrideBase,
        status: attendanceStatus ?? lessonStatus,
        lessonStatus,
        attendanceStatus,
        relatedDate: lesson.exchangedLessonDate ?? undefined,
      });
      continue;
    }

    if (attendanceStatus) {
      overrides.set(lesson.period, {
        ...lessonOverrideBase,
        status: attendanceStatus,
        attendanceStatus,
      });
      continue;
    }

    if (lesson.teacherName?.trim() || lesson.subjectName?.trim()) {
      overrides.set(lesson.period, lessonOverrideBase);
    }
  }

  return overrides;
}
