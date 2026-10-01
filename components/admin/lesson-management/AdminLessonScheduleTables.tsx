"use client";

import { useEffect, useMemo, useState } from "react";
import type { SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import styled from "styled-components";
import { IconChevronLeft, IconChevronRight, IconSettings } from "@tabler/icons-react";
import { getClassrooms } from "@/api/classroom/classroom.api";
import type { ClassroomListItemDto, ClassroomType } from "@/api/classroom/classroom.dto";
import {
  assignSubjectTeacher,
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
  updateSubjectSchedule,
} from "@/api/subject/subject.api";
import type { SubjectDayOfWeek, SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { getUsers } from "@/api/user/user.api";
import type { UserListItemDto } from "@/api/user/user.dto";
import {
  ButtonRow,
  DataState,
  DangerButton,
  InlineStatus,
  Label,
  SectionCard,
  SectionTitle,
  SmallButton,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { AdminLessonDeleteConfirmModal } from "@/components/admin/lesson-management/AdminLessonDeleteConfirmModal";
import { normalizeLessonTimeForApi } from "@/components/admin/lesson-management/lessonCreateError";
import {
  formatCellSaveError,
  getPeriodSaveSteps,
} from "@/components/admin/lesson-management/lessonScheduleCellSave";
import { getLessonMonthRange } from "@/components/admin/lesson-management/lessonMonthFilter";
import { filterAssignableTeachers } from "@/components/admin/teacherAssignmentRoles";
import {
  filterActiveSubjects,
  formatSubjectTeacherName,
} from "@/components/admin/subjects/shared/subjectDisplay";
import {
  getPeriodSubject,
  getSubjectsForCell,
} from "@/components/staff/class-management/weekly-schedule/weeklyScheduleState";
import { queryKeys } from "@/lib/queryKeys";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const WEEKDAY_COLUMNS: { value: SubjectDayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "월" },
  { value: "TUESDAY", label: "화" },
  { value: "WEDNESDAY", label: "수" },
  { value: "THURSDAY", label: "목" },
  { value: "FRIDAY", label: "금" },
];

const WEEKEND_COLUMNS: { value: SubjectDayOfWeek; label: string }[] = [
  { value: "SATURDAY", label: "토" },
];

const DISPLAY_PERIODS = [1, 2, 3] as const;
const PERIOD_COLOR_STORAGE_KEY = "adminLessonSchedulePeriodColors";

type PeriodNumber = (typeof DISPLAY_PERIODS)[number];
type PeriodColorMap = Record<PeriodNumber, string>;

const DEFAULT_PERIOD_COLORS: PeriodColorMap = {
  1: colors.noticeSoft,
  2: "#e7e9ff",
  3: "#e6f6ea",
};

const PERIOD_COLOR_TEXT: PeriodColorMap = {
  1: "#9d2e28",
  2: "#3c48c7",
  3: "#26964a",
};

type ScheduleCellSelection = {
  classroom: ClassroomListItemDto;
  dayOfWeek: SubjectDayOfWeek;
  dayLabel: string;
};

type MonthRange = { from: string; to: string };

type PeriodFormState = {
  period: number;
  subjectId: number | null;
  name: string;
  startTime: string;
  endTime: string;
};

type ScheduleCellFormState = {
  teacherId: string;
  startAt: string;
  endAt: string;
  periods: PeriodFormState[];
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

function getSubjectId(subject?: SubjectDetailResponseDto) {
  return typeof subject?.id === "number" ? subject.id : null;
}

function getTeacherName(subjects: SubjectDetailResponseDto[]) {
  const teacherName = subjects.find((subject) => subject.teacherName?.trim())?.teacherName;
  return teacherName ? formatSubjectTeacherName(teacherName) : "담당 교사 미배정";
}

function hasAssignedTeacher(subjects: SubjectDetailResponseDto[]) {
  return subjects.some((subject) => subject.teacherName?.trim());
}

function formatSubjectName(subject?: SubjectDetailResponseDto) {
  return subject?.name?.trim() || "미등록";
}

function getPeriodColor(periodColors: PeriodColorMap, period: number) {
  return periodColors[period as PeriodNumber] ?? DEFAULT_PERIOD_COLORS[1];
}

function readStoredPeriodColors() {
  if (typeof window === "undefined") return DEFAULT_PERIOD_COLORS;

  try {
    const stored = window.localStorage.getItem(PERIOD_COLOR_STORAGE_KEY);
    if (!stored) return DEFAULT_PERIOD_COLORS;

    const parsed = JSON.parse(stored) as Partial<Record<string, unknown>>;
    return DISPLAY_PERIODS.reduce<PeriodColorMap>(
      (acc, period) => {
        const value = parsed[String(period)];
        acc[period] =
          typeof value === "string" && value.trim() ? value : DEFAULT_PERIOD_COLORS[period];
        return acc;
      },
      { ...DEFAULT_PERIOD_COLORS },
    );
  } catch {
    return DEFAULT_PERIOD_COLORS;
  }
}

function formatClassroomTypeLabel(type?: ClassroomType) {
  if (type === "WEEKDAY") return "주중";
  if (type === "WEEKEND") return "주말";
  return "기타";
}

function getTeacherLabel(teacher: UserListItemDto) {
  return teacher.name?.trim() || teacher.nickname?.trim() || teacher.email || `교원 #${teacher.id}`;
}

function buildCellFormState(
  subjects: SubjectDetailResponseDto[],
  monthRange: MonthRange,
): ScheduleCellFormState {
  const firstSubject = subjects[0];
  const teacherId = subjects.find((subject) => typeof subject.teacherId === "number")?.teacherId;

  return {
    teacherId: teacherId ? String(teacherId) : "",
    // 과목이 없는 칸은 선택한 달 전체를 기본 기간으로 둔다
    startAt: firstSubject?.startAt ?? monthRange.from,
    endAt: firstSubject?.endAt ?? monthRange.to,
    periods: DISPLAY_PERIODS.map((period) => {
      const subject = getPeriodSubject(subjects, period);
      return {
        period,
        subjectId: getSubjectId(subject),
        name: subject?.name ?? "",
        startTime: subject?.startTime ? subject.startTime.slice(0, 5) : "",
        endTime: subject?.endTime ? subject.endTime.slice(0, 5) : "",
      };
    }),
  };
}

class CellSaveError extends Error {
  constructor(
    message: string,
    readonly createdSubjectIds: Map<number, number>,
  ) {
    super(message);
  }
}

function resolveScheduleMutationError(error: unknown) {
  return extractApiErrorMessage(error, "시간표 항목 저장에 실패했습니다.");
}

type ScheduleTableProps = {
  title: string;
  classrooms: ClassroomListItemDto[];
  subjects: SubjectDetailResponseDto[];
  columns: typeof WEEKDAY_COLUMNS | typeof WEEKEND_COLUMNS;
  monthRange: MonthRange;
  periodColors: PeriodColorMap;
  onSelectCell: (selection: ScheduleCellSelection) => void;
};

function ScheduleTable({
  title,
  classrooms,
  subjects,
  columns,
  monthRange,
  periodColors,
  onSelectCell,
}: ScheduleTableProps) {
  return (
    <TableBlock>
      <ScheduleTitle>{title}</ScheduleTitle>
      <TableScroll>
        <ScheduleGrid $columns={columns.length + 1}>
          <HeaderCell aria-label="분반" />
          {columns.map((column) => (
            <HeaderCell key={column.value}>{column.label}</HeaderCell>
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
                  const cellSubjects = getSubjectsForCell(
                    subjects,
                    classroomId,
                    column.value,
                    monthRange.from,
                    monthRange.to,
                  );
                  const hasRegisteredSubject = cellSubjects.length > 0;
                  const hasTeacher = hasAssignedTeacher(cellSubjects);

                  return (
                    <ScheduleCellButton
                      key={`${classroomId}-${column.value}`}
                      type="button"
                      onClick={() =>
                        onSelectCell({
                          classroom,
                          dayOfWeek: column.value,
                          dayLabel: column.label,
                        })
                      }
                    >
                      {hasRegisteredSubject ? (
                        <TeacherName $assigned={hasTeacher}>
                          {getTeacherName(cellSubjects)}
                        </TeacherName>
                      ) : (
                        <EmptyText>등록된 수업 없음</EmptyText>
                      )}
                      <PeriodList>
                        {DISPLAY_PERIODS.map((period) => {
                          const subject = getPeriodSubject(cellSubjects, period);

                          return (
                            <PeriodItem key={period}>
                              <PeriodBadge>{period}교시</PeriodBadge>
                              <SubjectName
                                $backgroundColor={
                                  subject ? getPeriodColor(periodColors, period) : "#f1f3f2"
                                }
                                $empty={!subject}
                                $period={period}
                              >
                                <SubjectNameText title={subject?.name}>
                                  {formatSubjectName(subject)}
                                </SubjectNameText>
                              </SubjectName>
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

export function AdminLessonScheduleTables() {
  const queryClient = useQueryClient();
  const [monthStart, setMonthStart] = useState(() => dayjs().startOf("month"));
  const monthRange = getLessonMonthRange(monthStart.year(), monthStart.month() + 1);
  const isCurrentMonth = monthStart.isSame(dayjs(), "month");
  const [selectedCell, setSelectedCell] = useState<ScheduleCellSelection | null>(null);
  const selectedCellKey = selectedCell
    ? `${getClassroomId(selectedCell.classroom) ?? "unknown"}-${selectedCell.dayOfWeek}-${monthRange.from}`
    : "none";
  const [cellFormState, setCellFormState] = useState<{
    key: string;
    form: ScheduleCellFormState | null;
  }>({ key: "none", form: null });
  const [formError, setFormError] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [periodColors, setPeriodColors] = useState<PeriodColorMap>(() => readStoredPeriodColors());
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);

  const classroomsQuery = useQuery({
    queryKey: queryKeys.admin.classrooms(),
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
  });

  const subjectsQuery = useQuery({
    queryKey: queryKeys.admin.subjects(),
    queryFn: () => getSubjects(),
  });

  const teachersQuery = useQuery({
    queryKey: queryKeys.admin.activeAssignableTeachers(),
    queryFn: () => getUsers({ page: 0, size: 100 }),
  });

  const classrooms = useMemo(
    () => sortClassrooms(classroomsQuery.data?.content ?? []),
    [classroomsQuery.data?.content],
  );
  const subjects = useMemo(
    () => filterActiveSubjects(Array.isArray(subjectsQuery.data) ? subjectsQuery.data : []),
    [subjectsQuery.data],
  );

  const weekdayClassrooms = classrooms.filter((classroom) => isClassroomType(classroom, "WEEKDAY"));
  const weekendClassrooms = classrooms.filter((classroom) => isClassroomType(classroom, "WEEKEND"));
  const hasClassrooms = weekdayClassrooms.length > 0 || weekendClassrooms.length > 0;
  const teachers = useMemo(
    () => filterAssignableTeachers(teachersQuery.data?.content),
    [teachersQuery.data?.content],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PERIOD_COLOR_STORAGE_KEY, JSON.stringify(periodColors));
  }, [periodColors]);

  // 선택한 칸의 과목은 목록을 다시 불러오면 최신 값으로 바뀐다
  const selectedSubjects = selectedCell
    ? getSubjectsForCell(
        subjects,
        getClassroomId(selectedCell.classroom),
        selectedCell.dayOfWeek,
        monthRange.from,
        monthRange.to,
      )
    : [];
  const cellForm =
    cellFormState.key === selectedCellKey && cellFormState.form
      ? cellFormState.form
      : buildCellFormState(selectedSubjects, monthRange);
  const setCellForm = (updater: SetStateAction<ScheduleCellFormState>) => {
    setCellFormState((current) => {
      const baseForm =
        current.key === selectedCellKey && current.form
          ? current.form
          : buildCellFormState(selectedSubjects, monthRange);
      return {
        key: selectedCellKey,
        form: typeof updater === "function" ? updater(baseForm) : updater,
      };
    });
  };
  const discardCellForm = () => setCellFormState({ key: "none", form: null });

  const closeModal = () => {
    setSelectedCell(null);
    setFormError(null);
    setIsResetConfirmOpen(false);
    discardCellForm();
  };

  const resetCellMutation = useMutation({
    mutationFn: async () => {
      const subjectIds = cellForm.periods
        .map((periodForm) => periodForm.subjectId)
        .filter((subjectId): subjectId is number => typeof subjectId === "number" && subjectId > 0);

      if (subjectIds.length === 0) {
        throw new Error("초기화할 시간표 항목이 없습니다.");
      }

      const failedSubjectIds: number[] = [];

      for (const subjectId of subjectIds) {
        try {
          await deleteSubject({ subjectId });
        } catch {
          failedSubjectIds.push(subjectId);
        }
      }

      if (failedSubjectIds.length > 0) {
        throw new Error("일부 시간표 항목만 초기화되었습니다. 다시 한 번 시도해 주세요.");
      }
    },
    onSuccess: async () => {
      toast.success("시간표 항목을 초기화했습니다.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
      closeModal();
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
      setIsResetConfirmOpen(false);
      discardCellForm();
      setFormError(resolveScheduleMutationError(error));
    },
  });

  const saveCellMutation = useMutation({
    mutationFn: async () => {
      const classroomId = selectedCell ? getClassroomId(selectedCell.classroom) : null;
      if (!selectedCell || classroomId == null) throw new Error("분반을 선택해 주세요.");
      if (!cellForm.startAt) throw new Error("시작일을 선택해 주세요.");
      if (!cellForm.endAt) throw new Error("종료일을 선택해 주세요.");
      if (cellForm.startAt.localeCompare(cellForm.endAt) > 0) {
        throw new Error("시작일은 종료일보다 늦을 수 없습니다.");
      }

      const parsedTeacherId = cellForm.teacherId ? Number(cellForm.teacherId) : null;
      if (parsedTeacherId != null && (!Number.isInteger(parsedTeacherId) || parsedTeacherId <= 0)) {
        throw new Error("담당 교사를 다시 선택해 주세요.");
      }
      const teacherId = parsedTeacherId;

      for (const periodForm of cellForm.periods) {
        const name = periodForm.name.trim();
        if (!name && periodForm.subjectId != null) {
          throw new Error("기존 항목의 과목명은 비울 수 없습니다.");
        }
        if (!name) continue;
        if (!periodForm.startTime || !periodForm.endTime) {
          throw new Error(`${periodForm.period}교시 시간을 입력해 주세요.`);
        }
        if (periodForm.startTime >= periodForm.endTime) {
          throw new Error(`${periodForm.period}교시 종료 시간은 시작 시간보다 늦어야 합니다.`);
        }
      }

      // 교시마다 순서대로 저장한다. 실패하면 앞 교시는 이미 반영돼 있으므로 어디까지 저장됐는지 알린다.
      const savedPeriods: number[] = [];
      const createdSubjectIds = new Map<number, number>();
      for (const periodForm of cellForm.periods) {
        const original = selectedSubjects.find(
          (subject) => getSubjectId(subject) === periodForm.subjectId,
        );
        const steps = getPeriodSaveSteps(periodForm.subjectId == null ? undefined : original, {
          name: periodForm.name,
          teacherId,
          startAt: cellForm.startAt,
          endAt: cellForm.endAt,
          startTime: periodForm.startTime,
          endTime: periodForm.endTime,
        });
        if (steps.length === 0) continue;

        const name = periodForm.name.trim();
        const schedulePayload = {
          startAt: cellForm.startAt,
          endAt: cellForm.endAt,
          dayOfWeek: selectedCell.dayOfWeek,
          startTime: normalizeLessonTimeForApi(periodForm.startTime),
          endTime: normalizeLessonTimeForApi(periodForm.endTime),
          period: periodForm.period,
        };

        try {
          if (periodForm.subjectId == null) {
            const created = await createSubject({
              classroomId,
              teacherId,
              name,
              ...schedulePayload,
            });
            if (typeof created.id === "number")
              createdSubjectIds.set(periodForm.period, created.id);
          } else {
            const subjectId = periodForm.subjectId;
            if (steps.includes("name")) await updateSubject({ subjectId }, { name });
            if (steps.includes("schedule")) {
              await updateSubjectSchedule({ subjectId }, schedulePayload);
            }
            if (steps.includes("teacher")) await assignSubjectTeacher({ subjectId }, { teacherId });
          }
        } catch (error) {
          throw new CellSaveError(
            formatCellSaveError(
              savedPeriods,
              periodForm.period,
              resolveScheduleMutationError(error),
            ),
            createdSubjectIds,
          );
        }
        savedPeriods.push(periodForm.period);
      }
    },
    onSuccess: async () => {
      toast.success("시간표 항목을 저장했습니다.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
      closeModal();
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
      // 앞 교시에서 새로 만든 과목은 폼에 id를 채워 다시 저장할 때 중복 생성하지 않는다.
      // 수정된 교시는 다시 불러온 서버 값과 비교해 남은 변경만 보낸다.
      if (error instanceof CellSaveError && error.createdSubjectIds.size > 0) {
        setCellForm((current) => ({
          ...current,
          periods: current.periods.map((periodForm) => ({
            ...periodForm,
            subjectId: error.createdSubjectIds.get(periodForm.period) ?? periodForm.subjectId,
          })),
        }));
      }
      setFormError(resolveScheduleMutationError(error));
    },
  });

  const isMutating = saveCellMutation.isPending || resetCellMutation.isPending;
  const requestCloseModal = () => {
    if (!isMutating) closeModal();
  };

  useEffect(() => {
    if (!selectedCell && !isColorSettingsOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isResetConfirmOpen) {
        if (!resetCellMutation.isPending) setIsResetConfirmOpen(false);
      } else if (selectedCell) {
        if (!isMutating) closeModal();
      } else {
        setIsColorSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSaveCell = () => {
    setFormError(null);
    saveCellMutation.mutate();
  };
  const resettableSubjects = selectedSubjects.filter((subject) =>
    cellForm.periods.some((periodForm) => periodForm.subjectId === getSubjectId(subject)),
  );
  const hasResettableSubjects = resettableSubjects.length > 0;
  const originalPeriod = selectedSubjects[0];
  const isPeriodChanged =
    originalPeriod != null &&
    (cellForm.startAt !== originalPeriod.startAt || cellForm.endAt !== originalPeriod.endAt);
  const moveMonth = (offset: number) => setMonthStart((current) => current.add(offset, "month"));

  return (
    <SectionCard>
      <ScheduleHeaderRow>
        <SectionTitle>시간표</SectionTitle>
        <MonthNav aria-label="시간표 기준 월">
          <IconButton type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>
            <IconChevronLeft aria-hidden="true" />
          </IconButton>
          <MonthLabel aria-live="polite">{monthStart.format("YYYY년 M월")}</MonthLabel>
          <IconButton type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>
            <IconChevronRight aria-hidden="true" />
          </IconButton>
          <SmallButton
            type="button"
            disabled={isCurrentMonth}
            onClick={() => setMonthStart(dayjs().startOf("month"))}
          >
            이번 달
          </SmallButton>
        </MonthNav>
        <SettingsButton
          type="button"
          aria-label="교시별 색상 설정"
          onClick={() => setIsColorSettingsOpen(true)}
        >
          <IconSettings aria-hidden="true" />
        </SettingsButton>
      </ScheduleHeaderRow>
      <ScheduleContentArea>
        <DataState
          isLoading={classroomsQuery.isLoading || subjectsQuery.isLoading}
          isError={classroomsQuery.isError || subjectsQuery.isError}
          isEmpty={!hasClassrooms}
          loadingLabel="시간표 불러오는 중"
          errorLabel="시간표를 불러오지 못했습니다."
          emptyLabel="주중 또는 주말 분반이 없습니다."
        >
          <ScheduleStack>
            <ScheduleTable
              title="주중 시간표"
              classrooms={weekdayClassrooms}
              subjects={subjects}
              columns={WEEKDAY_COLUMNS}
              monthRange={monthRange}
              periodColors={periodColors}
              onSelectCell={setSelectedCell}
            />
            <ScheduleTable
              title="주말 시간표"
              classrooms={weekendClassrooms}
              subjects={subjects}
              columns={WEEKEND_COLUMNS}
              monthRange={monthRange}
              periodColors={periodColors}
              onSelectCell={setSelectedCell}
            />
          </ScheduleStack>
        </DataState>
      </ScheduleContentArea>

      {selectedCell ? (
        <ModalBackdrop onMouseDown={requestCloseModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-cell-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <div>
                <ModalTitle id="schedule-cell-modal-title">
                  {selectedCell.classroom.name ?? "분반"} {selectedCell.dayLabel}요일 시간표
                </ModalTitle>
                <ModalDescription>
                  {monthStart.format("YYYY년 M월")}에 걸친 과목을 편집합니다. 담당 교사와 기간은
                  1~3교시에 동일하게 적용됩니다.
                </ModalDescription>
              </div>
              <ButtonRow>
                <DangerButton
                  type="button"
                  disabled={!hasResettableSubjects || isMutating}
                  onClick={() => {
                    setFormError(null);
                    setIsResetConfirmOpen(true);
                  }}
                >
                  초기화
                </DangerButton>
              </ButtonRow>
            </ModalHeader>

            <ModalBody>
              <Label>
                담당 교사
                <ScheduleSelect
                  value={cellForm.teacherId}
                  disabled={teachersQuery.isLoading || saveCellMutation.isPending}
                  onChange={(event) =>
                    setCellForm((current) => ({ ...current, teacherId: event.target.value }))
                  }
                >
                  <option value="">
                    {teachersQuery.isLoading ? "교사 목록 불러오는 중..." : "담당 교사 미배정"}
                  </option>
                  {teachers.map((teacher) =>
                    typeof teacher.id === "number" ? (
                      <option key={teacher.id} value={teacher.id}>
                        {getTeacherLabel(teacher)}
                      </option>
                    ) : null,
                  )}
                </ScheduleSelect>
              </Label>

              <DateFields>
                <Label>
                  시작일
                  <TextInput
                    type="date"
                    value={cellForm.startAt}
                    max={cellForm.endAt || undefined}
                    disabled={saveCellMutation.isPending}
                    onChange={(event) =>
                      setCellForm((current) => ({ ...current, startAt: event.target.value }))
                    }
                  />
                </Label>
                <Label>
                  종료일
                  <TextInput
                    type="date"
                    value={cellForm.endAt}
                    min={cellForm.startAt || undefined}
                    disabled={saveCellMutation.isPending}
                    onChange={(event) =>
                      setCellForm((current) => ({ ...current, endAt: event.target.value }))
                    }
                  />
                </Label>
              </DateFields>
              {isPeriodChanged ? (
                <PeriodChangeNotice role="note">
                  기간을 바꾸면 기존 기간({originalPeriod.startAt} ~ {originalPeriod.endAt})의 남은
                  수업이 지워지고 새 기간으로 다시 만들어집니다. 오늘 수업이 이미 시작됐다면
                  내일부터 반영됩니다. 다음 달 시간표는 기간을 바꾸지 말고 새로 등록하세요.
                </PeriodChangeNotice>
              ) : null}

              <PeriodEditorList>
                {cellForm.periods.map((periodForm, index) => (
                  <PeriodEditor key={periodForm.period}>
                    <PeriodEditorTitle>{periodForm.period}교시</PeriodEditorTitle>
                    <Label>
                      과목명
                      <TextInput
                        value={periodForm.name}
                        placeholder="과목명을 입력하면 항목이 저장됩니다."
                        disabled={saveCellMutation.isPending}
                        onChange={(event) =>
                          setCellForm((current) => ({
                            ...current,
                            periods: current.periods.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </Label>
                    <TimeFields>
                      <Label>
                        시작 시간
                        <TextInput
                          type="time"
                          step={300}
                          value={periodForm.startTime}
                          disabled={saveCellMutation.isPending}
                          onChange={(event) =>
                            setCellForm((current) => ({
                              ...current,
                              periods: current.periods.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, startTime: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </Label>
                      <Label>
                        종료 시간
                        <TextInput
                          type="time"
                          step={300}
                          value={periodForm.endTime}
                          disabled={saveCellMutation.isPending}
                          onChange={(event) =>
                            setCellForm((current) => ({
                              ...current,
                              periods: current.periods.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, endTime: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </Label>
                    </TimeFields>
                  </PeriodEditor>
                ))}
              </PeriodEditorList>
            </ModalBody>

            {formError ? <InlineStatus role="alert">{formError}</InlineStatus> : null}

            {teachersQuery.isError ? (
              <InlineStatus role="alert">교사 목록을 불러오지 못했습니다.</InlineStatus>
            ) : null}

            <ModalActions>
              <ButtonRow>
                <SmallButton type="button" disabled={isMutating} onClick={closeModal}>
                  취소
                </SmallButton>
                <LessonActionButton type="button" disabled={isMutating} onClick={handleSaveCell}>
                  {saveCellMutation.isPending ? "저장 중..." : "저장"}
                </LessonActionButton>
              </ButtonRow>
            </ModalActions>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      <AdminLessonDeleteConfirmModal
        open={isResetConfirmOpen}
        title="시간표 칸 초기화"
        message={`${selectedCell?.classroom.name ?? "분반"} ${selectedCell?.dayLabel ?? ""}요일 과목 ${resettableSubjects.length}개(${resettableSubjects
          .map(
            (subject) =>
              `${subject.period}교시 ${subject.name ?? ""} ${subject.startAt ?? ""}~${subject.endAt ?? ""}`,
          )
          .join(", ")})를 삭제합니다. 과목 기간 전체가 삭제되며 되돌릴 수 없습니다.`}
        isPending={resetCellMutation.isPending}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={() => resetCellMutation.mutate()}
      />

      {isColorSettingsOpen ? (
        <ModalBackdrop onMouseDown={() => setIsColorSettingsOpen(false)}>
          <ColorModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-color-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <div>
                <ModalTitle id="period-color-modal-title">교시별 색상 설정</ModalTitle>
                <ModalDescription>설정한 색상은 시간표 과목 배지에 적용됩니다.</ModalDescription>
              </div>
              <SmallButton type="button" onClick={() => setIsColorSettingsOpen(false)}>
                닫기
              </SmallButton>
            </ModalHeader>
            <ColorSettingsList>
              {DISPLAY_PERIODS.map((period) => (
                <ColorSettingRow key={period}>
                  <ColorSettingLabel>
                    <LegendSwatch $color={periodColors[period]} />
                    {period}교시
                  </ColorSettingLabel>
                  <ColorInput
                    type="color"
                    value={periodColors[period]}
                    aria-label={`${period}교시 색상`}
                    onChange={(event) =>
                      setPeriodColors((current) => ({
                        ...current,
                        [period]: event.target.value,
                      }))
                    }
                  />
                </ColorSettingRow>
              ))}
            </ColorSettingsList>
            <ModalActions>
              <ButtonRow>
                <SmallButton type="button" onClick={() => setPeriodColors(DEFAULT_PERIOD_COLORS)}>
                  기본값
                </SmallButton>
                <LessonActionButton type="button" onClick={() => setIsColorSettingsOpen(false)}>
                  적용
                </LessonActionButton>
              </ButtonRow>
            </ModalActions>
          </ColorModalDialog>
        </ModalBackdrop>
      ) : null}
    </SectionCard>
  );
}

const ScheduleStack = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: flex-start;
  gap: ${spacing.space20};
  overflow-x: auto;
`;

const ScheduleContentArea = styled.div`
  min-width: 0;
  overflow: hidden;
`;

const ScheduleHeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacing.space12};
  margin-top: 0.4rem;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space4};
`;

const MonthLabel = styled.span`
  min-width: 6.5rem;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  text-align: center;
`;

const LegendSwatch = styled.span<{ $color: string }>`
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid ${({ $color }) => $color};
  border-radius: ${radii.radius999};
  background-color: ${({ $color }) => $color};
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: ${radii.radius999};
  background-color: transparent;
  color: #64706c;
  cursor: pointer;
  line-height: 0;

  svg {
    display: block;
    width: 1.125rem;
    height: 1.125rem;
  }

  &:hover {
    background-color: #f6f8f7;
    color: #1f2b28;
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }
`;

const SettingsButton = styled(IconButton)`
  margin-left: auto;
`;

const PeriodChangeNotice = styled.p`
  margin: 0;
  padding: ${spacing.space8} ${spacing.space12};
  border-radius: 0.375rem;
  background-color: ${colors.noticeSoft};
  color: #9d2e28;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
`;

const TableBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
  flex: 0 0 auto;
`;

const ScheduleTitle = styled.h3`
  margin: 0;
  color: #1f2b28;
  font-size: ${typography.fontSize16};
  font-weight: 900;
  line-height: 1.25rem;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const TableScroll = styled.div`
  overflow-x: visible;
`;

const ScheduleGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 8.5rem repeat(${({ $columns }) => $columns - 1}, 10rem);
  width: max-content;
  max-width: none;
  border: 1px solid ${colors.borderStrong};
  border-radius: 0.25rem;
  overflow: hidden;

  @media (min-width: 120rem) {
    grid-template-columns: 10rem repeat(${({ $columns }) => $columns - 1}, 12rem);
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 8rem repeat(${({ $columns }) => $columns - 1}, 9.25rem);
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding: ${spacing.space12};
  background-color: ${colors.pointSoft};
  color: #111;
  font-size: ${typography.fontSize14};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
  border-top: 0;

  &:first-child {
    border-left: 0;
  }

  @media (min-width: 120rem) {
    min-height: 5.5rem;
    font-size: ${typography.fontSize18};
  }
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
  border-left: 0;

  @media (min-width: 120rem) {
    min-height: 8.75rem;
  }
`;

const ClassroomName = styled.span`
  color: #111;
  font-size: ${typography.fontSize14};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
  word-break: keep-all;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const ClassroomType = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const ScheduleCellButton = styled.button`
  display: grid;
  align-content: start;
  gap: ${spacing.space4};
  min-height: 7rem;
  padding: ${spacing.space8} ${spacing.space12};
  border: 0;
  border-top: 1px solid ${colors.borderStrong};
  border-left: 1px solid ${colors.borderStrong};
  background-color: ${colors.white};
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: #f3f8ef;
  }

  &:focus-visible {
    background-color: #f3f8ef;
    box-shadow: inset 0 0 0 1px ${colors.point};
    outline: none;
  }

  &:active {
    background-color: #f6f8f7;
  }

  @media (min-width: 120rem) {
    min-height: 8.75rem;
    padding: ${spacing.space12} ${spacing.space16};
  }
`;

const TeacherName = styled.p<{ $assigned: boolean }>`
  margin: 0;
  color: ${({ $assigned }) => ($assigned ? "#111" : colors.muted)};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $assigned }) => ($assigned ? 900 : 700)};
  line-height: ${typography.lineHeight130};
  text-align: center;
  word-break: keep-all;
`;

const EmptyText = styled.p`
  margin: 0;
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;
`;

const PeriodList = styled.div`
  display: grid;
  gap: 0.125rem;
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

const SubjectName = styled.span<{
  $backgroundColor: string;
  $empty: boolean;
  $period: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  box-sizing: border-box;
  width: 6rem;
  height: 1.25rem;
  padding: 0 ${spacing.space8};
  border-radius: ${radii.radius999};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  color: ${({ $empty, $period }) =>
    $empty ? "#7c8581" : (PERIOD_COLOR_TEXT[$period as PeriodNumber] ?? "#1f2b28")};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;

  @media (min-width: 120rem) {
    width: 7.2rem;
    height: 1.4rem;
  }
`;

const SubjectNameText = styled.span`
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgb(0 0 0 / 42%);
`;

const ModalDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 44rem);
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
  gap: ${spacing.space16};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #050505;
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

const ModalBody = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ScheduleSelect = styled.select`
  width: 100%;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 ${spacing.space12};
  background-color: ${colors.white};
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  appearance: none;
  outline: none;

  &:focus {
    border-color: ${colors.point};
  }

  &:disabled {
    opacity: 1;
    color: #64706c;
    background-color: ${colors.white};
  }
`;

const DateFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const PeriodEditorList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const PeriodEditor = styled.div`
  display: grid;
  gap: ${spacing.space8};
  padding: ${spacing.space12};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};
  background-color: #fbfcfb;
`;

const PeriodEditorTitle = styled.h4`
  margin: 0;
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  font-weight: 900;
  line-height: ${typography.lineHeight130};
`;

const TimeFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const LessonActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
  ({ type }) => ({
    type: type ?? "button",
  }),
)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  border: 1px solid ${colors.point};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  padding: 0 ${spacing.space16};
  color: ${colors.point};
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ColorModalDialog = styled(ModalDialog)`
  width: min(100%, 25rem);
`;

const ColorSettingsList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ColorSettingRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  font-weight: 800;
`;

const ColorSettingLabel = styled.span`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
`;

const ColorInput = styled.input`
  width: 3.5rem;
  height: 2rem;
  padding: 0;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  cursor: pointer;
`;
