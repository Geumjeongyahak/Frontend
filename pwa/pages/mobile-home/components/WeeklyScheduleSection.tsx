"use client";

import Image from "next/image";
import { useState } from "react";
import styled, { css } from "styled-components";
import {
  MOBILE_HOME_BODY_FONT,
  MOBILE_HOME_CARD_SHADOW,
  MOBILE_HOME_CARD_RADIUS,
  MOBILE_HOME_DAY_SIZE,
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_SCHEDULE_CARD_MIN_HEIGHT,
  MOBILE_HOME_SECTION_TITLE_FONT,
  mobileHomeTone,
} from "@/pwa/pages/mobile-home/constants";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import { MOBILE_HOME_DAYS } from "@/pwa/pages/mobile-home/constants";
import ClassBadgeIcon from "@/pwa/pages/mobile-home/components/ClassBadgeIcon";
import ScheduleDetailModal, {
  type MobileScheduleDetail,
} from "@/pwa/pages/mobile-home/components/ScheduleDetailModal";
import type {
  MobileHomeDayValue,
  MobileScheduleMode,
  MyLessonCardItem,
  WeeklyScheduleListItem,
} from "@/pwa/pages/mobile-home/types";
import { getClassTone } from "@/pwa/pages/mobile-home/utils";

type WeeklyScheduleSectionProps = {
  isAuthLoading: boolean;
  selectedDay: MobileHomeDayValue;
  mode: MobileScheduleMode;
  myLessons: MyLessonCardItem[];
  allSchedules: WeeklyScheduleListItem[];
  loading: boolean;
  emptyMessage: string;
  onDaySelect: (day: MobileHomeDayValue) => void;
  onModeChange: (mode: MobileScheduleMode) => void;
};

export default function WeeklyScheduleSection({
  isAuthLoading,
  selectedDay,
  mode,
  myLessons,
  allSchedules,
  loading,
  emptyMessage,
  onDaySelect,
  onModeChange,
}: WeeklyScheduleSectionProps) {
  const scheduleScope = `${mode}-${selectedDay}`;
  const [showAllSchedules, setShowAllSchedules] = useState({ scope: scheduleScope, value: false });
  const [selectedSchedule, setSelectedSchedule] = useState<
    (MobileScheduleDetail & { scope: string }) | null
  >(null);
  const isExpanded = showAllSchedules.scope === scheduleScope && showAllSchedules.value;
  const activeSchedule = selectedSchedule?.scope === scheduleScope ? selectedSchedule : null;

  if (isAuthLoading) {
    return (
      <Section>
        <LoadingCard $expanded={false}>
          <AuthStatusSpinner />
        </LoadingCard>
      </Section>
    );
  }

  const visibleSchedules = isExpanded ? allSchedules : allSchedules.slice(0, 3);
  const canExpandSchedules = allSchedules.length > 3;

  return (
    <Section>
      <Card $expanded={mode === "all" && isExpanded && canExpandSchedules}>
        <HeaderRow>
          <SectionTitle>이번주 일정</SectionTitle>
          <ToggleWrap>
            <ToggleLabel>{mode === "mine" ? "나의 일정" : "전체 일정"}</ToggleLabel>
            <ToggleButton
              type="button"
              onClick={() => onModeChange(mode === "mine" ? "all" : "mine")}
              aria-label="일정 보기 전환"
            >
              <ToggleTrack $active={mode === "mine"}>
                <ToggleThumb $active={mode === "mine"} />
              </ToggleTrack>
            </ToggleButton>
          </ToggleWrap>
        </HeaderRow>

        <DaysRow>
          {MOBILE_HOME_DAYS.map((day) => (
            <DayButton
              key={day.value}
              type="button"
              onClick={() => onDaySelect(day.value)}
              $active={selectedDay === day.value}
            >
              {day.label}
            </DayButton>
          ))}
        </DaysRow>

        {mode === "mine" ? (
          <MyLessonsArea>
            {loading ? (
              <EmptyText $authMessage={false}>로딩 중...</EmptyText>
            ) : myLessons.length === 0 ? (
              <EmptyText $authMessage={emptyMessage === "로그인이 필요합니다."}>
                {emptyMessage}
              </EmptyText>
            ) : (
              myLessons.map((lesson) => (
                <MyLessonButton
                  key={lesson.id}
                  type="button"
                  onClick={() =>
                    setSelectedSchedule({
                      title: lesson.title,
                      timeLabel: lesson.timeLabel,
                      date: lesson.date,
                      classroomName: lesson.classroomName,
                      kind: "lesson",
                      isCancelled: lesson.isCancelled,
                      periods: lesson.periods,
                      scope: scheduleScope,
                    })
                  }
                  $background={getClassTone(lesson.classroomName).background}
                >
                  <ClassBadgeIcon classroomName={lesson.classroomName} size="16vw" />
                  <MyLessonTitle>{lesson.isCancelled ? "결강" : lesson.title}</MyLessonTitle>
                  <MyLessonTime>{lesson.timeLabel}</MyLessonTime>
                </MyLessonButton>
              ))
            )}
          </MyLessonsArea>
        ) : (
          <ScheduleSection>
            <ScheduleList $expanded={isExpanded} $compact={!loading && visibleSchedules.length > 0}>
              {loading ? (
                <EmptyText $authMessage={false}>로딩 중...</EmptyText>
              ) : visibleSchedules.length === 0 ? (
                <EmptyText $authMessage={emptyMessage === "로그인이 필요합니다."}>
                  {emptyMessage}
                </EmptyText>
              ) : (
                visibleSchedules.map((schedule) => (
                  <ScheduleRow
                    key={schedule.id}
                    type="button"
                    onClick={() =>
                      setSelectedSchedule({
                        title: schedule.title,
                        timeLabel: schedule.timeLabel,
                        date: schedule.date,
                        classroomName: schedule.classroomName,
                        kind: schedule.kind,
                        isCancelled: schedule.isCancelled,
                        emoji: schedule.emoji,
                        description: schedule.description,
                        periods: schedule.periods,
                        scope: scheduleScope,
                      })
                    }
                  >
                    {schedule.kind === "event" ? (
                      <ScheduleLead $event>{schedule.emoji ?? "•"}</ScheduleLead>
                    ) : (
                      <ScheduleIconWrap>
                        <ClassBadgeIcon classroomName={schedule.classroomName} size="1.125rem" />
                      </ScheduleIconWrap>
                    )}
                    <ScheduleName>{schedule.title}</ScheduleName>
                    <ScheduleTime>{schedule.timeLabel}</ScheduleTime>
                  </ScheduleRow>
                ))
              )}
            </ScheduleList>
            {canExpandSchedules ? (
              <MoreButton
                type="button"
                onClick={() =>
                  setShowAllSchedules((current) => ({
                    scope: scheduleScope,
                    value: current.scope === scheduleScope ? !current.value : true,
                  }))
                }
                aria-expanded={isExpanded}
              >
                {isExpanded ? "접기" : "펼치기"}
                <MoreArrow $expanded={isExpanded}>
                  <Image src="/down-arrow.svg" alt="" width={16} height={16} />
                </MoreArrow>
              </MoreButton>
            ) : null}
          </ScheduleSection>
        )}
      </Card>
      {activeSchedule ? (
        <ScheduleDetailModal item={activeSchedule} onClose={() => setSelectedSchedule(null)} />
      ) : null}
    </Section>
  );
}

const Section = styled.section`
  padding-inline: ${MOBILE_HOME_INLINE_SPACE};
  margin-top: 5vw;
  padding-bottom: 8vw;
`;

const Card = styled.section<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: ${MOBILE_HOME_SCHEDULE_CARD_MIN_HEIGHT};
  height: ${({ $expanded }) => ($expanded ? "auto" : MOBILE_HOME_SCHEDULE_CARD_MIN_HEIGHT)};
  padding: 5vw;
  border-radius: ${MOBILE_HOME_CARD_RADIUS};
  background: ${mobileHomeTone.white};
  box-shadow: ${MOBILE_HOME_CARD_SHADOW};
  overflow: hidden;
`;

const LoadingCard = styled(Card)`
  align-items: center;
  justify-content: center;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const SectionTitle = styled.h2`
  color: ${mobileHomeTone.strong};
  font-size: ${MOBILE_HOME_SECTION_TITLE_FONT};
  font-weight: 700;
`;

const ToggleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleLabel = styled.span`
  color: #545454;
  font-size: ${mobileHomeTone.typography.fontSize14};
`;

const ToggleButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
`;

const ToggleTrack = styled.span<{ $active: boolean }>`
  position: relative;
  display: inline-flex;
  width: 4rem;
  height: 2rem;
  border-radius: 999px;
  background: #e7e7e7;
  transition: background 0.2s ease;

  ${({ $active }) =>
    $active &&
    css`
      background: #d3ebc6;
    `}
`;

const ToggleThumb = styled.span<{ $active: boolean }>`
  position: absolute;
  top: 0.1875rem;
  left: ${({ $active }) => ($active ? "2.1875rem" : "0.1875rem")};
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#87C25C" : "#434343")};
  transition:
    left 0.2s ease,
    background 0.2s ease;
`;

const DaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 4vw;
`;

const DayButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${MOBILE_HOME_DAY_SIZE};
  min-width: 2.25rem;
  height: ${MOBILE_HOME_DAY_SIZE};
  min-height: 2.25rem;
  margin: 0 auto;
  border: 0;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#87C25C" : "transparent")};
  color: ${({ $active }) => ($active ? mobileHomeTone.white : mobileHomeTone.strong)};
  font-size: ${mobileHomeTone.typography.fontSize14};
  font-weight: 600;
`;

const MyLessonsArea = styled.div`
  display: grid;
  flex: 1;
  gap: 0.75rem;
  min-height: 0;
  margin-top: 4vw;
  overflow: hidden;
`;

const ScheduleSection = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const MyLessonButton = styled.button<{ $background: string }>`
  display: grid;
  justify-items: center;
  align-content: center;
  min-height: 20lvh;
  flex-shrink: 0;
  border: 0;
  border-radius: 1rem;
  background: ${({ $background }) => $background};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
`;

const MyLessonTitle = styled.span`
  margin-top: 0.875rem;
  color: ${mobileHomeTone.strong};
  font-size: clamp(1.125rem, 4.8vw, 1.5rem);
  font-weight: 700;
  text-align: center;
  word-break: keep-all;
`;

const MyLessonTime = styled.span`
  margin-top: 0.375rem;
  color: #5e5e5e;
  font-size: ${MOBILE_HOME_BODY_FONT};
`;

const ScheduleList = styled.div<{ $expanded: boolean; $compact: boolean }>`
  display: grid;
  flex: 1;
  min-height: 0;
  margin-top: 3vw;
  align-content: ${({ $compact }) => ($compact ? "start" : "center")};
  grid-auto-rows: ${({ $compact }) => ($compact ? "max-content" : "auto")};
  overflow: ${({ $expanded }) => ($expanded ? "visible" : "hidden")};
`;

const ScheduleRow = styled.button`
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.5rem;
  border: 0;
  border-bottom: 1px solid #d9d9d9;
  background: transparent;
  padding: 0;
  text-align: left;
`;

const ScheduleLead = styled.span<{ $event: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $event }) => ($event ? "#9B9B9B" : "#D8879D")};
  font-size: 0.875rem;
`;

const ScheduleIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
`;

const ScheduleName = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${mobileHomeTone.strong};
  font-size: ${mobileHomeTone.typography.fontSize14};
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  width: 100%;
  margin-top: 0.875rem;
  border: 0;
  background: transparent;
  color: ${mobileHomeTone.strong};
  font-size: ${mobileHomeTone.typography.fontSize14};
  font-weight: 600;
`;

const MoreArrow = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  align-items: center;
  justify-content: center;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;

  img {
    width: 100%;
    height: 100%;
    filter: brightness(0);
  }
`;

const ScheduleTime = styled.span`
  color: #8a8a8a;
  font-size: ${mobileHomeTone.typography.fontSize14};
  white-space: nowrap;
`;

const EmptyText = styled.p<{ $authMessage: boolean }>`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  color: #7a7a7a;
  font-size: ${mobileHomeTone.typography.fontSize14};
  line-height: 1.4;
  text-align: center;
  transform: ${({ $authMessage }) => ($authMessage ? "translateY(-0.125rem)" : "none")};
`;
