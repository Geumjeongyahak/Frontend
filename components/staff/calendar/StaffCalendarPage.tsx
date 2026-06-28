"use client";

import { useMemo, useState } from "react";
import type { SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCalendarPlus,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import styled from "styled-components";
import { createEvent, deleteEvent, getAllEvents, updateEvent } from "@/api/event/event.api";
import type {
  CreateEventRequestDto,
  EventResponseDto,
  UpdateEventRequestDto,
} from "@/api/event/event.dto";
import { Button } from "@/components/common/VariantButton";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type StaffCalendarPageProps = {
  initialYear: number;
  initialMonth: number;
  initialSelectedDate?: string;
};

type StaffCalendarEvent = {
  id: number;
  date: string;
  title: string;
  emoji: string;
  startTime: string;
  endTime: string;
  timeLabel: string;
  description: string;
};

type EventFormValues = {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  emoji: string;
};

type EventRangeFormValues = EventFormValues & {
  endDate: string;
};

const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
const emojiOptions = ["📌", "🔴", "📝", "📚", "🎉", "🔄", "🚫", "🛠️", "📍", "✅"];
const defaultEmoji = "📌";
const monthlyPageSize = 100;

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMondayStartIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function getMonthGridRange(year: number, month: number) {
  const firstDate = new Date(year, month - 1, 1);
  const startDate = new Date(firstDate);
  startDate.setDate(firstDate.getDate() - getMondayStartIndex(firstDate));

  const lastDate = new Date(year, month, 0);
  const lastGridDate = new Date(lastDate);
  lastGridDate.setDate(lastDate.getDate() + (6 - getMondayStartIndex(lastDate)));

  return {
    startDate,
    endDate: lastGridDate,
    startIsoDate: toIsoDate(startDate),
    endIsoDate: toIsoDate(lastGridDate),
  };
}

function getStartMinutes(startTime: string) {
  if (!startTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [hours, minutes = "0"] = startTime.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function sortEvents(events: StaffCalendarEvent[]) {
  return [...events].sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    return getStartMinutes(left.startTime) - getStartMinutes(right.startTime);
  });
}

function getMonthGrid(
  year: number,
  month: number,
  todayIsoDate: string,
  events: StaffCalendarEvent[],
) {
  const { startDate, endDate } = getMonthGridRange(year, month);
  const dayCount =
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
      events: events.filter((event) => event.date === isoDate),
    };
  });
}

function formatKoreanDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatMonthDayLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return `${month}월 ${day}일 ${weekDays[getMondayStartIndex(date)]}요일`;
}

function getDateFromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toFormTime(time?: string) {
  return time ? time.slice(0, 5) : "";
}

function toApiTime(time?: string) {
  return time ? `${time}:00` : undefined;
}

function formatEventTimeLabel(startTime: string, endTime: string) {
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime || "";
}

function splitEmojiFromTitle(title?: string) {
  const normalizedTitle = title?.trim() ?? "";
  const matchedEmoji = emojiOptions.find(
    (emoji) => normalizedTitle.startsWith(`${emoji} `) || normalizedTitle.startsWith(emoji),
  );

  if (!matchedEmoji) {
    return {
      emoji: defaultEmoji,
      title: normalizedTitle,
    };
  }

  const strippedTitle = normalizedTitle.startsWith(`${matchedEmoji} `)
    ? normalizedTitle.slice(matchedEmoji.length + 1)
    : normalizedTitle.slice(matchedEmoji.length);

  return {
    emoji: matchedEmoji,
    title: strippedTitle.trim(),
  };
}

function decorateEventTitle(title: string, emoji: string) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return emoji;
  }

  const { title: strippedTitle } = splitEmojiFromTitle(trimmedTitle);
  return `${emoji} ${strippedTitle || trimmedTitle}`.trim();
}

function createFallbackEventId(eventDate: string, title: string, startTime?: string, endTime?: string) {
  const seed = `${eventDate}|${title}|${startTime ?? ""}|${endTime ?? ""}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  return -Math.abs(hash || 1);
}

function mapEventResponseToCalendarEvent(event: EventResponseDto): StaffCalendarEvent | null {
  const rawEvent = event as EventResponseDto & Record<string, unknown>;
  const eventDate =
    typeof event.eventDate === "string"
      ? event.eventDate
      : typeof rawEvent.date === "string"
        ? rawEvent.date
        : typeof rawEvent.startDate === "string"
          ? rawEvent.startDate
          : undefined;
  const rawTitle =
    typeof event.title === "string"
      ? event.title
      : typeof rawEvent.name === "string"
        ? rawEvent.name
        : typeof rawEvent.eventName === "string"
          ? rawEvent.eventName
          : "기관 일정";
  const numericId =
    typeof event.id === "number"
      ? event.id
      : typeof event.id === "string" && Number.isFinite(Number(event.id))
        ? Number(event.id)
        : createFallbackEventId(
            eventDate ?? "",
            rawTitle,
            typeof event.startTime === "string" ? event.startTime : undefined,
            typeof event.endTime === "string" ? event.endTime : undefined,
          );

  if (!eventDate) {
    return null;
  }

  const { emoji, title } = splitEmojiFromTitle(rawTitle);
  const startTime = toFormTime(event.startTime);
  const endTime = toFormTime(event.endTime);

  return {
    id: numericId,
    date: eventDate,
    title: title || rawTitle,
    emoji,
    startTime,
    endTime,
    timeLabel: formatEventTimeLabel(startTime, endTime),
    description: event.description ?? "",
  };
}

function createDraftFromEvent(event: StaffCalendarEvent): EventFormValues {
  return {
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    title: event.title,
    description: event.description,
    emoji: event.emoji,
  };
}

function createEmptyEventDraft(date: string): EventFormValues {
  return {
    date,
    startTime: "",
    endTime: "",
    title: "",
    description: "",
    emoji: defaultEmoji,
  };
}

function createEmptyRangeDraft(date: string): EventRangeFormValues {
  return {
    ...createEmptyEventDraft(date),
    endDate: date,
  };
}

function buildCreateEventPayload(draft: EventFormValues): CreateEventRequestDto {
  return {
    title: decorateEventTitle(draft.title, draft.emoji),
    description: draft.description.trim(),
    eventDate: draft.date,
    startTime: toApiTime(draft.startTime),
    endTime: toApiTime(draft.endTime),
  };
}

function buildUpdateEventPayload(draft: EventFormValues): UpdateEventRequestDto {
  return {
    title: decorateEventTitle(draft.title, draft.emoji),
    description: draft.description.trim(),
    eventDate: draft.date,
    startTime: toApiTime(draft.startTime),
    endTime: toApiTime(draft.endTime),
  };
}

function getDateRange(startDate: string, endDate: string) {
  const result: string[] = [];
  const current = getDateFromIsoDate(startDate);
  const end = getDateFromIsoDate(endDate);

  while (current.getTime() <= end.getTime()) {
    result.push(toIsoDate(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function isTimeRangeValid(startTime: string, endTime: string) {
  return (!startTime && !endTime) || Boolean(startTime && endTime);
}

function isEventFormValid(draft: EventFormValues) {
  return Boolean(
    draft.date && draft.title.trim() && isTimeRangeValid(draft.startTime, draft.endTime),
  );
}

function isRangeFormValid(draft: EventRangeFormValues) {
  return (
    isEventFormValid(draft) &&
    Boolean(draft.endDate) &&
    draft.date.localeCompare(draft.endDate) <= 0
  );
}

function getDayLabel(date: Date) {
  return weekDays[getMondayStartIndex(date)];
}

type EventEditorCardProps = {
  draft: EventFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onChange: (field: keyof EventFormValues, value: string) => void;
  onSubmit: () => void;
  onEmojiToggle: () => void;
  emojiPickerOpen: boolean;
  onEmojiSelect: (emoji: string) => void;
  onCancel?: () => void;
};

function EventEditorCard({
  draft,
  submitLabel,
  isSubmitting,
  onChange,
  onSubmit,
  onEmojiToggle,
  emojiPickerOpen,
  onEmojiSelect,
  onCancel,
}: EventEditorCardProps) {
  return (
    <EditorCard>
      <EditorEmojiRow>
        <EditorEmojiButton type="button" onClick={onEmojiToggle} aria-label="이모지 선택">
          <EditorEmoji>{draft.emoji}</EditorEmoji>
        </EditorEmojiButton>
      </EditorEmojiRow>

      <EditorHeaderRow>
        <PeriodGrid>
          <EditorField>
            <EditorLabel>시작일</EditorLabel>
            <EditorInput
              type="date"
              value={draft.date}
              onChange={(event) => onChange("date", event.target.value)}
            />
          </EditorField>

          <EditorField>
            <EditorLabel>종료일</EditorLabel>
            <EditorInput
              type="date"
              value={draft.date}
              onChange={(event) => onChange("date", event.target.value)}
            />
          </EditorField>
        </PeriodGrid>

        <EmojiPickerWrap>
          {emojiPickerOpen ? (
            <EmojiPickerPanel>
              {emojiOptions.map((emoji) => (
                <EmojiOption
                  key={emoji}
                  type="button"
                  onClick={() => onEmojiSelect(emoji)}
                  aria-label={`${emoji} 선택`}
                >
                  {emoji}
                </EmojiOption>
              ))}
            </EmojiPickerPanel>
          ) : null}
        </EmojiPickerWrap>
      </EditorHeaderRow>

      <TimeRow>
        <EditorField>
          <EditorLabel>시작 시간</EditorLabel>
          <EditorInput
            type="time"
            value={draft.startTime}
            onChange={(event) => onChange("startTime", event.target.value)}
          />
        </EditorField>
        <EditorField>
          <EditorLabel>종료 시간</EditorLabel>
          <EditorInput
            type="time"
            value={draft.endTime}
            onChange={(event) => onChange("endTime", event.target.value)}
          />
        </EditorField>
      </TimeRow>

      <EditorField>
        <EditorLabel>제목</EditorLabel>
        <EditorInput
          type="text"
          value={draft.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="일정 제목을 입력하세요."
        />
      </EditorField>

      <EditorField>
        <EditorLabel>내용</EditorLabel>
        <EditorTextarea
          value={draft.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="일정 내용을 입력하세요."
        />
      </EditorField>

      <EditorActions>
        {onCancel ? (
          <Button type="button" $variant="neutral" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        ) : null}
        <Button
          type="button"
          $variant="edit"
          onClick={onSubmit}
          disabled={!isEventFormValid(draft) || isSubmitting}
        >
          {submitLabel}
        </Button>
      </EditorActions>
    </EditorCard>
  );
}

export default function StaffCalendarPage({
  initialYear,
  initialMonth,
  initialSelectedDate,
}: StaffCalendarPageProps) {
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";

  const [visibleMonth, setVisibleMonth] = useState({ year: initialYear, month: initialMonth });
  const [eventState, setEventState] = useState<{
    source?: unknown;
    events: StaffCalendarEvent[];
  }>({ events: [] });
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(initialSelectedDate ?? null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<EventFormValues | null>(null);
  const [isInlineAdding, setIsInlineAdding] = useState(false);
  const [inlineDraft, setInlineDraft] = useState<EventFormValues | null>(null);
  const [emojiPickerTarget, setEmojiPickerTarget] = useState<"edit" | "inline" | "create" | null>(
    null,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<EventRangeFormValues>(() =>
    createEmptyRangeDraft(toIsoDate(new Date(initialYear, initialMonth - 1, 1))),
  );

  const todayIsoDate = useMemo(() => toIsoDate(new Date()), []);
  const monthRange = useMemo(
    () => getMonthGridRange(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year],
  );

  const eventsQuery = useQuery({
    queryKey: queryKeys.events.monthly(monthRange.startIsoDate, monthRange.endIsoDate),
    queryFn: () =>
      getAllEvents({
        startDate: monthRange.startIsoDate,
        endDate: monthRange.endIsoDate,
        page: 0,
        size: monthlyPageSize,
      }),
    retry: false,
  });

  const queryEvents = useMemo(
    () =>
      sortEvents(
        (eventsQuery.data?.content ?? [])
          .map(mapEventResponseToCalendarEvent)
          .filter((event): event is StaffCalendarEvent => event !== null),
      ),
    [eventsQuery.data?.content],
  );
  const events = eventState.source === eventsQuery.data ? eventState.events : queryEvents;
  const setEvents = (updater: SetStateAction<StaffCalendarEvent[]>) => {
    setEventState((current) => {
      const baseEvents = current.source === eventsQuery.data ? current.events : queryEvents;
      return {
        source: eventsQuery.data,
        events: typeof updater === "function" ? updater(baseEvents) : updater,
      };
    });
  };

  const createEventMutation = useMutation({
    mutationFn: async (draft: EventRangeFormValues) => {
      const dates = getDateRange(draft.date, draft.endDate);

      return Promise.all(
        dates.map((date) =>
          createEvent(
            buildCreateEventPayload({
              ...draft,
              date,
            }),
          ),
        ),
      );
    },
    onSuccess: (createdEvents, draft) => {
      const mappedEvents = createdEvents
        .map(mapEventResponseToCalendarEvent)
        .filter((event): event is StaffCalendarEvent => event !== null);

      setEvents((current) => sortEvents([...current, ...mappedEvents]));
      setSelectedIsoDate(draft.date);
      setIsCreateModalOpen(false);
      setEmojiPickerTarget(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "일정 추가에 실패했습니다.");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, draft }: { eventId: number; draft: EventFormValues }) =>
      updateEvent({ eventId }, buildUpdateEventPayload(draft)),
    onSuccess: (updatedEvent) => {
      const mappedEvent = mapEventResponseToCalendarEvent(updatedEvent);
      if (!mappedEvent) {
        return;
      }

      setEvents((current) =>
        sortEvents(current.map((event) => (event.id === mappedEvent.id ? mappedEvent : event))),
      );
      setEditingEventId(null);
      setEditingDraft(null);
      setEmojiPickerTarget(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "일정 수정에 실패했습니다.");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => deleteEvent({ eventId }),
    onSuccess: (_, eventId) => {
      setEvents((current) => sortEvents(current.filter((event) => event.id !== eventId)));
      if (editingEventId === eventId) {
        setEditingEventId(null);
        setEditingDraft(null);
        setEmojiPickerTarget(null);
      }
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "일정 삭제에 실패했습니다.");
    },
  });

  const isMutationPending =
    createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending;

  const calendarDays = useMemo(
    () => getMonthGrid(visibleMonth.year, visibleMonth.month, todayIsoDate, events),
    [events, todayIsoDate, visibleMonth],
  );

  const selectedDay = useMemo(
    () => calendarDays.find((day) => day.isoDate === selectedIsoDate) ?? null,
    [calendarDays, selectedIsoDate],
  );

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => {
      const nextDate = new Date(current.year, current.month - 1 + offset, 1);

      return {
        year: nextDate.getFullYear(),
        month: nextDate.getMonth() + 1,
      };
    });
  };

  const openDailyModal = (isoDate: string) => {
    setSelectedIsoDate(isoDate);
    setIsEditMode(false);
    setEditingEventId(null);
    setEditingDraft(null);
    setIsInlineAdding(false);
    setInlineDraft(null);
    setEmojiPickerTarget(null);
  };

  const closeDailyModal = () => {
    setSelectedIsoDate(null);
    setIsEditMode(false);
    setEditingEventId(null);
    setEditingDraft(null);
    setIsInlineAdding(false);
    setInlineDraft(null);
    setEmojiPickerTarget(null);
  };

  const handleEditStart = (event: StaffCalendarEvent) => {
    setEditingEventId(event.id);
    setEditingDraft(createDraftFromEvent(event));
    setIsInlineAdding(false);
    setInlineDraft(null);
    setEmojiPickerTarget(null);
  };

  const handleEditComplete = () => {
    setIsEditMode(false);
    setEditingEventId(null);
    setEditingDraft(null);
    setIsInlineAdding(false);
    setInlineDraft(null);
    setEmojiPickerTarget(null);
  };

  const handleDelete = (eventId: number) => {
    deleteEventMutation.mutate(eventId);
  };

  const handleUpdateEvent = () => {
    if (!editingDraft || editingEventId === null) {
      return;
    }

    updateEventMutation.mutate({
      eventId: editingEventId,
      draft: editingDraft,
    });
  };

  const handleInlineAddStart = () => {
    if (!selectedIsoDate) {
      return;
    }

    setInlineDraft(createEmptyEventDraft(selectedIsoDate));
    setIsInlineAdding(true);
    setEditingEventId(null);
    setEditingDraft(null);
    setEmojiPickerTarget(null);
  };

  const handleInlineAddSubmit = () => {
    if (!inlineDraft) {
      return;
    }

    createEventMutation.mutate({
      ...inlineDraft,
      endDate: inlineDraft.date,
    });
    setIsInlineAdding(false);
    setInlineDraft(null);
  };

  const openCreateModal = () => {
    const defaultDate =
      selectedIsoDate ?? toIsoDate(new Date(visibleMonth.year, visibleMonth.month - 1, 1));
    setCreateDraft(createEmptyRangeDraft(defaultDate));
    setIsCreateModalOpen(true);
    setEmojiPickerTarget(null);
  };

  const handleCreateSubmit = () => {
    if (!isRangeFormValid(createDraft)) {
      return;
    }

    createEventMutation.mutate(createDraft);
  };

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <HeaderRow>
            <Title>학사 일정</Title>
            {isAdmin ? (
              <AddButton type="button" onClick={openCreateModal}>
                <IconCalendarPlus aria-hidden="true" size={18} stroke={2.2} />새 일정 추가
              </AddButton>
            ) : null}
          </HeaderRow>

          <CalendarPanel aria-label={`${visibleMonth.year}년 ${visibleMonth.month}월 학사 일정`}>
            {eventsQuery.isLoading ? (
              <CalendarLoadingOverlay aria-live="polite">
                <CalendarLoadingBadge>월별 일정을 불러오는 중입니다.</CalendarLoadingBadge>
              </CalendarLoadingOverlay>
            ) : null}

            <MonthHeader>
              <MonthButton type="button" onClick={() => moveMonth(-1)} aria-label="이전 달 보기">
                <IconChevronLeft aria-hidden="true" size={22} stroke={2.4} />
              </MonthButton>
              <MonthText>
                <span>{visibleMonth.month}월</span>
                <YearText>{visibleMonth.year}</YearText>
              </MonthText>
              <MonthButton type="button" onClick={() => moveMonth(1)} aria-label="다음 달 보기">
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
                  onClick={() => openDailyModal(day.isoDate)}
                  $isCurrentMonth={day.isCurrentMonth}
                  $isToday={day.isToday}
                  aria-label={`${formatKoreanDate(day.date)} ${day.events.length}개 일정`}
                >
                  <DayNumber $isCurrentMonth={day.isCurrentMonth}>{day.day}</DayNumber>
                  <EventStack>
                    {day.events.slice(0, 4).map((event) => (
                      <EventChip key={event.id} title={event.title}>
                        <EventIcon aria-hidden="true">{event.emoji}</EventIcon>
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
        <ModalBackdrop onClick={closeDailyModal}>
          <ScheduleDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle id="calendar-detail-title">
                {selectedDay.date.getMonth() + 1}월 {selectedDay.date.getDate()}일{" "}
                {getDayLabel(selectedDay.date)}요일
              </DialogTitle>

              <DialogHeaderActions>
                {isAdmin ? (
                  isEditMode ? (
                    <Button
                      type="button"
                      $variant="edit"
                      onClick={handleEditComplete}
                      disabled={isMutationPending}
                    >
                      편집 완료
                    </Button>
                  ) : (
                    <TextActionButton type="button" onClick={() => setIsEditMode(true)}>
                      편집
                    </TextActionButton>
                  )
                ) : null}

                <CloseButton type="button" onClick={closeDailyModal} aria-label="상세 일정 닫기">
                  <IconX aria-hidden="true" size={20} stroke={2.2} />
                </CloseButton>
              </DialogHeaderActions>
            </DialogHeader>

            <DialogBody>
              {isEditMode && isInlineAdding && inlineDraft ? (
                <EventEditorCard
                  draft={inlineDraft}
                  submitLabel="추가하기"
                  isSubmitting={createEventMutation.isPending}
                  onChange={(field, value) =>
                    setInlineDraft((current) =>
                      current ? { ...current, [field]: value } : current,
                    )
                  }
                  onSubmit={handleInlineAddSubmit}
                  onEmojiToggle={() =>
                    setEmojiPickerTarget((current) => (current === "inline" ? null : "inline"))
                  }
                  emojiPickerOpen={emojiPickerTarget === "inline"}
                  onEmojiSelect={(emoji) => {
                    setInlineDraft((current) => (current ? { ...current, emoji } : current));
                    setEmojiPickerTarget(null);
                  }}
                  onCancel={() => {
                    setIsInlineAdding(false);
                    setInlineDraft(null);
                    setEmojiPickerTarget(null);
                  }}
                />
              ) : null}

              {selectedDay.events.length > 0 ? (
                <DetailList>
                  {selectedDay.events.map((event) =>
                    editingEventId === event.id && editingDraft ? (
                      <EventEditorCard
                        key={event.id}
                        draft={editingDraft}
                        submitLabel="수정 완료"
                        isSubmitting={updateEventMutation.isPending}
                        onChange={(field, value) =>
                          setEditingDraft((current) =>
                            current ? { ...current, [field]: value } : current,
                          )
                        }
                        onSubmit={handleUpdateEvent}
                        onEmojiToggle={() =>
                          setEmojiPickerTarget((current) => (current === "edit" ? null : "edit"))
                        }
                        emojiPickerOpen={emojiPickerTarget === "edit"}
                        onEmojiSelect={(emoji) => {
                          setEditingDraft((current) => (current ? { ...current, emoji } : current));
                          setEmojiPickerTarget(null);
                        }}
                        onCancel={() => {
                          setEditingEventId(null);
                          setEditingDraft(null);
                          setEmojiPickerTarget(null);
                        }}
                      />
                    ) : (
                      <DetailItem key={event.id}>
                        {isAdmin && isEditMode ? (
                          <DetailActions>
                            <ActionLink
                              type="button"
                              onClick={() => handleEditStart(event)}
                              disabled={isMutationPending}
                            >
                              수정
                            </ActionLink>
                            <DeleteLink
                              type="button"
                              onClick={() => handleDelete(event.id)}
                              disabled={isMutationPending}
                            >
                              삭제
                            </DeleteLink>
                          </DetailActions>
                        ) : null}
                        <DetailEmoji>{event.emoji}</DetailEmoji>
                        <DetailDate>{formatMonthDayLabel(event.date)}</DetailDate>
                        {event.timeLabel ? <DetailTime>{event.timeLabel}</DetailTime> : null}
                        <DetailTitle>{event.title}</DetailTitle>
                        <DetailDescription>{event.description || "설명 없음"}</DetailDescription>
                      </DetailItem>
                    ),
                  )}
                </DetailList>
              ) : !isInlineAdding ? (
                <EmptyState>등록된 상세 일정이 없습니다.</EmptyState>
              ) : null}

              {isAdmin && isEditMode ? (
                <InlineAddButton
                  type="button"
                  onClick={handleInlineAddStart}
                  disabled={isInlineAdding || isMutationPending}
                >
                  <IconPlus aria-hidden="true" size={22} stroke={2.4} />
                </InlineAddButton>
              ) : null}
            </DialogBody>
          </ScheduleDialog>
        </ModalBackdrop>
      ) : null}

      {isCreateModalOpen ? (
        <ModalBackdrop onClick={() => setIsCreateModalOpen(false)}>
          <CreateDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-create-title"
            onClick={(event) => event.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle id="calendar-create-title">새 일정 추가</DialogTitle>
              <CloseButton
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="새 일정 추가 닫기"
              >
                <IconX aria-hidden="true" size={20} stroke={2.2} />
              </CloseButton>
            </DialogHeader>

            <DialogBody>
              <EditorCard>
                <EditorEmojiRow>
                  <EditorEmojiButton
                    type="button"
                    onClick={() =>
                      setEmojiPickerTarget((current) => (current === "create" ? null : "create"))
                    }
                    aria-label="이모지 선택"
                  >
                    <EditorEmoji>{createDraft.emoji}</EditorEmoji>
                  </EditorEmojiButton>
                </EditorEmojiRow>

                {emojiPickerTarget === "create" ? (
                  <CreateEmojiPickerWrap>
                    <EmojiPickerPanel>
                      {emojiOptions.map((emoji) => (
                        <EmojiOption
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setCreateDraft((current) => ({ ...current, emoji }));
                            setEmojiPickerTarget(null);
                          }}
                          aria-label={`${emoji} 선택`}
                        >
                          {emoji}
                        </EmojiOption>
                      ))}
                    </EmojiPickerPanel>
                  </CreateEmojiPickerWrap>
                ) : null}

                <CreatePeriodRow>
                  <PeriodGrid>
                    <EditorField>
                      <EditorLabel>기간 시작</EditorLabel>
                      <EditorInput
                        type="date"
                        value={createDraft.date}
                        onChange={(event) =>
                          setCreateDraft((current) => ({ ...current, date: event.target.value }))
                        }
                      />
                    </EditorField>

                    <EditorField>
                      <EditorLabel>기간 종료</EditorLabel>
                      <EditorInput
                        type="date"
                        value={createDraft.endDate}
                        onChange={(event) =>
                          setCreateDraft((current) => ({ ...current, endDate: event.target.value }))
                        }
                      />
                    </EditorField>
                  </PeriodGrid>
                </CreatePeriodRow>

                <TimeRow>
                  <EditorField>
                    <EditorLabel>시작 시간</EditorLabel>
                    <EditorInput
                      type="time"
                      value={createDraft.startTime}
                      onChange={(event) =>
                        setCreateDraft((current) => ({ ...current, startTime: event.target.value }))
                      }
                    />
                  </EditorField>
                  <EditorField>
                    <EditorLabel>종료 시간</EditorLabel>
                    <EditorInput
                      type="time"
                      value={createDraft.endTime}
                      onChange={(event) =>
                        setCreateDraft((current) => ({ ...current, endTime: event.target.value }))
                      }
                    />
                  </EditorField>
                </TimeRow>

                <EditorField>
                  <EditorLabel>제목</EditorLabel>
                  <EditorInput
                    type="text"
                    value={createDraft.title}
                    onChange={(event) =>
                      setCreateDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="일정 제목을 입력하세요."
                  />
                </EditorField>

                <EditorField>
                  <EditorLabel>내용</EditorLabel>
                  <EditorTextarea
                    value={createDraft.description}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="일정 내용을 입력하세요."
                  />
                </EditorField>

                <EditorActions>
                  <Button
                    type="button"
                    $variant="neutral"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={createEventMutation.isPending}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    $variant="edit"
                    onClick={handleCreateSubmit}
                    disabled={!isRangeFormValid(createDraft) || createEventMutation.isPending}
                  >
                    추가하기
                  </Button>
                </EditorActions>
              </EditorCard>
            </DialogBody>
          </CreateDialog>
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
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 1.4375rem;

  @media (min-width: 120rem) {
    margin-bottom: 1.75rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: stretch;
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
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${colors.pointSoft};
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 3px;
  }
`;

const CalendarPanel = styled.section`
  position: relative;
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

const CalendarLoadingOverlay = styled.div`
  position: absolute;
  top: ${spacing.space20};
  right: ${spacing.space20};
  z-index: 2;
  pointer-events: none;

  @media (min-width: 120rem) {
    top: 1.875rem;
    right: 1.875rem;
  }
`;

const CalendarLoadingBadge = styled.p`
  margin: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: rgba(255, 255, 255, 0.92);
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.06);
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space12};
  padding: ${spacing.space12} 0;
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
`;

const MonthText = styled.h2`
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: ${spacing.space8};
  min-width: 5.5rem;
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
`;

const YearText = styled.span`
  color: #777777;
  font-size: ${typography.fontSize13};
  font-weight: 500;
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
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: 11rem;
  gap: 0.4375rem;
  min-width: 42rem;
`;

const DateCell = styled.button<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space8};
  min-width: 0;
  min-height: 0;
  padding: 0.5rem;
  border: ${({ $isToday }) => ($isToday ? `2px solid ${colors.point}` : "2px solid transparent")};
  border-radius: 0.625rem;
  background-color: ${({ $isCurrentMonth }) =>
    $isCurrentMonth ? colors.background : colors.white};
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
`;

const DayNumber = styled.span<{ $isCurrentMonth: boolean }>`
  color: ${({ $isCurrentMonth }) => ($isCurrentMonth ? "#7b7b7b" : "#dbdbdb")};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
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
  border: 1px solid ${colors.white};
  background-color: #343434;
  color: ${colors.white};
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const EventIcon = styled.span`
  flex: 0 0 auto;
  font-size: 0.75rem;
  line-height: 1;
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

const CreateDialog = styled(ScheduleDialog)``;

const DialogHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space16};
  padding: ${spacing.space24};
  border-bottom: 1px solid #eeeeee;
  background-color: ${colors.background};

  @media (max-width: ${layout.breakpointMobile}) {
    padding: ${spacing.space24} ${spacing.space20} ${spacing.space16};
  }
`;

const DialogHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
`;

const DialogTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const TextActionButton = styled.button`
  border: 0;
  background-color: transparent;
  color: ${colors.point};
  font-size: ${typography.fontSize16};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
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
`;

const DialogBody = styled.div`
  display: grid;
  gap: ${spacing.space12};
  padding: ${spacing.space24};

  @media (max-width: ${layout.breakpointMobile}) {
    padding: ${spacing.space20};
  }
`;

const DetailList = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const DetailItem = styled.article`
  position: relative;
  display: grid;
  gap: ${spacing.space8};
  padding: ${spacing.space16};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
`;

const DetailActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space12};
`;

const ActionLink = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: #767676;
  font-size: ${typography.fontSize18};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const DeleteLink = styled(ActionLink)`
  color: ${colors.notice};
`;

const DetailEmoji = styled.span`
  font-size: 1.75rem;
  line-height: 1;
`;

const DetailDate = styled.p`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const DetailTime = styled.p`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const DetailTitle = styled.h3`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const DetailDescription = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
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

const InlineAddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3rem;
  border: 1px dashed ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const EditorCard = styled.article`
  position: relative;
  display: grid;
  gap: ${spacing.space12};
  padding: ${spacing.space16};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
`;

const EditorEmojiRow = styled.div`
  display: flex;
  align-items: center;
`;

const EditorEmojiButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const EditorEmoji = styled.span`
  font-size: 1.75rem;
  line-height: 1;
`;

const EditorHeaderRow = styled.div`
  position: relative;
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const PeriodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
  width: 100%;
  flex: 1;

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
    grid-template-columns: 1fr;
  }
`;

const CreatePeriodRow = styled.div`
  width: 100%;
`;

const EditorField = styled.label`
  display: grid;
  gap: ${spacing.space8};
  width: 100%;
`;

const EditorLabel = styled.span`
  color: #666666;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;

const EditorInput = styled.input`
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const EditorTextarea = styled.textarea`
  width: 100%;
  min-height: 6rem;
  padding: 0.875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  resize: vertical;
`;

const EmojiPickerWrap = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const CreateEmojiPickerWrap = styled.div`
  position: relative;
  align-self: flex-start;
`;

const EmojiPickerPanel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.375rem;
  width: 14rem;
  padding: 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.12);
`;

const EmojiOption = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  border: 0;
  border-radius: ${radii.radius12};
  background-color: ${colors.background};
  font-size: 1.25rem;
  cursor: pointer;
`;

const EditorActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space12};
`;
