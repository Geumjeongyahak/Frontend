import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { WeeklyScheduleDay } from "@/types/home";

dayjs.extend(isoWeek);

const WEEK_ORDER = ["월", "화", "수", "목", "금", "토", "일"] as const;
type WeekDay = (typeof WEEK_ORDER)[number];
type WeeklyItem = WeeklyScheduleDay["items"][number];

export function mapLessonsToWeeklySchedule(
  lessons: LessonSummaryResponseDto[],
): WeeklyScheduleDay[] {
  const grouped = new Map<WeekDay, WeeklyItem[]>();
  for (const day of WEEK_ORDER) grouped.set(day, []);

  lessons.forEach((lesson) => {
    if (!lesson.date) return;

    const isoDay = dayjs(lesson.date).isoWeekday();
    if (isoDay < 1 || isoDay > 7) return;

    const day = WEEK_ORDER[isoDay - 1];
    grouped.get(day)?.push({
      id: lesson.lessonId,
      time: lesson.startTime ? lesson.startTime.slice(0, 5) : "",
      title: lesson.subjectName ?? "수업",
    });
  });

  return WEEK_ORDER.map((day) => ({
    day,
    items: (grouped.get(day) ?? []).sort((a, b) => a.time.localeCompare(b.time)),
  }));
}
