"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import { IconSettings } from "@tabler/icons-react";
import { getClassrooms } from "@/api/classroom/classroom.api";
import type { ClassroomListItemDto, ClassroomType } from "@/api/classroom/classroom.dto";
import {
  assignSubjectTeacher,
  createSubject,
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
  InlineStatus,
  Label,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionTitle,
  Select,
  SmallButton,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { normalizeLessonTimeForApi } from "@/components/admin/lesson-management/lessonCreateError";
import {
  filterActiveSubjects,
  formatSubjectTeacherName,
} from "@/components/admin/subjects/shared/subjectDisplay";
import { queryKeys } from "@/lib/queryKeys";
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
  { value: "SUNDAY", label: "일" },
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
  subjects: SubjectDetailResponseDto[];
};

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

function getSubjectsForCell(
  subjects: SubjectDetailResponseDto[],
  classroomId: number | null,
  dayOfWeek: SubjectDayOfWeek,
) {
  if (classroomId == null) return [];

  return subjects
    .filter((subject) => subject.classroomId === classroomId && subject.dayOfWeek === dayOfWeek)
    .sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
}

function getPeriodSubject(subjects: SubjectDetailResponseDto[], period: number) {
  return subjects.find((subject) => subject.period === period);
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

function buildCellFormState(selection: ScheduleCellSelection | null): ScheduleCellFormState {
  const subjects = selection?.subjects ?? [];
  const firstSubject = subjects[0];
  const teacherId = subjects.find((subject) => typeof subject.teacherId === "number")?.teacherId;

  return {
    teacherId: teacherId ? String(teacherId) : "",
    startAt: firstSubject?.startAt ?? "",
    endAt: firstSubject?.endAt ?? "",
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

function resolveScheduleMutationError(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "시간표 항목 저장에 실패했습니다.";
}

type ScheduleTableProps = {
  title: string;
  classrooms: ClassroomListItemDto[];
  subjects: SubjectDetailResponseDto[];
  columns: typeof WEEKDAY_COLUMNS | typeof WEEKEND_COLUMNS;
  periodColors: PeriodColorMap;
  onSelectCell: (selection: ScheduleCellSelection) => void;
};

function ScheduleTable({
  title,
  classrooms,
  subjects,
  columns,
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
                  const cellSubjects = getSubjectsForCell(subjects, classroomId, column.value);
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
                          subjects: cellSubjects,
                        })
                      }
                    >
                      {hasRegisteredSubject ? (
                        <TeacherName $assigned={hasTeacher}>
                          {getTeacherName(cellSubjects)}
                        </TeacherName>
                      ) : (
                        <EmptyText>담당 교사 미배정</EmptyText>
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
                                <SubjectNameText>{formatSubjectName(subject)}</SubjectNameText>
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
  const [selectedCell, setSelectedCell] = useState<ScheduleCellSelection | null>(null);
  const [cellForm, setCellForm] = useState<ScheduleCellFormState>(() => buildCellFormState(null));
  const [formError, setFormError] = useState<string | null>(null);
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
    queryKey: queryKeys.admin.activeVolunteerTeachers(),
    queryFn: () => getUsers({ role: "VOLUNTEER", page: 0, size: 100 }),
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
  const teachers = teachersQuery.data?.content ?? [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PERIOD_COLOR_STORAGE_KEY, JSON.stringify(periodColors));
  }, [periodColors]);

  useEffect(() => {
    setCellForm(buildCellFormState(selectedCell));
    setFormError(null);
  }, [selectedCell]);

  const closeModal = () => {
    setSelectedCell(null);
    setFormError(null);
  };

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

      await Promise.all(
        cellForm.periods.map(async (periodForm) => {
          const name = periodForm.name.trim();
          if (!name && periodForm.subjectId != null) {
            throw new Error("기존 항목의 과목명은 비울 수 없습니다.");
          }
          if (!name) return null;
          if (!periodForm.startTime || !periodForm.endTime) {
            throw new Error(`${periodForm.period}교시 시간을 입력해 주세요.`);
          }

          const schedulePayload = {
            startAt: cellForm.startAt,
            endAt: cellForm.endAt,
            dayOfWeek: selectedCell.dayOfWeek,
            startTime: normalizeLessonTimeForApi(periodForm.startTime),
            endTime: normalizeLessonTimeForApi(periodForm.endTime),
            period: periodForm.period,
          };

          if (periodForm.subjectId == null) {
            return createSubject({
              classroomId,
              teacherId,
              name,
              ...schedulePayload,
            });
          }

          await updateSubject({ subjectId: periodForm.subjectId }, { name });
          await updateSubjectSchedule({ subjectId: periodForm.subjectId }, schedulePayload);
          await assignSubjectTeacher({ subjectId: periodForm.subjectId }, { teacherId });
          return null;
        }),
      );
    },
    onSuccess: async () => {
      toast.success("시간표 항목을 저장했습니다.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
      closeModal();
    },
    onError: (error) => {
      setFormError(resolveScheduleMutationError(error));
    },
  });

  const handleSaveCell = () => {
    setFormError(null);
    saveCellMutation.mutate();
  };

  return (
    <SectionCard>
      <ScheduleHeaderRow>
        <div>
          <SectionTitle>시간표</SectionTitle>
        </div>
        <IconButton
          type="button"
          aria-label="교시별 색상 설정"
          onClick={() => setIsColorSettingsOpen(true)}
        >
          <IconSettings aria-hidden="true" />
        </IconButton>
      </ScheduleHeaderRow>
      <SectionDescription>
        분반 목록을 기준으로 주중/주말 시간표 행을 구성하고, 각 칸에는 1~3교시 과목과 담당 교사를
        표시합니다.
      </SectionDescription>
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
            periodColors={periodColors}
            onSelectCell={setSelectedCell}
          />
          <ScheduleTable
            title="주말 시간표"
            classrooms={weekendClassrooms}
            subjects={subjects}
            columns={WEEKEND_COLUMNS}
            periodColors={periodColors}
            onSelectCell={setSelectedCell}
          />
        </ScheduleStack>
      </DataState>

      {selectedCell ? (
        <ModalBackdrop onMouseDown={closeModal}>
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
                  담당 교사는 한 칸의 1~3교시에 동일하게 적용됩니다.
                </ModalDescription>
              </div>
              <SmallButton type="button" onClick={closeModal}>
                닫기
              </SmallButton>
            </ModalHeader>

            <ModalBody>
              <Label>
                담당 교사
                <Select
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
                </Select>
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
                <PrimaryButton
                  type="button"
                  disabled={saveCellMutation.isPending}
                  onClick={handleSaveCell}
                >
                  {saveCellMutation.isPending ? "저장 중..." : "저장"}
                </PrimaryButton>
                <SmallButton
                  type="button"
                  disabled={saveCellMutation.isPending}
                  onClick={closeModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </ModalActions>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

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
                <PrimaryButton type="button" onClick={() => setIsColorSettingsOpen(false)}>
                  적용
                </PrimaryButton>
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
  align-items: flex-start;
  gap: ${spacing.space20};
  overflow-x: auto;
`;

const ScheduleHeaderRow = styled.div`
  position: relative;
  min-height: 1.875rem;
  padding-right: 5.5rem;

  ${SectionTitle} {
    margin-bottom: 0;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding-right: 0;
    padding-bottom: 4.75rem;
  }
`;

const PeriodLegend = styled.div`
  position: absolute;
  top: -0.125rem;
  right: 2rem;
  display: grid;
  align-items: start;
  justify-items: end;
  gap: ${spacing.space8};

  @media (max-width: ${layout.breakpointMobile}) {
    top: 2.25rem;
    left: 0;
    right: auto;
    justify-items: start;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space4};
`;

const LegendSwatch = styled.span<{ $color: string }>`
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid ${({ $color }) => $color};
  border-radius: ${radii.radius999};
  background-color: ${({ $color }) => $color};
`;

const LegendText = styled.span`
  color: #1f2b28;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;

const IconButton = styled.button`
  position: absolute;
  top: -0.375rem;
  right: -0.375rem;
  display: inline-block;
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: ${radii.radius999};
  background-color: transparent;
  color: #64706c;
  cursor: pointer;

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover,
  &:focus-visible {
    background-color: #f6f8f7;
    color: #1f2b28;
    outline: none;
  }
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
    font-size: ${typography.fontSize20};
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
  border-right: 1px solid ${colors.borderStrong};
  border-bottom: 1px solid ${colors.borderStrong};
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
