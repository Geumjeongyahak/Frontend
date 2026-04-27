import dayjs from "dayjs";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { WeeklyScheduleDay } from "@/types/home";

const KOR_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const WEEK_ORDER = ["월", "화", "수", "목", "금", "토", "일"] as const;

type WeekDay = (typeof WEEK_ORDER)[number];
type WeeklyItem = WeeklyScheduleDay["items"][number];

// API의 lesson 목록(수업 1건 단위)을 주간 카드 UI 모델(요일 컬럼 단위)로 변환하는 함수

export function mapLessonsToWeeklySchedule(
  lessons: LessonSummaryResponseDto[],
): WeeklyScheduleDay[] {
  const grouped = new Map<WeekDay, WeeklyItem[]>();

  for (const day of WEEK_ORDER) grouped.set(day, []);

  lessons.forEach((lesson) => {
    if (!lesson.date) return;

    const day = KOR_DAYS[dayjs(lesson.date).day()];
    if (!WEEK_ORDER.includes(day as WeekDay)) return;

    const title = lesson.subjectName ?? "수업";

    grouped.get(day as WeekDay)?.push({
      time: lesson.startTime ? lesson.startTime.slice(0, 5) : "",
      title,
    });
  });

  return WEEK_ORDER.map((day) => {
    const items = (grouped.get(day) ?? []).sort((a, b) => a.time.localeCompare(b.time));

    return {
      day,
      items,
    };
  });
}
