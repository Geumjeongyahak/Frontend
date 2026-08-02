import type { DailyScheduleSummaryResponseDto } from "@/api/dailySchedule/dailySchedule.dto";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const LESSON_PERIOD_LABELS = ["1교시", "2교시", "3교시"] as const;

export type ClassJournalListItem = {
  id: number;
  className: string;
  teacher: string;
  date: string;
  lessons: { period: string; content: string }[];
};

export function mapClassJournalListItem(
  schedule: DailyScheduleSummaryResponseDto,
): ClassJournalListItem {
  const orderedLessons = [...(schedule.lessons ?? [])]
    .map((lesson, index) => ({ lesson, index }))
    .sort((a, b) => {
      const periodA = a.lesson.period;
      const periodB = b.lesson.period;
      if (typeof periodA === "number" && typeof periodB === "number") return periodA - periodB;
      return a.index - b.index;
    })
    .map(({ lesson }) => lesson);

  const subjectLabel = orderedLessons
    .map((lesson) => lesson.subjectName)
    .filter((name): name is string => Boolean(name))
    .join("/");

  return {
    id: schedule.dailyScheduleId,
    className: subjectLabel ? `${schedule.classroomName} ${subjectLabel}` : schedule.classroomName,
    teacher: schedule.teacherName,
    date: formatUtcToKstShortDate(`${schedule.lessonDate}T00:00:00`),
    lessons: LESSON_PERIOD_LABELS.map((period, index) => ({
      period,
      content: orderedLessons[index]?.note ?? "",
    })),
  };
}
