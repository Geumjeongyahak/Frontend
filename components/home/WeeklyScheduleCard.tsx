"use client";

import dayjs from "dayjs";
import { useState } from "react";
import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import type { WeeklyScheduleDay, WeeklyScheduleItem } from "@/types/home";

type WeeklyScheduleCardProps = {
  schedule: WeeklyScheduleDay[];
  onViewAllClick?: () => void;
  onEventClick?: (date: string) => void;
};

type SelectedLesson = {
  classroomName: string;
  dayLabel: string;
  date: string;
  periods: NonNullable<WeeklyScheduleItem["periods"]>;
};

const getMondayBasedIndex = (date = dayjs()) => {
  const d = date.day();
  return d === 0 ? 6 : d - 1;
};

function buildSelectedLesson(dayLabel: string, item: WeeklyScheduleItem): SelectedLesson | null {
  if (item.type !== "lesson" || !item.classroomName || !item.date || !item.periods?.length) {
    return null;
  }

  return {
    classroomName: item.classroomName,
    dayLabel,
    date: item.date,
    periods: item.periods,
  };
}

export default function WeeklyScheduleCard({
  schedule,
  onViewAllClick,
  onEventClick,
}: WeeklyScheduleCardProps) {
  const todayIndex = getMondayBasedIndex();
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(null);

  return (
    <>
      <Card title="주간 일정" actionLabel="전체일정 보기" onActionClick={onViewAllClick}>
        <Schedule>
          {schedule.map((daySchedule, index) => {
            const isHighlighted = index === todayIndex;

            return (
              <DayColumn key={daySchedule.day} $highlighted={isHighlighted}>
                <DayLabel $highlighted={isHighlighted}>{daySchedule.day}</DayLabel>
                <Divider />
                <ItemList>
                  {daySchedule.items.length === 0 ? (
                    <EmptyText>예정된 일정이 없습니다</EmptyText>
                  ) : (
                    <>
                      {daySchedule.items.slice(0, 3).map((item, itemIndex) => {
                        const lessonSelection = buildSelectedLesson(daySchedule.day, item);
                        const eventDate = item.date;

                        return (
                          <Item
                            key={`${daySchedule.day}-${item.type ?? "item"}-${item.id ?? itemIndex}`}
                          >
                            {item.type === "lesson" ? (
                              <LessonButton
                                type="button"
                                onClick={() => setSelectedLesson(lessonSelection)}
                                disabled={!lessonSelection}
                              >
                                <ItemTitle>{item.title}</ItemTitle>
                              </LessonButton>
                            ) : eventDate ? (
                              <EventButton
                                type="button"
                                onClick={() => onEventClick?.(eventDate)}
                                disabled={!onEventClick}
                              >
                                <EventRow>
                                  <EventEmoji aria-hidden="true">{item.emoji ?? "📌"}</EventEmoji>
                                  <EventText>{item.title}</EventText>
                                </EventRow>
                              </EventButton>
                            ) : (
                              <StaticEventRow>
                                <EventEmoji aria-hidden="true">{item.emoji ?? "📌"}</EventEmoji>
                                <EventText>{item.title}</EventText>
                              </StaticEventRow>
                            )}
                          </Item>
                        );
                      })}
                      {daySchedule.items.length > 3 && (
                        <MoreText>+{daySchedule.items.length - 3}개 더</MoreText>
                      )}
                    </>
                  )}
                </ItemList>
              </DayColumn>
            );
          })}
        </Schedule>
      </Card>

      {selectedLesson ? (
        <ModalBackdrop onMouseDown={() => setSelectedLesson(null)}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="weekly-schedule-home-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <div>
                <ModalTitle id="weekly-schedule-home-detail-title">
                  {selectedLesson.classroomName} {selectedLesson.dayLabel}요일 수업
                </ModalTitle>
                <ModalDescription>{selectedLesson.date}</ModalDescription>
              </div>
              <CloseButton type="button" onClick={() => setSelectedLesson(null)}>
                닫기
              </CloseButton>
            </ModalHeader>
            <ModalPeriodList>
              {selectedLesson.periods.map((period) => (
                <ModalPeriodCard key={`${selectedLesson.classroomName}-${period.period}`}>
                  <ModalPeriodHeading>{period.period}교시</ModalPeriodHeading>
                  {period.startTime && period.endTime ? (
                    <ModalPeriodTime>
                      {period.startTime} - {period.endTime}
                    </ModalPeriodTime>
                  ) : null}
                  <ModalPeriodSubject>{period.subjectName}</ModalPeriodSubject>
                  {period.status === "CANCELED" || period.status === "CANCELLED" ? (
                    <ModalStatusText>결강</ModalStatusText>
                  ) : null}
                </ModalPeriodCard>
              ))}
            </ModalPeriodList>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

const Card = styled(HomeCard)`
  width: 100%;
  height: 100%;
  min-height: 18.75rem;
  border: none;
`;

const Schedule = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;

  @media (min-width: 120rem) {
    gap: 1.625rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const DayColumn = styled.article<{ $highlighted: boolean }>`
  min-width: 0;
  min-height: 12.125rem;
  padding: ${spacing.space8} ${spacing.space12};
  border: 0.0625rem solid ${({ $highlighted }) => ($highlighted ? colors.point : colors.white)};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  overflow: hidden;

  @media (min-width: 120rem) {
    min-height: 18.3125rem;
    padding: ${spacing.space12} ${spacing.space20};
  }
`;

const DayLabel = styled.h3<{ $highlighted: boolean }>`
  color: ${({ $highlighted }) => ($highlighted ? colors.point : colors.muted)};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-align: center;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Divider = styled.div`
  height: 0.0625rem;
  margin: ${spacing.space4} 0 ${spacing.space8};
  background-color: ${colors.border};
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 8rem;
`;

const Item = styled.div`
  min-width: 0;
`;

const ItemTitle = styled.span`
  color: ${colors.text};
  display: -webkit-box;
  overflow: hidden;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: normal;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const LessonButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  min-height: 3rem;
  padding: ${spacing.space8};
  border-radius: 8px;
  background-color: ${colors.pointSoft};
  text-align: center;
  cursor: pointer;
  margin-top: ${spacing.space8};

  &:hover:enabled {
    background-color: #e6f3db;
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }

  @media (min-width: 120rem) {
    min-height: 4.125rem;
    padding: ${spacing.space12};
  }
`;

const EventButton = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  margin-top: ${spacing.space8};
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }
`;

const EventRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const StaticEventRow = styled(EventRow)`
  margin-top: ${spacing.space8};
`;

const EventEmoji = styled.span`
  flex: 0 0 auto;
  font-size: ${typography.fontSize14};
  line-height: 1;
`;

const EventText = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const MoreText = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const EmptyText = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  text-align: center;
  padding: ${spacing.space12} 0;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgb(0 0 0 / 42%);
`;

const ModalDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 31rem);
  max-height: calc(100vh - 2.5rem);
  overflow-y: auto;
  padding: ${spacing.space20};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 18%);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #111111;
  font-size: ${typography.fontSize18};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

const ModalDescription = styled.p`
  margin: ${spacing.space4} 0 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
`;

const CloseButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #64706c;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  cursor: pointer;
`;

const ModalPeriodList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ModalPeriodCard = styled.div`
  display: grid;
  gap: ${spacing.space4};
  padding: ${spacing.space12};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: #fcfcfc;
`;

const ModalPeriodHeading = styled.h3`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const ModalPeriodTime = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;

const ModalPeriodSubject = styled.p`
  margin: 0;
  color: #111111;
  font-size: ${typography.fontSize16};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

const ModalStatusText = styled.p`
  margin: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;
