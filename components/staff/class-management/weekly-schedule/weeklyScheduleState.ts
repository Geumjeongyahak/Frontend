import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { DailyScheduleSummaryResponseDto } from "@/api/dailySchedule/dailySchedule.dto";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { AbsenceRequestResponseDto } from "@/api/request/request.dto";
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

export type WeeklyScheduleStatus = "EXCHANGED" | "CANCELLED";

export type WeeklyScheduleOverride = {
  status: WeeklyScheduleStatus;
  teacherName?: string;
  subjectName?: string;
  relatedDate?: string;
};

type LessonWithExchangeFields = LessonSummaryResponseDto & {
  status?: string;
  exchangeDate?: string;
  exchangeWithDate?: string;
  exchangedDate?: string;
  exchangedFromDate?: string;
  exchangedToDate?: string;
  originalLessonDate?: string;
  targetLessonDate?: string;
};

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
) {
  if (classroomId == null) return [];

  return subjects
    .filter((subject) => subject.classroomId === classroomId && subject.dayOfWeek === dayOfWeek)
    .sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
}

export function getPeriodSubject(subjects: SubjectDetailResponseDto[], period: number) {
  return subjects.find((subject) => subject.period === period);
}

export function buildScheduleOverrides(
  cellSubjects: SubjectDetailResponseDto[],
  lessons: LessonSummaryResponseDto[],
  dailySchedules: DailyScheduleSummaryResponseDto[],
  absenceRequests: AbsenceRequestResponseDto[],
  classroomId: number | null,
  date: string,
) {
  const overrides = new Map<number, WeeklyScheduleOverride>();
  if (classroomId == null) return overrides;

  const dailySchedule = dailySchedules.find(
    (schedule) => schedule.classroomId === classroomId && schedule.lessonDate === date,
  );
  const approvedAbsenceRequest = absenceRequests.find(
    (request) =>
      request.classroomId === classroomId &&
      request.lessonDate === date &&
      request.status === "APPROVED",
  );

  if (dailySchedule?.status === "CANCELLED") {
    if (cellSubjects.length === 0) {
      overrides.set(DISPLAY_PERIODS[0], {
        status: "CANCELLED",
        teacherName: dailySchedule.teacherName,
      });
    }

    for (const subject of cellSubjects) {
      if (typeof subject.period === "number") {
        overrides.set(subject.period, {
          status: "CANCELLED",
          teacherName: dailySchedule.teacherName,
        });
      }
    }
  }

  if (approvedAbsenceRequest) {
    if (cellSubjects.length === 0) {
      overrides.set(DISPLAY_PERIODS[0], {
        status: "CANCELLED",
        teacherName: approvedAbsenceRequest.requestedByName,
      });
    }

    for (const subject of cellSubjects) {
      if (typeof subject.period === "number" && !overrides.has(subject.period)) {
        overrides.set(subject.period, {
          status: "CANCELLED",
          teacherName: approvedAbsenceRequest.requestedByName,
        });
      }
    }
  }

  for (const lesson of lessons as LessonWithExchangeFields[]) {
    if (lesson.classroomId !== classroomId || lesson.date !== date || typeof lesson.period !== "number") {
      continue;
    }

    if (lesson.status === "CANCELED" || lesson.status === "CANCELLED") {
      overrides.set(lesson.period, {
        status: "CANCELLED",
        teacherName: lesson.teacherName,
        subjectName: lesson.subjectName,
      });
      continue;
    }

    const baseSubject = getPeriodSubject(cellSubjects, lesson.period);
    const hasTeacherChanged =
      Boolean(baseSubject?.teacherName && lesson.teacherName) &&
      baseSubject?.teacherName !== lesson.teacherName;
    const hasSubjectChanged =
      Boolean(baseSubject?.name && lesson.subjectName) && baseSubject?.name !== lesson.subjectName;

    if (hasTeacherChanged || hasSubjectChanged) {
      overrides.set(lesson.period, {
        status: "EXCHANGED",
        teacherName: lesson.teacherName,
        subjectName: lesson.subjectName,
        relatedDate: getExchangeRelatedDate(lesson),
      });
    }
  }

  return overrides;
}

function getExchangeRelatedDate(lesson: LessonWithExchangeFields) {
  return (
    lesson.exchangeWithDate ??
    lesson.exchangeDate ??
    lesson.exchangedDate ??
    lesson.exchangedFromDate ??
    lesson.exchangedToDate ??
    lesson.originalLessonDate ??
    lesson.targetLessonDate
  );
}
