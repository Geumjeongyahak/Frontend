"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { IconCalendarMonth } from "@tabler/icons-react";
import styled from "styled-components";
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
import { useProtectedHomeNavigation } from "@/components/home/useProtectedHomeNavigation";
import { queryKeys } from "@/lib/queryKeys";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import MobileRequestShell from "@/pwa/requests/components/MobileRequestShell";
import { colors, radii, spacing, typography } from "@/styles/tokens";
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
} from "@/components/staff/class-management/weekly-schedule/weeklyScheduleState";

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
  lessons: LessonSummaryResponseDto[];
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
      <TableTitle>{title}</TableTitle>
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
                  <ClassroomTypeText>{formatClassroomTypeLabel(classroom.type)}</ClassroomTypeText>
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
                  const hasRegisteredSubject = cellSubjects.length > 0;
                  const hasTeacher = hasAssignedTeacher(cellSubjects, firstOverride);
                  const firstExchangeDate =
                    firstStatusOverride?.lessonStatus === "EXCHANGED" ||
                    firstStatusOverride?.status === "EXCHANGED"
                      ? formatRelatedLessonDate(firstStatusOverride.relatedDate)
                      : "";

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
                          teacherName: getTeacherName(cellSubjects, firstOverride),
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
                          <TeacherName $assigned={false}>담당 교사 미배정</TeacherName>
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

export default function MobileWeeklySchedulePage() {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useProtectedHomeNavigation();
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedCell, setSelectedCell] = useState<ScheduleCellSelection | null>(null);
  const weekRange = useMemo(() => getWeekRange(anchorDate), [anchorDate]);
  const datePickerRef = useRef<HTMLInputElement | null>(null);

  const classroomsQuery = useQuery({
    queryKey: queryKeys.classrooms.list(),
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    enabled: isAuthenticated,
    retry: false,
  });

  const subjectsQuery = useQuery({
    queryKey: queryKeys.admin.subjects(),
    queryFn: () => getSubjects(),
    enabled: isAuthenticated,
    retry: false,
  });

  const lessonsQuery = useQuery({
    queryKey: queryKeys.lessons.weekly(weekRange.from, weekRange.to),
    queryFn: () => getLessons({ from: weekRange.from, to: weekRange.to }),
    enabled: isAuthenticated,
    retry: false,
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
  const isBaseLoading =
    isAuthLoading || (isAuthenticated && (classroomsQuery.isLoading || subjectsQuery.isLoading));
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
    <MobileRequestShell backHref="/" title="시간표">
      {!isAuthenticated ? (
        <StatePanel>
          {isAuthLoading ? (
            <>
              <AuthStatusSpinner />
              <StateText>로그인 상태를 확인하는 중입니다.</StateText>
            </>
          ) : (
            <>
              <StateTitle>로그인이 필요한 메뉴입니다.</StateTitle>
              <StateText>교원 계정으로 로그인하면 주간 시간표를 확인할 수 있습니다.</StateText>
              <PrimaryActionButton type="button" onClick={() => router.push("/login")}>
                로그인
              </PrimaryActionButton>
            </>
          )}
        </StatePanel>
      ) : (
        <>
          <NavigatorCard>
            <HeaderTopRow>
              <HeaderCopy>
                <PanelTitle>주간 시간표</PanelTitle>
                <Description>
                  {weekRange.from} ~ {weekRange.to}
                </Description>
              </HeaderCopy>
              <CalendarButton type="button" aria-label="날짜 선택" onClick={openDatePicker}>
                <IconCalendarMonth size={18} stroke={1.8} />
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
            </HeaderTopRow>
            <HeaderBottomRow>
              <WeekNavigator>
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
              </WeekNavigator>
            </HeaderBottomRow>
          </NavigatorCard>

          {isBaseLoading ? (
            <StatePanel>
              <AuthStatusSpinner />
              <StateText>시간표를 불러오는 중입니다.</StateText>
            </StatePanel>
          ) : null}
          {isBaseError ? (
            <StatePanel>
              <StateText role="alert">시간표를 불러오지 못했습니다.</StateText>
            </StatePanel>
          ) : null}
          {!isBaseLoading && !isBaseError && lessonsQuery.isError ? (
            <StatePanel>
              <StateText role="alert">시간표를 불러오지 못했습니다.</StateText>
            </StatePanel>
          ) : null}
          {!isBaseLoading && !isBaseError && !hasClassrooms ? (
            <StatePanel>
              <StateText>주중 또는 주말 분반이 없습니다.</StateText>
            </StatePanel>
          ) : null}

          {!isBaseLoading && !isBaseError && !lessonsQuery.isError && hasClassrooms ? (
            <TableStack>
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
            </TableStack>
          ) : null}
        </>
      )}

      {selectedCell ? (
        <ModalBackdrop onMouseDown={() => setSelectedCell(null)}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-weekly-schedule-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <ModalHeaderContent>
                <ModalTitleRow>
                  <ModalTitle id="mobile-weekly-schedule-detail-title">
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
    </MobileRequestShell>
  );
}

const NavigatorCard = styled.section`
  display: grid;
  gap: ${spacing.space12};
  padding: 1.25rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const TableStack = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const HeaderTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const HeaderBottomRow = styled.div`
  display: flex;
  justify-content: center;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const Description = styled.p`
  margin: 0;
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
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
  color: #8a8a8a;
  font-size: ${typography.fontSize16};
  font-weight: 900;
`;

const WeekNavigatorLabel = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 800;
`;

const CalendarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border: 1px solid #d7ddd3;
  border-radius: 0.625rem;
  background: #fbfcfa;
  color: ${colors.point};
`;

const HiddenDateInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
`;

const TableBlock = styled.section`
  display: grid;
  gap: ${spacing.space8};
  padding: 1.25rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const TableTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
`;

const TableScroll = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: ${spacing.space4};
`;

const ScheduleGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 6.75rem repeat(${({ $columns }) => $columns - 1}, 8.25rem);
  width: max-content;
  border-right: 1px solid #d9dfd5;
  border-bottom: 1px solid #d9dfd5;
  border-radius: 1rem;
  overflow: hidden;
`;

const RowFragment = styled.div`
  display: contents;
`;

const BaseCell = styled.div`
  min-width: 0;
  border-top: 1px solid #d9dfd5;
  border-left: 1px solid #d9dfd5;
`;

const HeaderCell = styled(BaseCell)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.125rem;
  min-height: 3rem;
  padding: ${spacing.space8};
  background: #f4f8ef;
`;

const HeaderDay = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 800;
`;

const HeaderDate = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const ClassroomCell = styled(BaseCell)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: ${spacing.space4};
  min-height: 6.5rem;
  padding: ${spacing.space8};
  background: #f4f8ef;
  text-align: center;
`;

const ClassroomName = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 800;
  word-break: keep-all;
`;

const ClassroomTypeText = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const ScheduleCellButton = styled.button<{
  $status?: "EXCHANGED" | "SUBSTITUTED" | "CANCELLED" | "ABSENT" | "ATTENDED" | "CHECKED_OUT";
}>`
  display: grid;
  align-content: start;
  gap: ${spacing.space4};
  min-height: 6.5rem;
  padding: ${spacing.space8};
  border: 0;
  border-top: 1px solid #d9dfd5;
  border-left: 1px solid #d9dfd5;
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
`;

const TeacherRow = styled.div`
  position: relative;
  min-height: 1.5rem;
`;

const StatusPill = styled.span<{
  $status: "EXCHANGED" | "SUBSTITUTED" | "CANCELLED" | "ABSENT" | "ATTENDED" | "CHECKED_OUT";
}>`
  position: absolute;
  top: 44%;
  left: -2%;
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
`;

const TeacherName = styled.p<{ $assigned: boolean }>`
  margin: 0;
  padding-top: 0.15rem;
  color: ${({ $assigned }) => ($assigned ? colors.text : colors.muted)};
  font-size: ${typography.fontSize13};
  font-weight: ${({ $assigned }) => ($assigned ? 800 : 700)};
  line-height: ${typography.lineHeight130};
  text-align: center;
  word-break: keep-all;
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
`;

const PeriodList = styled.div`
  display: grid;
  gap: 0.1875rem;
`;

const PeriodItem = styled.div`
  display: grid;
  grid-template-columns: 2.6rem minmax(0, 1fr);
  gap: ${spacing.space4};
  align-items: center;
  min-height: 1.4rem;
`;

const PeriodBadge = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 800;
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
  width: 4.8rem;
  min-height: 1.25rem;
  padding: 0 ${spacing.space8};
  border-radius: ${radii.radius999};
  background-color: ${({ $empty, $period }) =>
    $empty ? "#f1f3f2" : DEFAULT_PERIOD_COLORS[$period as PeriodNumber]};
  color: ${({ $empty, $period }) =>
    $empty ? "#7c8581" : (PERIOD_COLOR_TEXT[$period as PeriodNumber] ?? colors.text)};
  font-size: 0.75rem;
  font-weight: 800;
  text-align: center;
`;

const SubjectNameText = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatePanel = styled.section`
  display: grid;
  justify-items: center;
  gap: ${spacing.space12};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
  text-align: center;
`;

const StateTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const StateText = styled.p`
  margin: 0;
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const PrimaryActionButton = styled.button`
  min-height: 3rem;
  padding: 0 1.25rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 0 ${spacing.space16} ${spacing.space16};
  background: rgba(17, 17, 17, 0.4);
`;

const ModalDialog = styled.div`
  width: min(100%, 30rem);
  display: grid;
  gap: ${spacing.space16};
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding: 1.25rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 -0.5rem 2rem rgba(0, 0, 0, 0.12);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const ModalHeaderContent = styled.div`
  display: grid;
  gap: 0.125rem;
`;

const ModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const ModalStatusPill = styled(StatusPill)`
  position: static;
  transform: none;
  flex: 0 0 auto;
`;

const ModalDescription = styled.p`
  color: #72806a;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  margin-bottom: -0.25rem;
`;

const CloseButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  font-weight: 700;
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
  background: #fcfcfc;
`;

const ModalPeriodHeading = styled.h3`
  margin: 0;
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 800;
`;

const ModalPeriodSubject = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
`;

const ModalPeriodTime = styled.p`
  margin: 0;
  color: #72806a;
  font-size: ${typography.fontSize13};
`;
