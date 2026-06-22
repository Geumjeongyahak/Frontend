"use client";

import dayjs from "dayjs";
import styled from "styled-components";
import ClassBadgeIcon from "@/pwa/pages/mobile-home/components/ClassBadgeIcon";
import { mobileHomeTone } from "@/pwa/pages/mobile-home/constants";

export type MobileScheduleDetail = {
  title: string;
  timeLabel: string;
  date?: string;
  classroomName?: string;
  kind: "lesson" | "event";
  isCancelled: boolean;
  emoji?: string;
  description?: string;
  periods?: Array<{
    period?: number;
    subjectName?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }>;
};

type ScheduleDetailModalProps = {
  item: MobileScheduleDetail;
  onClose: () => void;
};

function formatDateLabel(date?: string) {
  if (!date) {
    return "날짜 정보 없음";
  }

  const parsed = dayjs(date);
  if (!parsed.isValid()) {
    return date;
  }

  return parsed.format("YYYY.MM.DD");
}

export default function ScheduleDetailModal({
  item,
  onClose,
}: ScheduleDetailModalProps) {
  return (
    <Backdrop onMouseDown={onClose}>
      <Sheet
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-schedule-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Handle aria-hidden="true" />
        <Header>
          <HeaderLead>
            {item.kind === "lesson" ? (
              <ClassBadgeIcon classroomName={item.classroomName} size="2.75rem" />
            ) : (
              <EventMark aria-hidden="true">{item.emoji ?? "•"}</EventMark>
            )}
            <HeaderText>
              <Title id="mobile-schedule-detail-title">{item.title}</Title>
              <Meta>{formatDateLabel(item.date)}</Meta>
            </HeaderText>
          </HeaderLead>
          <CloseButton type="button" onClick={onClose} aria-label="일정 상세 닫기">
            닫기
          </CloseButton>
        </Header>

        {item.kind === "lesson" ? (
          <PeriodList>
            {item.periods?.map((period, index) => (
              <PeriodCard key={`${item.title}-${period.period ?? index}`}>
                <PeriodHeading>{period.period ? `${period.period}교시` : `${index + 1}교시`}</PeriodHeading>
                {period.startTime || period.endTime ? (
                  <PeriodTime>
                    {(period.startTime ?? "").slice(0, 5)}
                    {period.startTime || period.endTime ? " ~ " : ""}
                    {(period.endTime ?? "").slice(0, 5)}
                  </PeriodTime>
                ) : null}
                <PeriodSubject>{period.subjectName || "수업 정보 없음"}</PeriodSubject>
                {period.status === "CANCELED" || period.status === "CANCELLED" ? (
                  <StatusBadge role="status">결강</StatusBadge>
                ) : null}
              </PeriodCard>
            ))}
          </PeriodList>
        ) : (
          <>
            <InfoCard>
              <InfoLabel>시간</InfoLabel>
              <InfoValue>{item.timeLabel}</InfoValue>
            </InfoCard>

            <InfoCard>
              <InfoLabel>세부 내용</InfoLabel>
              <DescriptionText>{item.description || "세부 내용이 없습니다."}</DescriptionText>
            </InfoCard>
          </>
        )}

        {item.isCancelled ? (
          <StatusBadge role="status">결강</StatusBadge>
        ) : null}
      </Sheet>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  align-items: end;
  justify-content: center;
  background: rgba(17, 17, 17, 0.36);
`;

const Sheet = styled.section`
  width: min(100%, 30rem);
  display: grid;
  gap: 0.875rem;
  padding: 0.75rem 1.25rem 1.5rem;
  border-radius: 1.5rem 1.5rem 0 0;
  background: ${mobileHomeTone.white};
  box-shadow: 0 -0.5rem 2rem rgba(0, 0, 0, 0.12);
`;

const Handle = styled.span`
  width: 2.75rem;
  height: 0.25rem;
  margin: 0 auto 0.125rem;
  border-radius: 999px;
  background: #d2d2d2;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const HeaderLead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
`;

const EventMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: #f2f2f2;
  color: #737373;
  font-size: 1.25rem;
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  color: ${mobileHomeTone.strong};
  font-size: 1.125rem;
  font-weight: 800;
  line-height: 1.35;
  word-break: keep-all;
`;

const Meta = styled.p`
  margin-top: 0.25rem;
  color: #747474;
  font-size: ${mobileHomeTone.typography.fontSize13};
`;

const CloseButton = styled.button`
  border: 0;
  background: transparent;
  color: #747474;
  font-size: ${mobileHomeTone.typography.fontSize14};
  font-weight: 700;
`;

const InfoCard = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 0.9375rem 1rem;
  border-radius: 1rem;
  background: #f8f8f8;
`;

const InfoLabel = styled.span`
  color: #7a7a7a;
  font-size: ${mobileHomeTone.typography.fontSize13};
  font-weight: 600;
`;

const InfoValue = styled.span`
  color: ${mobileHomeTone.strong};
  font-size: ${mobileHomeTone.typography.fontSize16};
  font-weight: 700;
`;

const DescriptionText = styled.p`
  color: ${mobileHomeTone.strong};
  font-size: ${mobileHomeTone.typography.fontSize16};
  font-weight: 500;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const PeriodList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const PeriodCard = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 0.9375rem 1rem;
  border-radius: 1rem;
  background: #f8f8f8;
`;

const PeriodHeading = styled.h3`
  color: #7a7a7a;
  font-size: ${mobileHomeTone.typography.fontSize13};
  font-weight: 700;
`;

const PeriodTime = styled.p`
  color: #7a7a7a;
  font-size: ${mobileHomeTone.typography.fontSize13};
  font-weight: 600;
`;

const PeriodSubject = styled.p`
  color: ${mobileHomeTone.strong};
  font-size: ${mobileHomeTone.typography.fontSize16};
  font-weight: 700;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  justify-self: start;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.875rem;
  border-radius: 999px;
  background: rgba(218, 58, 48, 0.1);
  color: #cf473f;
  font-size: ${mobileHomeTone.typography.fontSize13};
  font-weight: 700;
`;
