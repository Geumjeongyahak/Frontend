"use client";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getDailyScheduleDetailIfExists,
  updateTeacherAttendance,
} from "@/api/dailySchedule/dailySchedule.api";
import { getEvents } from "@/api/event/event.api";
import { getLessons, getMyLessons } from "@/api/lesson/lesson.api";
import { useNotificationInbox } from "@/pwa/hooks/useNotificationInbox";
import { useAttendanceSuccessPopup } from "@/pwa/pages/mobile-home/hooks/useAttendanceSuccessPopup";
import type {
  MobileHomeDayValue,
  MobileScheduleMode,
} from "@/pwa/pages/mobile-home/types";
import {
  getCurrentDayValue,
  toAllScheduleItems,
  toMyLessonCardItems,
} from "@/pwa/pages/mobile-home/utils";
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { queryKeys } from "@/lib/queryKeys";
import { isWithinAttendanceRange } from "@/pwa/utils/attendanceLocation";

dayjs.extend(isoWeek);

const ATTENDANCE_TARGET_LATITUDE = Number(process.env.NEXT_PUBLIC_ATTENDANCE_TARGET_LATITUDE);
const ATTENDANCE_TARGET_LONGITUDE = Number(process.env.NEXT_PUBLIC_ATTENDANCE_TARGET_LONGITUDE);
const ATTENDANCE_TARGET_RADIUS_METERS = Number(
  process.env.NEXT_PUBLIC_ATTENDANCE_TARGET_RADIUS_METERS ?? "100",
);
const ATTENDANCE_TARGET_LABEL =
  process.env.NEXT_PUBLIC_ATTENDANCE_TARGET_LABEL?.trim() || "설정된 출석 위치";

function isAttendanceLocationConfigured() {
  return (
    Number.isFinite(ATTENDANCE_TARGET_LATITUDE) && Number.isFinite(ATTENDANCE_TARGET_LONGITUDE)
  );
}

function getTodayIsoDate() {
  return dayjs().format("YYYY-MM-DD");
}

export function useMobileHomeScreen() {
  const { isAuthenticated, isAuthLoading, navigateWhenAuthenticated, user } =
    useProtectedHomeNavigation();
  const popup = useAttendanceSuccessPopup();
  const { unreadCount } = useNotificationInbox();
  const [selectedDay, setSelectedDay] = useState<MobileHomeDayValue>(getCurrentDayValue);
  const [scheduleMode, setScheduleMode] = useState<MobileScheduleMode>("all");
  const [isAttendanceResolving, setIsAttendanceResolving] = useState(false);
  const effectiveScheduleMode = isAuthenticated ? scheduleMode : "all";

  const weekFrom = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
  const weekTo = dayjs().endOf("isoWeek").format("YYYY-MM-DD");
  const today = getTodayIsoDate();

  const todayLessonsQuery = useQuery({
    queryKey: queryKeys.lessons.myWeekly(today, today),
    queryFn: () => getMyLessons({ from: today, to: today }),
    enabled: isAuthenticated,
    retry: false,
  });

  const allLessonsQuery = useQuery({
    queryKey: queryKeys.lessons.weekly(weekFrom, weekTo),
    queryFn: () => getLessons({ from: weekFrom, to: weekTo }),
    enabled: isAuthenticated,
    retry: false,
  });

  const myLessonsQuery = useQuery({
    queryKey: queryKeys.lessons.myWeekly(weekFrom, weekTo),
    queryFn: () => getMyLessons({ from: weekFrom, to: weekTo }),
    enabled: isAuthenticated,
    retry: false,
  });

  const weeklyEventsQuery = useQuery({
    queryKey: queryKeys.events.weekly(weekFrom, weekTo),
    queryFn: () => getEvents({ startDate: weekFrom, endDate: weekTo, page: 0, size: 100 }),
    enabled: isAuthenticated,
    retry: false,
  });

  const todayLesson = useMemo(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    return [...(todayLessonsQuery.data ?? [])]
      .filter(
        (lesson) =>
          !lesson.isAbsent && lesson.status !== "CANCELED" && lesson.status !== "CANCELLED",
      )
      .sort((left, right) => (left.startTime ?? "99:99").localeCompare(right.startTime ?? "99:99"))[0];
  }, [isAuthenticated, todayLessonsQuery.data]);

  const attendanceQuery = useQuery({
    queryKey: ["mobile-home", "daily-schedule", todayLesson?.classroomId, today] as const,
    queryFn: () =>
      getDailyScheduleDetailIfExists({
        classroomId: todayLesson?.classroomId as number,
        lessonDate: today,
      }),
    enabled: isAuthenticated && typeof todayLesson?.classroomId === "number",
    retry: false,
  });

  const isAttendanceSectionLoading =
    isAuthLoading ||
    (isAuthenticated &&
      (todayLessonsQuery.isLoading ||
        (typeof todayLesson?.classroomId === "number" &&
          attendanceQuery.isLoading &&
          !attendanceQuery.data)));

  const myLessonCards = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    return toMyLessonCardItems(myLessonsQuery.data ?? []).filter((item) => item.dayValue === selectedDay);
  }, [isAuthenticated, myLessonsQuery.data, selectedDay]);

  const allScheduleItems = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    return toAllScheduleItems(allLessonsQuery.data ?? [], weeklyEventsQuery.data?.content ?? []).filter(
      (item) => item.dayValue === selectedDay,
    );
  }, [allLessonsQuery.data, isAuthenticated, selectedDay, weeklyEventsQuery.data?.content]);

  const hasCompletedAttendance =
    attendanceQuery.data?.teacherAttendance?.status === "PRESENT" ||
    attendanceQuery.data?.teacherAttendanceStatus === "PRESENT";

  const attendanceMutation = useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      updateTeacherAttendance(
        { dailyScheduleId: attendanceQuery.data?.dailyScheduleId as number },
        {
          status: "PRESENT",
          latitude,
          longitude,
        },
      ),
    onSuccess: () => {
      setIsAttendanceResolving(false);
      popup.show();
      toast.success("출석이 완료되었습니다.");
      attendanceQuery.refetch().catch(() => undefined);
    },
    onError: () => {
      setIsAttendanceResolving(false);
      toast.error("출석 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });

  const isAttendanceReady =
    isAuthenticated &&
    isAttendanceLocationConfigured() &&
    typeof attendanceQuery.data?.dailyScheduleId === "number" &&
    !hasCompletedAttendance;

  const attendanceGuide = !isAuthenticated
    ? "로그인 후 이용해 주세요"
    : !todayLesson
      ? "오늘 진행 예정인 수업이 없습니다."
      : !isAttendanceLocationConfigured()
        ? "환경 변수에 출석 위치가 설정되지 않았습니다."
        : typeof attendanceQuery.data?.dailyScheduleId !== "number"
          ? "오늘 수업 일정이 아직 생성되지 않았습니다."
          : hasCompletedAttendance
            ? "오늘 출석을 이미 완료했습니다."
            : `${ATTENDANCE_TARGET_LABEL} 반경 ${ATTENDANCE_TARGET_RADIUS_METERS}m 안에서 출석할 수 있습니다.`;

  function completeAttendance({ reset }: { reset: () => void }) {
    if (!isAttendanceReady || attendanceMutation.isPending || isAttendanceResolving) {
      reset();
      return;
    }

    if (!navigator.geolocation) {
      reset();
      toast.error("현재 브라우저에서는 위치 확인을 지원하지 않습니다.");
      return;
    }

    setIsAttendanceResolving(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const isAllowed = isWithinAttendanceRange(
          latitude,
          longitude,
          ATTENDANCE_TARGET_LATITUDE,
          ATTENDANCE_TARGET_LONGITUDE,
          ATTENDANCE_TARGET_RADIUS_METERS,
        );

        if (!isAllowed) {
          setIsAttendanceResolving(false);
          reset();
          toast.error(
            `${ATTENDANCE_TARGET_LABEL} 반경 ${ATTENDANCE_TARGET_RADIUS_METERS}m 안에서만 출석할 수 있습니다.`,
          );
          return;
        }

        attendanceMutation.mutate({ latitude, longitude });
      },
      () => {
        setIsAttendanceResolving(false);
        reset();
        toast.error("위치 권한이 필요합니다. 브라우저에서 위치 권한을 허용해주세요.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  return {
    userName: user?.name ?? "선생님",
    isAuthLoading,
    isAttendanceSectionLoading,
    isAuthenticated,
    navigateWhenAuthenticated,
    selectedDay,
    setSelectedDay,
    scheduleMode: effectiveScheduleMode,
    setScheduleMode,
    unreadCount,
    popupVisible: popup.isVisible,
    todayLesson,
    myLessonCards,
    allScheduleItems,
    isAttendanceReady,
    isAttendancePending: isAttendanceResolving || attendanceMutation.isPending,
    hasCompletedAttendance,
    attendanceGuide,
    scheduleEmptyMessage:
      !isAuthenticated && scheduleMode === "mine"
        ? "로그인이 필요합니다."
        : effectiveScheduleMode === "mine"
          ? "해당 요일에 일정이 없습니다."
          : "일정이 없습니다.",
    attendanceTitle: todayLesson?.classroomName
      ? `${todayLesson.classroomName}\u00A0수업`
      : "오늘 수업이 없습니다",
    loadingSchedule:
      isAuthenticated &&
      (allLessonsQuery.isLoading ||
        myLessonsQuery.isLoading ||
        weeklyEventsQuery.isLoading ||
        todayLessonsQuery.isLoading),
    completeAttendance,
  };
}
