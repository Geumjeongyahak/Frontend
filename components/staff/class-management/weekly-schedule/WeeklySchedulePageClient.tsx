"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import styled from "styled-components";
import { IconCalendarMonth } from "@tabler/icons-react";
import { getClassrooms } from "@/api/classroom/classroom.api";
import type { ClassroomListItemDto, ClassroomType } from "@/api/classroom/classroom.dto";
import { getLessons } from "@/api/lesson/lesson.api";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import { getSubjects } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  filterActiveSubjects,
  formatSubjectDateRange,
  formatSubjectTeacherName,
} from "@/components/admin/subjects/shared/subjectDisplay";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import {
  DISPLAY_PERIODS,
  WEEKDAY_COLUMNS,
  WEEKEND_COLUMNS,
  buildScheduleOverrides,
  formatTeacherAttendanceTime,
  formatWeeklyScheduleStatusLabel,
  formatRelatedLessonDate,
  getDateForColumn,
  getPeriodSubject,
  getSubjectsForCell,
  getWeekRange,
  type WeeklyScheduleAttendanceStatus,
  type WeeklyScheduleLessonStatus,
  type WeeklyScheduleOverride,
} from "./weeklyScheduleState";

const DEFAULT_PERIOD_COLORS: Record<(typeof DISPLAY_PERIODS)[number], string> = {
  1: colors.noticeSoft,
  2: "#e7e9ff",
  3: "#e6f6ea",
};

const PERIOD_COLOR_TEXT: Record<(typeof DISPLAY_PERIODS)[number], string> = {
  1: "#9d2e28",
  2: "#3c48c7",
  3: "#26964a",
};

type PeriodNumber = (typeof DISPLAY_PERIODS)[number];

type ScheduleCellSelection = {
  classroomName: string;
  classroomType?: ClassroomType;
  status?: WeeklyScheduleOverride["status"];
  lessonStatus?: WeeklyScheduleLessonStatus;
  attendanceStatus?: WeeklyScheduleAttendanceStatus;
  assignmentDateRange?: string;
  relatedDate?: string;
  attendedAt?: string;
  checkedOutAt?: string;
  date: string;
  dayLabel: string;
  teacherName: string;
  periods: Array<{
    period: number;
    subjectName: string;
    startTime?: string;
    endTime?: string;
  }>;
};

type ScheduleTableProps = {
  title: string;
  classrooms: ClassroomListItemDto[];
  subjects: SubjectDetailResponseDto[];
  columns: typeof WEEKDAY_COLUMNS | typeof WEEKEND_COLUMNS;
  weekStartDate: string;
  lessons: Awaited<ReturnType<typeof getLessons>>;
  onSelectCell: (selection: ScheduleCellSelection) => void;
};

function getClassroomId(classroom: ClassroomListItemDto) {
  return typeof classroom.id === "number" ? classroom.id : null;
}

function isClassroomType(classroom: ClassroomListItemDto, type: "WEEKDAY" | "WEEKEND") {
  return classroom.type === type;
}

function sortClassrooms(classrooms: ClassroomListItemDto[]) {
  return [...classrooms].sort((a, b) => {
    const aId = getClassroomId(a) ?? Number.MAX_SAFE_INTEGER;
    const bId = getClassroomId(b) ?? Number.MAX_SAFE_INTEGER;
    return aId - bId;
  });
}

function formatClassroomTypeLabel(type?: ClassroomType) {
  if (type === "WEEKDAY") return "주중";
  if (type === "WEEKEND") return "주말";
  return "기타";
}

function getTeacherName(subjects: SubjectDetailResponseDto[], override?: WeeklyScheduleOverride) {
  if (override?.teacherName?.trim()) return formatSubjectTeacherName(override.teacherName);

  const teacherName = subjects.find((subject) => subject.teacherName?.trim())?.teacherName;
  return teacherName ? formatSubjectTeacherName(teacherName) : "담당 교사 미배정";
}

function hasAssignedTeacher(
  subjects: SubjectDetailResponseDto[],
  override?: WeeklyScheduleOverride,
) {
  return (
    Boolean(override?.teacherName?.trim()) ||
    subjects.some((subject) => subject.teacherName?.trim())
  );
}

function formatSubjectName(subject?: SubjectDetailResponseDto, override?: WeeklyScheduleOverride) {
  if (override?.subjectName?.trim()) return override.subjectName;
  return subject?.name?.trim() || "미등록";
}

function formatWeekNavigatorLabel(weekStartDate: string) {
  const start = dayjs(weekStartDate);
  const month = start.format("MM");
  const weekOfMonth = Math.ceil(start.date() / 7);
  return `${month}월 ${weekOfMonth}주차`;
}

function formatHeaderDate(weekStartDate: string, isoWeekday: number) {
  return dayjs(getDateForColumn(weekStartDate, isoWeekday)).format("MM/DD");
}

function getLessonTimeRange(
  subject: SubjectDetailResponseDto | undefined,
  lesson: LessonSummaryResponseDto | undefined,
) {
  const startTime = lesson?.startTime ?? subject?.startTime;
  const endTime = lesson?.endTime ?? subject?.endTime;
  if (!startTime || !endTime) return null;

  return {
    startTime: startTime.slice(0, 5),
    endTime: endTime.slice(0, 5),
  };
}

function getLessonForCell(
  lessons: LessonSummaryResponseDto[],
  classroomId: number | null,
  date: string,
  period: number,
) {
  if (classroomId == null) return undefined;
  return lessons.find(
    (lesson) =>
      lesson.classroomId === classroomId && lesson.date === date && lesson.period === period,
  );
}

function ScheduleTable({
  title,
  classrooms,
  subjects,
  columns,
  weekStartDate,
  lessons,
  onSelectCell,
}: ScheduleTableProps) {
  return (
    <TableBlock>
      <ScheduleTitle>{title}</ScheduleTitle>
      <TableScroll>
        <ScheduleGrid $columns={columns.length + 1}>
          <HeaderCell aria-label="분반" />
          {columns.map((column) => (
            <HeaderCell key={column.value}>
              <HeaderDay>{column.label}</HeaderDay>
              <HeaderDate>{formatHeaderDate(weekStartDate, column.isoWeekday)}</HeaderDate>
            </HeaderCell>
          ))}

          {classrooms.map((classroom) => {
            const classroomId = getClassroomId(classroom);

            return (
              <RowFragment key={classroomId ?? classroom.name}>
                <ClassroomCell>
                  <ClassroomName>{classroom.name ?? "이름 없음"}</ClassroomName>
                  <ClassroomType>{formatClassroomTypeLabel(classroom.type)}</ClassroomType>
                </ClassroomCell>
                {columns.map((column) => {
                  const date = getDateForColumn(weekStartDate, column.isoWeekday);
                  const cellSubjects = getSubjectsForCell(
                    subjects,
                    classroomId,
                    column.value,
                    date,
                  );
                  const overrides = buildScheduleOverrides(
                    cellSubjects,
                    lessons,
                    classroomId,
                    date,
                  );
                  const firstOverride = [...overrides.values()][0];
                  const firstStatusOverride = [...overrides.values()].find(
                    (override) => override.status,
                  );
                  const firstExchangeDate =
                    firstStatusOverride?.lessonStatus === "EXCHANGED" ||
                    firstStatusOverride?.status === "EXCHANGED"
                      ? formatRelatedLessonDate(firstStatusOverride.relatedDate)
                      : "";
                  const hasRegisteredSubject = cellSubjects.length > 0;
                  const hasTeacher = hasAssignedTeacher(cellSubjects, firstOverride);
                  const teacherName = getTeacherName(cellSubjects, firstOverride);
                  const periodDetails = DISPLAY_PERIODS.map((period) => {
                    const subject = getPeriodSubject(cellSubjects, period);
                    const override = overrides.get(period);
                    const lesson = getLessonForCell(lessons, classroomId, date, period);
                    const lessonTimeRange = getLessonTimeRange(subject, lesson);

                    return {
                      period,
                      subjectName: formatSubjectName(subject, override),
                      startTime: lessonTimeRange?.startTime,
                      endTime: lessonTimeRange?.endTime,
                    };
                  });
                  const assignmentDateRange = cellSubjects
                    .map((subject) => formatSubjectDateRange(subject.startAt, subject.endAt))
                    .find((value) => value.trim().length > 0);

                  return (
                    <ScheduleCellButton
                      key={`${classroomId}-${column.value}`}
                      type="button"
                      $status={firstStatusOverride?.status}
                      onClick={() =>
                        onSelectCell({
                          classroomName: classroom.name ?? "이름 없음",
                          classroomType: classroom.type,
                          status: firstStatusOverride?.status,
                          lessonStatus: firstStatusOverride?.lessonStatus,
                          attendanceStatus: firstStatusOverride?.attendanceStatus,
                          assignmentDateRange,
                          relatedDate: firstStatusOverride?.relatedDate,
                          attendedAt: firstStatusOverride?.attendedAt,
                          checkedOutAt: firstStatusOverride?.checkedOutAt,
                          date,
                          dayLabel: column.label,
                          teacherName,
                          periods: periodDetails,
                        })
                      }
                    >
                      <TeacherRow>
                        {firstStatusOverride?.status ? (
                          <StatusPill $status={firstStatusOverride.status}>
                            {formatWeeklyScheduleStatusLabel(firstStatusOverride.status)}
                          </StatusPill>
                        ) : null}
                        {hasRegisteredSubject ? (
                          <TeacherName $assigned={hasTeacher}>
                            {getTeacherName(cellSubjects, firstOverride)}
                          </TeacherName>
                        ) : (
                          <EmptyText>담당 교사 미배정</EmptyText>
                        )}
                        {firstExchangeDate ? (
                          <ExchangeDateText>{firstExchangeDate}</ExchangeDateText>
                        ) : null}
                      </TeacherRow>
                      <PeriodList>
                        {DISPLAY_PERIODS.map((period) => {
                          const subject = getPeriodSubject(cellSubjects, period);
                          const override = overrides.get(period);

                          return (
                            <PeriodItem key={period}>
                              <PeriodBadge>{period}교시</PeriodBadge>
                              <SubjectBlock
                                $period={period}
                                $status={override?.status}
                                $empty={!subject && !override}
                              >
                                <SubjectNameText>
                                  {formatSubjectName(subject, override)}
                                </SubjectNameText>
                              </SubjectBlock>
                            </PeriodItem>
                          );
                        })}
                      </PeriodList>
                    </ScheduleCellButton>
                  );
                })}
              </RowFragment>
            );
          })}
        </ScheduleGrid>
      </TableScroll>
    </TableBlock>
  );
}

export default function WeeklySchedulePageClient() {
  const { status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedCell, setSelectedCell] = useState<ScheduleCellSelection | null>(null);
  const weekRange = useMemo(() => getWeekRange(anchorDate), [anchorDate]);
  const datePickerRef = useRef<HTMLInputElement | null>(null);

  const classroomsQuery = useQuery({
    queryKey: queryKeys.classrooms.list(),
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    enabled: isAuthenticated,
  });

  const subjectsQuery = useQuery({
    queryKey: queryKeys.admin.subjects(),
    queryFn: () => getSubjects(),
    enabled: isAuthenticated,
  });

  const lessonsQuery = useQuery({
    queryKey: queryKeys.lessons.weekly(weekRange.from, weekRange.to),
    queryFn: () => getLessons({ from: weekRange.from, to: weekRange.to }),
    enabled: isAuthenticated,
  });

  const classrooms = useMemo(
    () => sortClassrooms(classroomsQuery.data?.content ?? []),
    [classroomsQuery.data?.content],
  );
  const subjects = useMemo(() => {
    const items = Array.isArray(subjectsQuery.data) ? subjectsQuery.data : [];
    return filterActiveSubjects(items);
  }, [subjectsQuery.data]);

  const weekdayClassrooms = classrooms.filter((classroom) => isClassroomType(classroom, "WEEKDAY"));
  const weekendClassrooms = classrooms.filter((classroom) => isClassroomType(classroom, "WEEKEND"));
  const hasClassrooms = weekdayClassrooms.length > 0 || weekendClassrooms.length > 0;
  const requiresLogin = authStatus !== "loading" && !isAuthenticated;
  const isBaseLoading =
    authStatus === "loading" || (isAuthenticated && (classroomsQuery.isLoading || subjectsQuery.isLoading));
  const isBaseError = isAuthenticated && (classroomsQuery.isError || subjectsQuery.isError);

  const openDatePicker = () => {
    const input = datePickerRef.current;
    if (!input) return;
    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  return (
    <PageSection>
      <HeaderRow>
        <HeaderCopy>
          <Title>시간표</Title>
          <Description>
            {weekRange.from} ~ {weekRange.to}
          </Description>
        </HeaderCopy>
        <WeekNavigator aria-label="주간 시간표 이동">
          <WeekArrowButton
            type="button"
            onClick={() => setAnchorDate(dayjs(anchorDate).subtract(1, "week").toDate())}
            aria-label="이전 주"
          >
            ◀
          </WeekArrowButton>
          <WeekNavigatorLabel
            type="button"
            onClick={() => setAnchorDate(new Date())}
            aria-label="이번 주로 이동"
          >
            {formatWeekNavigatorLabel(weekRange.from)}
          </WeekNavigatorLabel>
          <WeekArrowButton
            type="button"
            onClick={() => setAnchorDate(dayjs(anchorDate).add(1, "week").toDate())}
            aria-label="다음 주"
          >
            ▶
          </WeekArrowButton>
          <CalendarButton type="button" aria-label="날짜 선택" onClick={openDatePicker}>
            <IconCalendarMonth className="calendar-icon" stroke={1.8} />
          </CalendarButton>
          <HiddenDateInput
            ref={datePickerRef}
            type="date"
            value={dayjs(anchorDate).format("YYYY-MM-DD")}
            onChange={(event) => {
              if (!event.target.value) return;
              setAnchorDate(dayjs(event.target.value).toDate());
            }}
          />
        </WeekNavigator>
      </HeaderRow>

      {isBaseLoading ? <StateText>시간표를 불러오는 중입니다.</StateText> : null}
      {requiresLogin ? <StateText>로그인이 필요합니다.</StateText> : null}
      {isBaseError ? <StateText role="alert">시간표를 불러오지 못했습니다.</StateText> : null}
      {!requiresLogin && !isBaseLoading && !isBaseError && lessonsQuery.isError ? (
        <StateText role="alert">시간표를 불러오지 못했습니다.</StateText>
      ) : null}
      {!requiresLogin && !isBaseLoading && !isBaseError && !hasClassrooms ? (
        <StateText>주중 또는 주말 분반이 없습니다.</StateText>
      ) : null}
      {!requiresLogin && !isBaseLoading && !isBaseError && !lessonsQuery.isError && hasClassrooms ? (
        <ScheduleShell>
          <ScheduleStack>
            <ScheduleContentTrack>
              <ScheduleTable
                title="주중 시간표"
                classrooms={weekdayClassrooms}
                subjects={subjects}
                columns={WEEKDAY_COLUMNS}
                weekStartDate={weekRange.from}
                lessons={lessonsQuery.data ?? []}
                onSelectCell={setSelectedCell}
              />
              <ScheduleTable
                title="주말 시간표"
                classrooms={weekendClassrooms}
                subjects={subjects}
                columns={WEEKEND_COLUMNS}
                weekStartDate={weekRange.from}
                lessons={lessonsQuery.data ?? []}
                onSelectCell={setSelectedCell}
              />
            </ScheduleContentTrack>
          </ScheduleStack>
        </ScheduleShell>
      ) : null}

      {selectedCell ? (
        <ModalBackdrop onMouseDown={() => setSelectedCell(null)}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="weekly-schedule-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <ModalHeaderContent>
                <ModalTitleRow>
                  <ModalTitle id="weekly-schedule-detail-title">
                    {selectedCell.classroomName} {selectedCell.dayLabel}요일 수업
                  </ModalTitle>
                  {selectedCell.lessonStatus ? (
                    <ModalStatusPill $status={selectedCell.lessonStatus}>
                      {formatWeeklyScheduleStatusLabel(selectedCell.lessonStatus)}
                    </ModalStatusPill>
                  ) : null}
                  {selectedCell.status &&
                  selectedCell.status !== selectedCell.lessonStatus ? (
                    <ModalStatusPill $status={selectedCell.status}>
                      {formatWeeklyScheduleStatusLabel(selectedCell.status)}
                    </ModalStatusPill>
                  ) : null}
                </ModalTitleRow>
                {selectedCell.assignmentDateRange ? (
                  <ModalDescription>배정 기간 {selectedCell.assignmentDateRange}</ModalDescription>
                ) : null}
                <ModalDescription>
                  {selectedCell.date} · {selectedCell.teacherName}
                </ModalDescription>
                {selectedCell.attendedAt ? (
                  <ModalDescription>
                    출근 시간 {formatTeacherAttendanceTime(selectedCell.attendedAt)}
                  </ModalDescription>
                ) : null}
                {selectedCell.checkedOutAt ? (
                  <ModalDescription>
                    퇴근 시간 {formatTeacherAttendanceTime(selectedCell.checkedOutAt)}
                  </ModalDescription>
                ) : null}
              </ModalHeaderContent>
              <CloseButton type="button" onClick={() => setSelectedCell(null)}>
                닫기
              </CloseButton>
            </ModalHeader>
            <ModalPeriodList>
              {selectedCell.periods.map((period) => (
                <ModalPeriodCard key={period.period}>
                  <ModalPeriodHeading>{period.period}교시</ModalPeriodHeading>
                  <ModalPeriodSubject>{period.subjectName}</ModalPeriodSubject>
                  {period.startTime && period.endTime ? (
                    <ModalPeriodTime>
                      {period.startTime} - {period.endTime}
                    </ModalPeriodTime>
                  ) : null}
                </ModalPeriodCard>
              ))}
            </ModalPeriodList>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}
    </PageSection>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 3rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 4rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: ${spacing.space16};
  border-bottom: 1px solid ${colors.border};

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: ${spacing.space8};
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

const Description = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;

const ScheduleShell = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const WeekNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
`;

const WeekArrowButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #b8b8b8;
  font-family: inherit;
  font-size: ${typography.fontSize16};
  font-weight: 900;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: #7f7f7f;
    outline: none;
  }
`;

const WeekNavigatorLabel = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #303030;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: #111111;
    outline: none;
  }
`;

const CalendarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 0.375rem;
  background-color: ${colors.white};
  color: #7f7f7f;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: #bdbdbd;
    color: #404040;
    outline: none;
  }

  .calendar-icon {
    width: 20px;
    height: 20px;
    margin-bottom: 0.9px;
  }

  @media (min-width: 120rem) {
    .calendar-icon {
      width: 22px;
      height: 22px;
      margin-bottom: 3px;
    }
  }
`;

const HiddenDateInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
`;

const StateText = styled.p`
  margin: 0;
  padding: ${spacing.space24};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const ScheduleStack = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
`;

const ScheduleContentTrack = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.space20};
  width: max-content;
`;

const TableBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
  flex: 0 0 auto;
`;

const ScheduleTitle = styled.h2`
  margin: 0;
  color: #1f2b28;
  font-size: ${typography.fontSize16};
  font-weight: 900;
  line-height: 1.25rem;
`;

const TableScroll = styled.div`
  overflow-x: visible;
`;

const ScheduleGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 8.5rem repeat(${({ $columns }) => $columns - 1}, 10.5rem);
  width: max-content;
  border-right: 1px solid ${colors.borderStrong};
  border-bottom: 1px solid ${colors.borderStrong};
  border-radius: 0.25rem;
  overflow: hidden;

  @media (min-width: 120rem) {
    grid-template-columns: 10rem repeat(${({ $columns }) => $columns - 1}, 12.5rem);
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 8rem repeat(${({ $columns }) => $columns - 1}, 9.75rem);
  }
`;

const RowFragment = styled.div`
  display: contents;
`;

const BaseCell = styled.div`
  min-width: 0;
  border-top: 1px solid ${colors.borderStrong};
  border-left: 1px solid ${colors.borderStrong};
`;

const HeaderCell = styled(BaseCell)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.125rem;
  min-height: 3.25rem;
  padding: ${spacing.space8} ${spacing.space12};
  background-color: ${colors.pointSoft};
  color: #111;
  line-height: ${typography.lineHeight130};
`;

const HeaderDay = styled.span`
  font-size: ${typography.fontSize14};
  font-weight: 900;
`;

const HeaderDate = styled.span`
  color: #64706c;
  font-size: 0.6875rem;
  font-weight: 700;
`;

const ClassroomCell = styled(BaseCell)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: ${spacing.space4};
  min-height: 7rem;
  padding: ${spacing.space12};
  background-color: ${colors.pointSoft};
  text-align: center;
`;

const ClassroomName = styled.span`
  color: #111;
  font-size: ${typography.fontSize14};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
  word-break: keep-all;
`;

const ClassroomType = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const ScheduleCellButton = styled.button<{
  $status?: "EXCHANGED" | "SUBSTITUTED" | "CANCELLED" | "ABSENT" | "ATTENDED" | "CHECKED_OUT";
}>`
  display: grid;
  align-content: start;
  gap: ${spacing.space4};
  min-height: 7rem;
  padding: ${spacing.space8} ${spacing.space12};
  border: 0;
  border-top: 1px solid ${colors.borderStrong};
  border-left: 1px solid ${colors.borderStrong};
  background-color: ${({ $status }) => {
    if ($status === "EXCHANGED") return "#f4efff";
    if ($status === "SUBSTITUTED") return "#fff8dc";
    if ($status === "CANCELLED") return "#fff4f3";
    if ($status === "ABSENT") return "#fff4f3";
    if ($status === "ATTENDED") return "#eef9e6";
    if ($status === "CHECKED_OUT") return "#fff1f6";
    return colors.white;
  }};
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${({ $status }) => {
      if ($status === "EXCHANGED") return "#efe8ff";
      if ($status === "SUBSTITUTED") return "#fff2b8";
      if ($status === "CANCELLED") return "#ffeceb";
      if ($status === "ABSENT") return "#ffeceb";
      if ($status === "ATTENDED") return "#e4f6d9";
      if ($status === "CHECKED_OUT") return "#ffe6f0";
      return "#fbfcfb";
    }};
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 1px ${colors.point};
    outline: none;
  }
`;

const TeacherRow = styled.div`
  position: relative;
  min-height: 1.5rem;
`;

const StatusPill = styled.span<{
  $status: "EXCHANGED" | "SUBSTITUTED" | "CANCELLED" | "ABSENT" | "ATTENDED" | "CHECKED_OUT";
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  min-height: 1.125rem;
  border: 1px solid
    ${({ $status }) =>
      $status === "EXCHANGED"
        ? "#d7cafc"
        : $status === "SUBSTITUTED"
          ? "#eadb86"
          : $status === "ATTENDED"
            ? "#b7df9d"
            : $status === "CHECKED_OUT"
              ? "#f0b7cd"
              : "#f3b8b2"};
  border-radius: ${radii.radius999};
  background-color: ${({ $status }) =>
    $status === "EXCHANGED"
      ? "#eee7ff"
      : $status === "SUBSTITUTED"
        ? "#fff4b5"
        : $status === "ATTENDED"
          ? "#edf8e4"
          : $status === "CHECKED_OUT"
            ? "#fde8f1"
            : "#fde4e2"};
  padding: 0 ${spacing.space8};
  color: ${({ $status }) =>
    $status === "EXCHANGED"
      ? "#6846c9"
      : $status === "SUBSTITUTED"
        ? "#9e7a00"
        : $status === "ATTENDED"
          ? "#3e8f2a"
          : $status === "CHECKED_OUT"
            ? "#c64f83"
            : colors.notice};
  font-size: 0.6875rem;
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

const TeacherName = styled.p<{ $assigned: boolean }>`
  margin: 0;
  padding-top: 0.15rem;
  color: ${({ $assigned }) => ($assigned ? "#111" : colors.muted)};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $assigned }) => ($assigned ? 900 : 700)};
  line-height: ${typography.lineHeight130};
  text-align: center;
  word-break: keep-all;
`;

const EmptyText = styled.p`
  margin: 0;
  padding-top: 0.15rem;
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;
`;

const PeriodList = styled.div`
  display: grid;
  gap: 0.1875rem;
`;

const ExchangeDateText = styled.p`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  margin: 0;
  color: ${colors.notice};
  font-size: 0.6875rem;
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize13};
  }
`;

const PeriodItem = styled.div`
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 1fr);
  gap: ${spacing.space8};
  align-items: center;
  min-height: 1.7rem;

  @media (min-width: 120rem) {
    min-height: 2rem;
  }
`;

const PeriodBadge = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const SubjectBlock = styled.span<{
  $status?: "EXCHANGED" | "SUBSTITUTED" | "CANCELLED" | "ABSENT" | "ATTENDED" | "CHECKED_OUT";
  $empty: boolean;
  $period: number;
}>`
  display: grid;
  align-items: center;
  justify-self: end;
  box-sizing: border-box;
  width: 6.4rem;
  min-height: 1.25rem;
  padding: 0 ${spacing.space8};
  border-radius: ${radii.radius999};
  background-color: ${({ $empty, $period }) => {
    return $empty ? "#f1f3f2" : DEFAULT_PERIOD_COLORS[$period as PeriodNumber];
  }};
  color: ${({ $empty, $period }) => {
    return $empty ? "#7c8581" : (PERIOD_COLOR_TEXT[$period as PeriodNumber] ?? "#1f2b28");
  }};
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  text-align: center;

  @media (min-width: 120rem) {
    width: 8.4rem;
    height: 1.4rem;
  }
`;

const SubjectNameText = styled.span`
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const ModalHeaderContent = styled.div`
  display: grid;
`;

const ModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  flex-wrap: wrap;
  margin-bottom: 0.125rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #111111;
  font-size: ${typography.fontSize18};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

const ModalStatusPill = styled(StatusPill)`
  position: static;
  transform: none;
  flex: 0 0 auto;
`;

const ModalDescription = styled.p`
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  margin-bottom: -0.25rem;
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

const ModalPeriodSubject = styled.p`
  margin: 0;
  color: #111111;
  font-size: ${typography.fontSize16};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

const ModalPeriodTime = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;
