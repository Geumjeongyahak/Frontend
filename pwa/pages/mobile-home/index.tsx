"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_PAGE_MAX_WIDTH,
  MOBILE_HOME_SURFACE,
} from "@/pwa/pages/mobile-home/constants";
import AttendanceCheckoutModal from "@/pwa/pages/mobile-home/components/AttendanceCheckoutModal";
import AttendanceSection from "@/pwa/pages/mobile-home/components/AttendanceSection";
import AttendanceSuccessOverlay from "@/pwa/pages/mobile-home/components/AttendanceSuccessOverlay";
import HomeHeader from "@/pwa/pages/mobile-home/components/HomeHeader";
import RequestShortcutSection from "@/pwa/pages/mobile-home/components/RequestShortcutSection";
import TimetableShortcutSection from "@/pwa/pages/mobile-home/components/TimetableShortcutSection";
import WeeklyScheduleSection from "@/pwa/pages/mobile-home/components/WeeklyScheduleSection";
import { useMobileHomeScreen } from "@/pwa/pages/mobile-home/hooks/useMobileHomeScreen";
import { useSlideToConfirm } from "@/pwa/pages/mobile-home/hooks/useSlideToConfirm";
import { syncPushSubscription } from "@/pwa/lib/pushNotifications";

function readNotificationPermission(isAuthenticated: boolean) {
  if (
    !isAuthenticated ||
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return null;
  }

  return Notification.permission;
}

export default function MobileHomeScreen() {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const screen = useMobileHomeScreen();
  const slider = useSlideToConfirm({
    disabled:
      (!screen.isAttendanceReady && !screen.isCheckoutReady) ||
      screen.isAttendancePending ||
      screen.isCheckoutPending ||
      screen.hasCheckedOut ||
      isCheckoutModalOpen,
    onConfirm: ({ reset }) => {
      if (screen.sliderMode === "checkout") {
        reset();
        setIsCheckoutModalOpen(true);
        return;
      }

      screen.completeAttendance({ reset });
    },
  });

  const isAttendanceCompleted = screen.hasCheckedOut;
  const sliderProgress = isAttendanceCompleted ? 1 : slider.progress;
  const currentNotificationPermission =
    notificationPermission ?? readNotificationPermission(screen.isAuthenticated);

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen.isAuthenticated]);

  async function handlePushOptInClick() {
    await syncPushSubscription({ requestPermission: true }).catch(() => undefined);

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }

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
          showPushOptIn={screen.isAuthenticated && currentNotificationPermission === "default"}
          onPushOptInClick={handlePushOptInClick}
          onLoginClick={() => router.push("/login")}
        />

        <AttendanceSection
          isAuthLoading={screen.isAttendanceSectionLoading}
          isAuthenticated={screen.isAuthenticated}
          classroomName={screen.todayLesson?.classroomName}
          title={screen.attendanceTitle}
          guide={screen.attendanceGuide}
          sliderMode={screen.sliderMode}
          isReady={screen.isAttendanceReady || screen.isCheckoutReady}
          isPending={screen.isAttendancePending || screen.isCheckoutPending}
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
        />

        <TimetableShortcutSection
          onScheduleClick={() => screen.navigateWhenAuthenticated("/schedule")}
        />

        <RequestShortcutSection
          onPaymentClick={() => screen.navigateWhenAuthenticated("/requests/payment")}
          onClassRequestClick={() => screen.navigateWhenAuthenticated("/requests/class")}
        />
      </Page>
      {screen.popupVisible ? <AttendanceSuccessOverlay /> : null}
      {isCheckoutModalOpen ? (
        <AttendanceCheckoutModal
          onCancel={() => setIsCheckoutModalOpen(false)}
          onConfirm={() => {
            setIsCheckoutModalOpen(false);
            screen.openCheckoutJournal();
          }}
        />
      ) : null}
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100dvh;
  height: 100dvh;
  overflow-y: auto;
  background: ${MOBILE_HOME_SURFACE};
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
`;

const Page = styled.main`
  width: 100%;
  max-width: ${MOBILE_HOME_PAGE_MAX_WIDTH};
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: calc(8rem + env(safe-area-inset-bottom, 0rem));

  &::after {
    content: "";
    display: block;
    height: 1px;
    margin-inline: ${MOBILE_HOME_INLINE_SPACE};
  }
`;
