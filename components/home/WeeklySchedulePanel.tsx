"use client";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllEvents } from "@/api/event/event.api";
import { filterEventsInDateRange } from "@/api/event/eventDisplay";
import WeeklyScheduleCard from "@/components/home/WeeklyScheduleCard";
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { queryKeys } from "@/lib/queryKeys";
import { mapLessonsToWeeklySchedule } from "@/utils/mapLessonsToWeeklySchedule";

dayjs.extend(isoWeek);

export default function WeeklySchedulePanel() {
  const router = useRouter();
  const { navigateWhenAuthenticated, user } = useProtectedHomeNavigation();
  const from = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
  const to = dayjs().endOf("isoWeek").format("YYYY-MM-DD");

  const { data: eventsPage } = useQuery({
    queryKey: queryKeys.events.weekly(from, to),
    queryFn: () => getAllEvents({ page: 0, size: 100 }),
    retry: false,
  });
  const weeklyEvents = useMemo(
    () => filterEventsInDateRange(eventsPage?.content ?? [], from, to),
    [eventsPage?.content, from, to],
  );

  const weeklySchedule = mapLessonsToWeeklySchedule(
    user?.teacherAssignments ?? [],
    weeklyEvents,
    from,
  );

  return (
    <WeeklyScheduleCard
      schedule={weeklySchedule}
      onViewAllClick={() => router.push("/staff/calendar")}
      onEventClick={(date) => navigateWhenAuthenticated(`/staff/calendar?date=${date}`)}
    />
  );
}
