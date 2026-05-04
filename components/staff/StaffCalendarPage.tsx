"use client";

import { useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { type StaffCalendarEvent, staffCalendarEvents } from "@/mocks/staffCalendar";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type StaffCalendarPageProps = {
  initialYear: number;
  initialMonth: number;
};

type CalendarDay = {
  date: Date;
  isoDate: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: StaffCalendarEvent[];
};

const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
const eventTypeLabels: Record<StaffCalendarEvent["type"], string> = {
  exchange: "수업 교환",
  absence: "수업 결강",
  meeting: "교원 회의",
  class: "수업",
  notice: "공지",
};

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMondayStartIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function getMonthGrid(year: number, month: number, todayIsoDate: string) {
  const firstDate = new Date(year, month - 1, 1);
  const startDate = new Date(firstDate);
  startDate.setDate(firstDate.getDate() - getMondayStartIndex(firstDate));

  const lastDate = new Date(year, month, 0);
  const lastGridDate = new Date(lastDate);
  lastGridDate.setDate(lastDate.getDate() + (6 - getMondayStartIndex(lastDate)));

  const dayCount =
    Math.round((lastGridDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const isoDate = toIsoDate(date);

    return {
      date,
      isoDate,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month - 1,
      isToday: isoDate === todayIsoDate,
      events: staffCalendarEvents.filter((event) => event.date === isoDate),
    };
  });
}

function formatKoreanDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDayLabel(date: Date) {
  return weekDays[getMondayStartIndex(date)];
}

export default function StaffCalendarPage({ initialYear, initialMonth }: StaffCalendarPageProps) {
  const [visibleMonth, setVisibleMonth] = useState({ year: initialYear, month: initialMonth });
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const todayIsoDate = useMemo(() => toIsoDate(new Date()), []);
  const calendarDays = useMemo(
    () => getMonthGrid(visibleMonth.year, visibleMonth.month, todayIsoDate),
    [todayIsoDate, visibleMonth],
  );

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => {
      const nextDate = new Date(current.year, current.month - 1 + offset, 1);

      return {
        year: nextDate.getFullYear(),
        month: nextDate.getMonth() + 1,
      };
    });
    setSelectedDay(null);
  };

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <HeaderRow>
            <Title>학사 일정</Title>
            <AddButton type="button">
              일정 추가하기
            </AddButton>
          </HeaderRow>

          <CalendarPanel aria-label={`${visibleMonth.year}년 ${visibleMonth.month}월 학사 일정`}>
            <MonthHeader>
              <MonthButton
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="이전 달 보기"
              >
                <IconChevronLeft aria-hidden="true" size={22} stroke={2.4} />
              </MonthButton>
              <MonthText>
                <span>{visibleMonth.month}월</span>
                <YearText>{visibleMonth.year}</YearText>
              </MonthText>
              <MonthButton
                type="button"
                onClick={() => moveMonth(1)}
                aria-label="다음 달 보기"
              >
                <IconChevronRight aria-hidden="true" size={22} stroke={2.4} />
              </MonthButton>
            </MonthHeader>

            <WeekHeader>
              {weekDays.map((day) => (
                <WeekDay key={day}>{day}</WeekDay>
              ))}
            </WeekHeader>

            <DateGrid>
              {calendarDays.map((day) => (
                <DateCell
                  key={day.isoDate}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  $isCurrentMonth={day.isCurrentMonth}
                  $isToday={day.isToday}
                  aria-label={`${formatKoreanDate(day.date)} ${day.events.length}개 일정`}
                >
                  <DayNumber $isCurrentMonth={day.isCurrentMonth}>{day.day}</DayNumber>
                  <EventStack>
                    {day.events.slice(0, 4).map((event) => (
                      <EventChip key={event.id} title={event.title}>
                        <EventIcon aria-hidden="true">🙂</EventIcon>
                        <EventTitle>{event.title}</EventTitle>
                      </EventChip>
                    ))}
                    {day.events.length > 4 ? (
                      <MoreEvents>+{day.events.length - 4}개</MoreEvents>
                    ) : null}
                  </EventStack>
                </DateCell>
              ))}
            </DateGrid>
          </CalendarPanel>
        </Content>
      </Stage>

      {selectedDay ? (
        <ModalBackdrop onClick={() => setSelectedDay(null)}>
          <ScheduleDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitleGroup>
                <DialogDate id="calendar-detail-title">{formatKoreanDate(selectedDay.date)}</DialogDate>
                <DialogSubText>{getDayLabel(selectedDay.date)}요일 상세 일정</DialogSubText>
              </DialogTitleGroup>
              <CloseButton
                type="button"
                onClick={() => setSelectedDay(null)}
                aria-label="상세 일정 닫기"
              >
                <IconX aria-hidden="true" size={20} stroke={2.2} />
              </CloseButton>
            </DialogHeader>

            {selectedDay.events.length > 0 ? (
              <DetailList>
                {selectedDay.events.map((event) => (
                  <DetailItem key={event.id}>
                    <DetailBadge>{eventTypeLabels[event.type]}</DetailBadge>
                    <DetailTitle>{event.title}</DetailTitle>
                    <DetailMeta>
                      <span>{event.time}</span>
                      <span>{event.location}</span>
                      <span>{event.teacher}</span>
                    </DetailMeta>
                    <DetailDescription>{event.description}</DetailDescription>
                  </DetailItem>
                ))}
              </DetailList>
            ) : (
              <EmptyState>등록된 상세 일정이 없습니다.</EmptyState>
            )}
          </ScheduleDialog>
        </ModalBackdrop>
      ) : null}
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const Stage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
  padding: 2.1875rem 3.3125rem 3rem 3.125rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 4.6875rem 5rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 1.4375rem;

  @media (min-width: 120rem) {
    margin-bottom: 1.75rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  border-radius: ${radii.radius12};
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: #76bd49;
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 3px;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const CalendarPanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.9375rem;
  width: 100%;
  min-height: 41.875rem;
  padding: ${spacing.space20};
  border: 1px solid #d9d9d9;
  border-radius: ${radii.radius20};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: 90.375rem;
    gap: 1.25rem;
    padding: 1.875rem;
    border-radius: ${radii.radius30};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    overflow-x: auto;
  }
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space12};
  padding: ${spacing.space12} 0;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding: ${spacing.space20} 0;
  }
`;

const MonthButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border: 0;
  background-color: transparent;
  color: #000000;
  cursor: pointer;

  &:hover {
    color: ${colors.point};
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }

  @media (min-width: 120rem) {
    width: 2.5rem;
    height: 2.5rem;

    svg {
      width: 1.8125rem;
      height: 1.8125rem;
    }
  }
`;

const MonthText = styled.h2`
  display: inline-flex;
  align-items: baseline;
  gap: ${spacing.space8};
  min-width: 5.5rem;
  justify-content: center;
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-width: 8rem;
    font-size: ${typography.fontSize32};
  }
`;

const YearText = styled.span`
  color: #777777;
  font-size: ${typography.fontSize13};
  font-weight: 500;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4375rem;
  min-width: 42rem;
`;

const WeekDay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 0;
  color: #b3b3b3;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: 11rem;
  gap: 0.4375rem;
  min-width: 42rem;

  @media (min-width: 120rem) {
    grid-auto-rows: 16.6875rem;
    gap: 0.625rem;
  }
`;

const DateCell = styled.button<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${spacing.space8};
  min-width: 0;
  min-height: 0;
  padding: 0.5rem;
  border: ${({ $isToday }) =>
    $isToday ? `2px solid ${colors.point}` : "2px solid transparent"};
  border-radius: 0.625rem;
  background-color: ${({ $isCurrentMonth }) => ($isCurrentMonth ? colors.background : colors.white)};
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${colors.point};
    background-color: #fbfdf9;
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }

  @media (min-width: 120rem) {
    padding: 0.625rem;
  }
`;

const DayNumber = styled.span<{ $isCurrentMonth: boolean }>`
  color: ${({ $isCurrentMonth }) => ($isCurrentMonth ? "#7b7b7b" : "#dbdbdb")};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const EventStack = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  margin-top: auto;
`;

const EventChip = styled.span`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  min-height: 1.1875rem;
  padding: 0.1875rem 0.3125rem;
  background-color: #343434;
  border: 1px solid ${colors.white};
  color: ${colors.white};
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 1.75rem;
    padding: 0.3125rem;
    font-size: ${typography.fontSize20};
  }
`;

const EventIcon = styled.span`
  flex: 0 0 auto;
  font-size: 0.625rem;
  line-height: 1;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const EventTitle = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MoreEvents = styled.span`
  color: #666666;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgba(0, 0, 0, 0.32);
`;

const ScheduleDialog = styled.div`
  width: min(34rem, 100%);
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: ${radii.radius20};
  background-color: ${colors.white};
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.18);
`;

const DialogHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space16};
  padding: ${spacing.space24};
  border-bottom: 1px solid #eeeeee;
  background-color: ${colors.background};
`;

const DialogTitleGroup = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const DialogDate = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const DialogSubText = styled.p`
  margin: 0;
  color: #777777;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  background-color: ${colors.white};
  color: #333333;
  cursor: pointer;

  &:hover {
    background-color: ${colors.pointSoft};
    color: ${colors.point};
  }
`;

const DetailList = styled.div`
  display: grid;
  gap: ${spacing.space12};
  padding: ${spacing.space24};
`;

const DetailItem = styled.article`
  display: grid;
  gap: ${spacing.space8};
  padding: ${spacing.space16};
  border: 1px solid #e3e3e3;
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
`;

const DetailBadge = styled.span`
  width: fit-content;
  padding: 0.25rem 0.625rem;
  border-radius: ${radii.radius999};
  background-color: ${colors.pointSoft};
  color: ${colors.point};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const DetailTitle = styled.h3`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize18};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const DetailMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8} ${spacing.space16};
  color: #666666;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const DetailDescription = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
`;

const EmptyState = styled.p`
  margin: 0;
  padding: ${spacing.space40} ${spacing.space24};
  color: #777777;
  font-size: ${typography.fontSize16};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-align: center;
`;
