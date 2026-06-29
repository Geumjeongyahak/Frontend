"use client";

import styled from "styled-components";
import {
  MOBILE_HOME_BODY_FONT,
  MOBILE_HOME_CARD_SHADOW,
  MOBILE_HOME_CARD_RADIUS,
  MOBILE_HOME_INLINE_SPACE,
  MOBILE_HOME_SLIDER_KNOB_SIZE,
  MOBILE_HOME_STATUS_CARD_MIN_HEIGHT,
  MOBILE_HOME_TITLE_FONT,
  mobileHomeTone,
} from "@/pwa/pages/mobile-home/constants";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import ClassBadgeIcon from "@/pwa/pages/mobile-home/components/ClassBadgeIcon";

type AttendanceSectionProps = {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  classroomName?: string;
  title: string;
  guide: string;
  sliderMode: "attendance" | "checkout" | "completed";
  isReady: boolean;
  isPending: boolean;
  isCompleted: boolean;
  progress: number;
  isDragging: boolean;
  showNoClassCard: boolean;
  trackRef: React.RefObject<HTMLButtonElement | null>;
  onSliderStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
};

export default function AttendanceSection({
  isAuthLoading,
  isAuthenticated,
  classroomName,
  title,
  guide,
  sliderMode,
  isReady,
  isPending,
  isCompleted,
  progress,
  isDragging,
  showNoClassCard,
  trackRef,
  onSliderStart,
}: AttendanceSectionProps) {
  const isProcessingAttendance = isPending;
  const isCheckoutMode = sliderMode === "checkout";

  if (isAuthLoading) {
    return (
      <Section>
        <LoadingCard>
          <AuthStatusSpinner />
        </LoadingCard>
      </Section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Section>
        <LoginLockedCard>
          <LoginOrnaments aria-hidden="true">
            <OrnamentMark>✷</OrnamentMark>
            <OrnamentMark>✺</OrnamentMark>
            <OrnamentMark>✿</OrnamentMark>
            <OrnamentMark>❉</OrnamentMark>
            <OrnamentMark>❖</OrnamentMark>
            <OrnamentMark>✣</OrnamentMark>
            <OrnamentMark>✹</OrnamentMark>
          </LoginOrnaments>
          <LoginLockedText>로그인 후 이용해 주세요</LoginLockedText>
        </LoginLockedCard>
      </Section>
    );
  }

  if (showNoClassCard) {
    return (
      <Section>
        <NoClassCard>
          <NoClassRow aria-hidden="true">
            <NoClassMark>✿</NoClassMark>
            <NoClassMark>❈</NoClassMark>
            <NoClassMark>✷</NoClassMark>
            <NoClassMark>❉</NoClassMark>
            <NoClassMark>✹</NoClassMark>
          </NoClassRow>
          <NoClassText>오늘은 수업이 없습니다</NoClassText>
        </NoClassCard>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        <InfoArea>
          <div>
            <MetaText>오늘의 수업</MetaText>
            <TitleText>{title}</TitleText>
          </div>
          <ClassBadgeIcon classroomName={classroomName} />
        </InfoArea>
        <SliderButton
          ref={trackRef}
          type="button"
          disabled={!isReady || isPending || isCompleted}
          onPointerDown={onSliderStart}
          $mode={sliderMode}
        >
          <SliderFill $progress={progress} $mode={sliderMode} $dragging={isDragging} />
          <SliderThumb
            $progress={progress}
            $completed={isCompleted}
            $dragging={isDragging}
            $hidden={isProcessingAttendance}
          >
            {isCompleted ? "✓" : "→"}
          </SliderThumb>
          <SliderLabel $centered={isProcessingAttendance || isCompleted}>
            {isCompleted
              ? "출석 완료"
              : isProcessingAttendance
                ? isCheckoutMode
                  ? "퇴근 준비 중..."
                  : "출석 중..."
                : isDragging
                  ? ""
                  : isCheckoutMode
                    ? "밀어서 퇴근을 완료해주세요"
                    : "밀어서 출석을 완료해주세요"}
          </SliderLabel>
        </SliderButton>
        <GuideText>{guide}</GuideText>
      </Card>
    </Section>
  );
}

const Section = styled.section`
  padding-inline: ${MOBILE_HOME_INLINE_SPACE};
  margin-top: 5vw;
`;

const Card = styled.section`
  position: relative;
  min-height: ${MOBILE_HOME_STATUS_CARD_MIN_HEIGHT};
  padding: 5vw;
  border-radius: ${MOBILE_HOME_CARD_RADIUS};
  background: ${mobileHomeTone.white};
  box-shadow: ${MOBILE_HOME_CARD_SHADOW};
`;

const LoadingCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoginLockedCard = styled(Card)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.625rem;
  background: ${mobileHomeTone.successGradient};
`;

const LoginOrnaments = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${mobileHomeTone.white};
`;

const OrnamentMark = styled.span`
  font-size: 0.9375rem;
  line-height: 1;
  opacity: 0.96;
`;

const LoginLockedText = styled.p`
  color: ${mobileHomeTone.white};
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const NoClassCard = styled(Card)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 1rem;
`;

const NoClassRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: #6eb568;
`;

const NoClassMark = styled.span`
  font-size: 1rem;
  line-height: 1;
`;

const NoClassText = styled.p`
  font-size: ${mobileHomeTone.typography.fontSize18};
  font-weight: 700;
  color: #65ac61;
`;

const InfoArea = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const MetaText = styled.p`
  color: ${mobileHomeTone.text};
  font-size: ${mobileHomeTone.typography.fontSize18};
`;

const TitleText = styled.h2`
  max-width: calc(100% - 6rem);
  margin-top: 0.625rem;
  color: ${mobileHomeTone.strong};
  font-size: ${MOBILE_HOME_TITLE_FONT};
  font-weight: 700;
  line-height: 1.25;
  word-break: keep-all;
`;

const SliderButton = styled.button<{ $mode: "attendance" | "checkout" | "completed" }>`
  --slider-thumb-inset: 0.375rem;
  position: absolute;
  right: 5vw;
  bottom: 5vw;
  left: 5vw;
  display: flex;
  align-items: center;
  height: calc(${MOBILE_HOME_SLIDER_KNOB_SIZE} * 1.18);
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: ${({ $mode }) =>
    $mode === "completed"
      ? mobileHomeTone.dark
      : $mode === "checkout"
        ? "linear-gradient(90deg, #e49a94 0%, #d87472 100%)"
        : mobileHomeTone.successGradient};
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:disabled {
    opacity: 1;
  }
`;

const SliderFill = styled.span<{
  $progress: number;
  $mode: "attendance" | "checkout" | "completed";
  $dragging: boolean;
}>`
  position: absolute;
  inset: 0;
  width: ${({ $progress }) => `${Math.max($progress, 0) * 100}%`};
  background: ${({ $mode }) =>
    $mode === "completed" ? mobileHomeTone.dark : "rgba(255, 255, 255, 0.15)"};
  transition: ${({ $dragging, $mode }) =>
    $dragging || $mode === "completed" ? "none" : "width 0.18s ease"};
`;

const SliderThumb = styled.span<{
  $progress: number;
  $completed: boolean;
  $dragging: boolean;
  $hidden: boolean;
}>`
  position: absolute;
  left: ${({ $progress }) =>
    `calc(var(--slider-thumb-inset) + (100% - ${MOBILE_HOME_SLIDER_KNOB_SIZE} - (var(--slider-thumb-inset) * 2)) * ${Math.max($progress, 0)})`};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${MOBILE_HOME_SLIDER_KNOB_SIZE};
  height: ${MOBILE_HOME_SLIDER_KNOB_SIZE};
  border: 0.1875rem solid ${mobileHomeTone.white};
  border-radius: 50%;
  background: ${({ $completed }) =>
    $completed ? mobileHomeTone.white : "rgba(255, 255, 255, 0.12)"};
  color: ${({ $completed }) => ($completed ? mobileHomeTone.dark : mobileHomeTone.white)};
  font-size: clamp(1.25rem, 6vw, 1.75rem);
  transition: ${({ $dragging, $completed }) =>
    $dragging || $completed ? "none" : "left 0.18s ease"};
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
`;

const SliderLabel = styled.span<{ $centered: boolean }>`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: ${({ $centered }) => ($centered ? "0 1.75rem" : "0 1.75rem 0 4.5rem")};
  color: ${mobileHomeTone.white};
  font-size: ${MOBILE_HOME_BODY_FONT};
  font-weight: 600;
  text-align: center;
`;

const GuideText = styled.p`
  position: absolute;
  right: 5vw;
  bottom: calc(5vw + ${MOBILE_HOME_SLIDER_KNOB_SIZE} * 1.18 + 0.75rem);
  left: 5vw;
  color: #747474;
  font-size: ${mobileHomeTone.typography.fontSize13};
  line-height: 1.5;
`;
