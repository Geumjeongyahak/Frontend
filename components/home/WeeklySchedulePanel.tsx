"use client";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/api/lesson/lesson.api";
import WeeklyScheduleCard from "@/components/home/WeeklyScheduleCard";
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { queryKeys } from "@/lib/queryKeys";
import { mapLessonsToWeeklySchedule } from "@/utils/mapLessonsToWeeklySchedule";

dayjs.extend(isoWeek);

export default function WeeklySchedulePanel() {
  const { isAuthenticated, navigateWhenAuthenticated } = useProtectedHomeNavigation();
  const from = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
  const to = dayjs().endOf("isoWeek").format("YYYY-MM-DD");

  const { data: lessons = [] } = useQuery({
    queryKey: queryKeys.lessons.weekly(from, to),
    queryFn: () => getLessons({ from, to }),
    enabled: isAuthenticated,
    retry: false,
  });

  const weeklySchedule = mapLessonsToWeeklySchedule(lessons);

  return (
    <WeeklyScheduleCard
      schedule={weeklySchedule}
      onViewAllClick={() => navigateWhenAuthenticated("/staff/calendar")}
    />
  );
}
