"use client";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/api/lesson/lesson.api";
import WeeklyScheduleCard from "@/components/home/WeeklyScheduleCard";
import { weeklySchedule as fallbackWeeklySchedule } from "@/mocks/home";
import { mapLessonsToWeeklySchedule } from "@/utils/mapLessonsToWeeklySchedule";

dayjs.extend(isoWeek);

export default function WeeklySchedulePanel() {
  const from = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
  const to = dayjs().endOf("isoWeek").format("YYYY-MM-DD");

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", "weekly", { from, to }],
    queryFn: () => getLessons({ from, to }),
    retry: false,
  });

  const weeklySchedule =
    lessons.length > 0 ? mapLessonsToWeeklySchedule(lessons) : fallbackWeeklySchedule;

  return <WeeklyScheduleCard schedule={weeklySchedule} />;
}
