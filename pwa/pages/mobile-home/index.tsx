"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_PAGE_MAX_WIDTH,
  MOBILE_HOME_SURFACE,
} from "@/pwa/pages/mobile-home/constants";
import AttendanceSection from "@/pwa/pages/mobile-home/components/AttendanceSection";
import AttendanceSuccessOverlay from "@/pwa/pages/mobile-home/components/AttendanceSuccessOverlay";
import HomeHeader from "@/pwa/pages/mobile-home/components/HomeHeader";
import WeeklyScheduleSection from "@/pwa/pages/mobile-home/components/WeeklyScheduleSection";
import { useMobileHomeScreen } from "@/pwa/pages/mobile-home/hooks/useMobileHomeScreen";
import { useSlideToConfirm } from "@/pwa/pages/mobile-home/hooks/useSlideToConfirm";

export default function MobileHomeScreen() {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const screen = useMobileHomeScreen();
  const slider = useSlideToConfirm({
    disabled:
      !screen.isAttendanceReady || screen.isAttendancePending || screen.hasCompletedAttendance,
    onConfirm: screen.completeAttendance,
  });

  const isAttendanceCompleted = screen.hasCompletedAttendance;
  const sliderProgress = isAttendanceCompleted ? 1 : slider.progress;

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen.isAuthenticated]);

  return (
    <Shell ref={shellRef}>
      <Page>
        <HomeHeader
          isAuthLoading={screen.isAuthLoading}
          isAuthenticated={screen.isAuthenticated}
          userName={screen.userName}
          unreadCount={screen.unreadCount}
          onProfileClick={() =>
            screen.navigateWhenAuthenticated(screen.isAuthenticated ? "/mypage" : "/login")
          }
          onNotificationClick={() =>
            screen.navigateWhenAuthenticated(
              screen.isAuthenticated ? "/notifications" : "/login",
            )
          }
          onLoginClick={() => router.push("/login")}
        />

        <AttendanceSection
          isAuthLoading={screen.isAttendanceSectionLoading}
          isAuthenticated={screen.isAuthenticated}
          classroomName={screen.todayLesson?.classroomName}
          title={screen.attendanceTitle}
          guide={screen.attendanceGuide}
          isReady={screen.isAttendanceReady}
          isPending={screen.isAttendancePending}
          isCompleted={isAttendanceCompleted}
          progress={sliderProgress}
          isDragging={slider.isDragging}
          showNoClassCard={screen.isAuthenticated && !screen.todayLesson}
          trackRef={slider.trackRef}
          onSliderStart={slider.startDrag}
        />

        <WeeklyScheduleSection
          isAuthLoading={screen.isAuthLoading}
          selectedDay={screen.selectedDay}
          mode={screen.scheduleMode}
          myLessons={screen.myLessonCards}
          allSchedules={screen.allScheduleItems}
          loading={screen.loadingSchedule}
          emptyMessage={screen.scheduleEmptyMessage}
          onDaySelect={screen.setSelectedDay}
          onModeChange={screen.setScheduleMode}
          onScheduleClick={(targetDate) =>
            screen.navigateWhenAuthenticated(
              targetDate ? `/staff/calendar?date=${targetDate}` : "/staff/calendar",
            )
          }
        />
      </Page>
      {screen.popupVisible ? <AttendanceSuccessOverlay /> : null}
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100lvh;
  height: 100lvh;
  overflow-y: auto;
  background: ${MOBILE_HOME_SURFACE};
  overscroll-behavior: contain;
`;

const Page = styled.main`
  width: 100%;
  max-width: ${MOBILE_HOME_PAGE_MAX_WIDTH};
  min-height: 100lvh;
  margin: 0 auto;
  padding-bottom: 8lvh;

  &::after {
    content: "";
    display: block;
    height: 1px;
    margin-inline: ${MOBILE_HOME_INLINE_SPACE};
  }
`;
