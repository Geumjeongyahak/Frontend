"use client";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/api/event/event.api";
import WeeklyScheduleCard from "@/components/home/WeeklyScheduleCard";
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { queryKeys } from "@/lib/queryKeys";
import { mapLessonsToWeeklySchedule } from "@/utils/mapLessonsToWeeklySchedule";

dayjs.extend(isoWeek);

export default function WeeklySchedulePanel() {
  const { isAuthenticated, navigateWhenAuthenticated, user } = useProtectedHomeNavigation();
  const from = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
  const to = dayjs().endOf("isoWeek").format("YYYY-MM-DD");

  const { data: eventsPage } = useQuery({
    queryKey: queryKeys.events.weekly(from, to),
    queryFn: () => getEvents({ startDate: from, endDate: to, page: 0, size: 100 }),
    enabled: isAuthenticated,
    retry: false,
  });

  const weeklySchedule = mapLessonsToWeeklySchedule(
    user?.teacherAssignments ?? [],
    eventsPage?.content ?? [],
    from,
  );

  return (
    <WeeklyScheduleCard
      schedule={weeklySchedule}
      onViewAllClick={() => navigateWhenAuthenticated("/staff/calendar")}
    />
  );
}
