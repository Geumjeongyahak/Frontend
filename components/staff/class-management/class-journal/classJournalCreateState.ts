import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { SubjectDayOfWeek, SubjectDetailResponseDto } from "@/api/subject/subject.dto";

export type TodayLessonOption = {
  classroomId: number;
  classroomName: string;
  subjectName: string;
  activityTime: string;
  lessonDate: string;
  source: "lesson" | "subject";
};

function trimTrailingClockSeconds(time?: string) {
  if (!time) return "";
  return time.endsWith(":00") ? time.slice(0, -3) : time;
}

export function formatLessonRange(lessons: LessonSummaryResponseDto[]) {
  if (!lessons.length) return "";

  const sorted = [...lessons].sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
  const start = trimTrailingClockSeconds(sorted[0]?.startTime);
  const end = trimTrailingClockSeconds(sorted[sorted.length - 1]?.endTime);

  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}

export function buildTodayLessonOptions(lessons: LessonSummaryResponseDto[]) {
  const grouped = new Map<string, LessonSummaryResponseDto[]>();

  for (const lesson of lessons) {
    if (typeof lesson.classroomId !== "number" || !lesson.date) continue;
    if (lesson.status === "CANCELED" || lesson.status === "CANCELLED") continue;

    const key = `${lesson.classroomId}:${lesson.date}`;
    const current = grouped.get(key) ?? [];
    current.push(lesson);
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .flatMap((group) => {
      const first = group[0];
      const classroomId = first?.classroomId;
      const lessonDate = first?.date;

      if (typeof classroomId !== "number" || !lessonDate) return [];

      return [{
        classroomId,
        classroomName: first.classroomName?.trim() || "",
        subjectName: first.subjectName?.trim() || "",
        activityTime: formatLessonRange(group),
        lessonDate,
        source: "lesson",
      } satisfies TodayLessonOption];
    })
    .sort((a, b) => {
      if (a.lessonDate !== b.lessonDate) return a.lessonDate.localeCompare(b.lessonDate);
      return a.classroomId - b.classroomId;
    });
}

function mapIsoDayToSubjectDay(isoDate: string): SubjectDayOfWeek {
  const day = new Date(`${isoDate}T00:00:00`).getDay();
  if (day === 0) return "SUNDAY";
  if (day === 1) return "MONDAY";
  if (day === 2) return "TUESDAY";
  if (day === 3) return "WEDNESDAY";
  if (day === 4) return "THURSDAY";
  if (day === 5) return "FRIDAY";
  return "SATURDAY";
}

export function buildTodayLessonOptionsFromSubjects(
  subjects: SubjectDetailResponseDto[],
  isoDate: string,
) {
  const todayDayOfWeek = mapIsoDayToSubjectDay(isoDate);
  const grouped = new Map<number, SubjectDetailResponseDto[]>();

  for (const subject of subjects
    .filter((subject) => {
      if (subject.isActive === false) return false;
      if (typeof subject.classroomId !== "number") return false;
      if (subject.dayOfWeek !== todayDayOfWeek) return false;
      if (subject.startAt && subject.startAt > isoDate) return false;
      if (subject.endAt && subject.endAt < isoDate) return false;
      return true;
    })
  ) {
    const classroomId = subject.classroomId as number;
    const current = grouped.get(classroomId) ?? [];
    current.push(subject);
    grouped.set(classroomId, current);
  }

  return [...grouped.entries()]
    .map(([classroomId, group]) => {
      const first = group[0];
      return {
        classroomId,
        classroomName: first?.classroomName?.trim() || "",
        subjectName: first?.name?.trim() || "",
        activityTime: formatLessonRange(
          group.map((subject) => ({
            period: subject.period,
            startTime: subject.startTime,
            endTime: subject.endTime,
          })),
        ),
        lessonDate: isoDate,
        source: "subject",
      } satisfies TodayLessonOption;
    })
    .sort((a, b) => a.classroomId - b.classroomId);
}
