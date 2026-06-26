import type {
  DailyScheduleDetailResponseDto,
  DailyScheduleLessonResponseDto,
  UpdateDailyScheduleJournalRequestDto,
} from "@/api/dailySchedule/dailySchedule.dto";
import { formatPhone } from "@/utils/formatPhone";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const LESSON_PERIOD_COUNT = 3;
const ATTENDANCE_SLOT_COUNT = 10;

function trimTrailingClockSeconds(time?: string) {
  if (!time) return "";
  return time.endsWith(":00") ? time.slice(0, -3) : time;
}

function formatLessonsActivityTime(lessons: DailyScheduleDetailResponseDto["lessons"]) {
  if (!lessons?.length) return "";

  const sorted = [...lessons].sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
  const start = trimTrailingClockSeconds(sorted[0]?.startTime);
  const end = trimTrailingClockSeconds(sorted[sorted.length - 1]?.endTime);

  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}

export function orderDailyScheduleLessons(lessons?: DailyScheduleLessonResponseDto[]) {
  return [...(lessons ?? [])]
    .map((lesson, index) => ({ lesson, index }))
    .sort((a, b) => {
      const periodA = a.lesson.period;
      const periodB = b.lesson.period;
      if (typeof periodA === "number" && typeof periodB === "number") return periodA - periodB;
      return a.index - b.index;
    })
    .map(({ lesson }) => lesson);
}

export function buildUpdateJournalBody(
  schedule: DailyScheduleDetailResponseDto,
  notes: string[],
): UpdateDailyScheduleJournalRequestDto {
  const orderedLessons = orderDailyScheduleLessons(schedule.lessons);

  return {
    personalInfoConsent: schedule.personalInfoConsent ?? true,
    residentRegistrationNumberPrefix: schedule.residentRegistrationNumberPrefix ?? undefined,
    lessonJournals: Array.from({ length: LESSON_PERIOD_COUNT }, (_, index) => {
      const lessonId = orderedLessons[index]?.lessonId;
      if (typeof lessonId !== "number") return null;
      return { lessonId, note: notes[index] ?? "" };
    }).filter((entry): entry is { lessonId: number; note: string } => entry !== null),
  };
}

function formatAttendanceStatus(status?: string) {
  if (status === "PRESENT") return "O";
  if (status === "ABSENT") return "X";
  if (status === "LATE") return "X";
  return "";
}

export type ClassJournalDetailView = {
  createdAt: string;
  writer: string;
  birthPrefix: string;
  phone: string;
  className: string;
  activityDate: string;
  activityTime: string;
  lessons: string[];
  attendance: { name: string; status: string }[];
};

export function mapClassJournalDetailView(
  schedule: DailyScheduleDetailResponseDto,
): ClassJournalDetailView {
  const orderedLessons = orderDailyScheduleLessons(schedule.lessons);
  const students = schedule.studentAttendances ?? [];

  return {
    createdAt: formatUtcToKstShortDate(`${schedule.lessonDate}T00:00:00`),
    writer: schedule.teacherName ?? "",
    birthPrefix: schedule.residentRegistrationNumberPrefix ?? "",
    phone: schedule.teacherPhoneNumber ? formatPhone(schedule.teacherPhoneNumber) : "",
    className: schedule.classroomName ?? "",
    activityDate: formatUtcToKstShortDate(`${schedule.lessonDate}T00:00:00`),
    activityTime: formatLessonsActivityTime(schedule.lessons),
    lessons: Array.from({ length: LESSON_PERIOD_COUNT }, (_, index) => orderedLessons[index]?.note ?? ""),
    attendance: Array.from({ length: ATTENDANCE_SLOT_COUNT }, (_, index) => {
      const student = students[index];
      if (!student) return { name: "", status: "" };
      return {
        name: student.studentName ?? "",
        status: formatAttendanceStatus(student.status),
      };
    }),
  };
}
