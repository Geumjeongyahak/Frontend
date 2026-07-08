"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import type {
  DailyScheduleLessonResponseDto,
  DailyStudentAttendanceStatus,
  LessonJournalRequestDto,
  UpdateDailyStudentAttendanceItemRequestDto,
} from "@/api/dailySchedule/dailySchedule.dto";
import {
  createJournal,
  getDailyScheduleDetailIfExists,
  updateStudentAttendances,
} from "@/api/dailySchedule/dailySchedule.api";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import { getMyLessons } from "@/api/lesson/lesson.api";
import type { StudentListResponseDto } from "@/api/student/student.dto";
import { getStudents } from "@/api/student/student.api";
import { getMyAssignedSubjects } from "@/api/subject/subject.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import { formatPhone } from "@/utils/formatPhone";
import { getKstTodayIsoDate, parseKoreanShortDateToIsoDate } from "@/utils/kstShortDate";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

function autoResizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;

  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}
import {
  dailyStudentAttendanceOptions,
  getDailyStudentAttendanceStatusOrDefault,
} from "@/utils/dailyStudentAttendance";
import {
  buildTodayLessonOptions,
  buildTodayLessonOptionsFromSubjects,
  formatLessonRange,
} from "./classJournalCreateState";

const lessonPeriods = [1, 2, 3] as const;
const attendanceColumns = Array.from({ length: 10 }, (_, index) => index);

function buildAttendanceNameKey(rowIndex: number, column: number) {
  return `${rowIndex}-${column}`;
}

function resolveClassroomName(
  classroomId: number,
  students: StudentListResponseDto,
  detailClassroomName?: string,
) {
  if (detailClassroomName?.trim()) return detailClassroomName;

  const fromStudents = students
    .flatMap((student) => student.classrooms ?? [])
    .find((classroom) => classroom.id === classroomId)?.name;

  return fromStudents?.trim() ? fromStudents : "";
}

function buildStudentAttendances(
  formData: FormData,
  students: StudentListResponseDto,
): UpdateDailyStudentAttendanceItemRequestDto[] {
  return students.flatMap((student, index) => {
    if (typeof student.id !== "number") return [];

    const rowIndex = Math.floor(index / attendanceColumns.length);
    const column = index % attendanceColumns.length;
    const statusIndex = rowIndex * attendanceColumns.length + column + 1;
    const status = getDailyStudentAttendanceStatusOrDefault(
      formData.get(`attendanceStatus${statusIndex}`)?.toString() as
        | DailyStudentAttendanceStatus
        | undefined,
    );

    return [
      {
        studentId: student.id,
        status,
      },
    ];
  });
}

function buildLessonJournals(
  lessons: Array<
    Pick<DailyScheduleLessonResponseDto, "lessonId" | "period"> |
    Pick<LessonSummaryResponseDto, "lessonId" | "period">
  > | undefined,
  formData: FormData,
): LessonJournalRequestDto[] {
  const orderedLessons = [...(lessons ?? [])]
    .map((lesson, index) => ({ lesson, index }))
    .sort((a, b) => {
      const periodA = a.lesson.period;
      const periodB = b.lesson.period;
      if (typeof periodA === "number" && typeof periodB === "number") return periodA - periodB;
      return a.index - b.index;
    })
    .map(({ lesson }) => lesson);

  return lessonPeriods.flatMap((period, index) => {
    const note = String(formData.get(`lesson${period}`) ?? "").trim();
    const lesson = orderedLessons.find((item) => item.period === period) ?? orderedLessons[index];
    const lessonId = lesson?.lessonId;

    if (typeof lessonId !== "number" || !note) return [];
    return [{ lessonId, note }];
  });
}

export default function ClassJournalCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const todayIsoDate = useMemo(() => getKstTodayIsoDate(), []);
  const [attendanceNameOverrides, setAttendanceNameOverrides] = useState<Record<string, string>>({});
  const [additionalAttendanceRows, setAdditionalAttendanceRows] = useState(0);
  const { status: authStatus, user: currentUser } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const currentUserId = currentUser?.id ?? null;

  const myTodayLessonsQuery = useQuery({
    queryKey: ["lessons", "me", currentUserId, "today", todayIsoDate] as const,
    queryFn: () => getMyLessons({ from: todayIsoDate, to: todayIsoDate }),
    enabled: isAuthenticated,
    retry: false,
    refetchOnMount: "always",
  });

  const myAssignedSubjectsQuery = useQuery({
    queryKey: ["subjects", "me", currentUserId, "today", todayIsoDate] as const,
    queryFn: getMyAssignedSubjects,
    enabled: isAuthenticated,
    retry: false,
    refetchOnMount: "always",
  });

  const lessonBackedOptions = useMemo(
    () => buildTodayLessonOptions(myTodayLessonsQuery.data ?? []),
    [myTodayLessonsQuery.data],
  );
  const subjectBackedOptions = useMemo(
    () => buildTodayLessonOptionsFromSubjects(myAssignedSubjectsQuery.data ?? [], todayIsoDate),
    [myAssignedSubjectsQuery.data, todayIsoDate],
  );
  const todayLessonOptions = lessonBackedOptions.length > 0 ? lessonBackedOptions : subjectBackedOptions;
  const hasTodayLessons = todayLessonOptions.length > 0;
  const showNoClassNotice =
    myTodayLessonsQuery.isFetched && myAssignedSubjectsQuery.isFetched && !hasTodayLessons;

  const selectedTodayLesson = useMemo(() => {
    if (!todayLessonOptions.length) return null;
    return todayLessonOptions[0];
  }, [todayLessonOptions]);

  const enrollmentClassroomId = selectedTodayLesson?.classroomId ?? 0;

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.list({
      classroomId: enrollmentClassroomId,
    }),
    queryFn: () =>
      getStudents({
        classroomId: enrollmentClassroomId as number,
      }),
    enabled: enrollmentClassroomId > 0,
    retry: false,
  });

  const enrolledStudents = useMemo(() => {
    const students = studentsQuery.data ?? [];
    return students.filter((student) =>
      student.classrooms?.some((classroom) => classroom.id === enrollmentClassroomId),
    );
  }, [studentsQuery.data, enrollmentClassroomId]);

  const dailyScheduleDetailQuery = useQuery({
    queryKey: ["daily-schedules", "detail", enrollmentClassroomId, todayIsoDate] as const,
    queryFn: () =>
      getDailyScheduleDetailIfExists({
        classroomId: enrollmentClassroomId,
        lessonDate: todayIsoDate,
      }),
    enabled: enrollmentClassroomId > 0,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      journalBody,
      attendances,
    }: {
      journalBody: Parameters<typeof createJournal>[0];
      attendances: UpdateDailyStudentAttendanceItemRequestDto[];
    }) => {
      const journal = await createJournal(journalBody);
      const dailyScheduleId = journal.dailyScheduleId;

      return typeof dailyScheduleId === "number" && attendances.length > 0
        ? await updateStudentAttendances({ dailyScheduleId }, { attendances })
        : journal;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["daily-schedules", "list"] });
      queryClient.setQueryData(["daily-schedules", "detail", data.dailyScheduleId], data);

      toast.success("수업 일지가 등록되었습니다.");
      if (data.dailyScheduleId) {
        router.push(`/staff/class-management/class-journal/${data.dailyScheduleId}`);
        return;
      }
      router.push("/staff/class-management/class-journal");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "수업 일지 등록에 실패했습니다."));
    },
  });

  const isSubmitting = submitMutation.isPending;
  const scheduleDetail = dailyScheduleDetailQuery.data;
  const writerName = currentUser?.name ?? "";
  const birthPrefix = currentUser?.residentRegistrationNumberPrefix ?? "";
  const phoneNumber = currentUser?.phoneNumber ?? "";
  const hasExistingJournal = Boolean(
    scheduleDetail?.lessons?.some((lesson) => lesson.note?.trim()),
  );
  const hasCompletedAttendance =
    scheduleDetail?.teacherAttendance?.status === "PRESENT" ||
    scheduleDetail?.teacherAttendanceStatus === "PRESENT";
  const isAttendanceBlocked = hasTodayLessons && !hasCompletedAttendance;
  const isJournalAlreadyWrittenBlocked = hasTodayLessons && hasExistingJournal;

  const resolvedLessonDate = useMemo(() => {
    if (scheduleDetail?.lessonDate) {
      return formatUtcToKstShortDate(`${scheduleDetail.lessonDate}T00:00:00`);
    }
    if (selectedTodayLesson?.lessonDate) {
      return formatUtcToKstShortDate(`${selectedTodayLesson.lessonDate}T00:00:00`);
    }
    return "";
  }, [scheduleDetail?.lessonDate, selectedTodayLesson?.lessonDate]);

  const resolvedActivityTime = useMemo(
    () => formatLessonRange(scheduleDetail?.lessons ?? []) || selectedTodayLesson?.activityTime || "",
    [scheduleDetail?.lessons, selectedTodayLesson?.activityTime],
  );
  const journalSourceLessons = (
    scheduleDetail?.lessons?.length ? scheduleDetail.lessons : myTodayLessonsQuery.data ?? []
  ).filter((lesson) => typeof lesson.lessonId === "number");

  const resolvedClassroomName = useMemo(
    () =>
      resolveClassroomName(
        enrollmentClassroomId,
        enrolledStudents,
        scheduleDetail?.classroomName,
      ),
    [enrollmentClassroomId, enrolledStudents, scheduleDetail?.classroomName],
  );
  const selectedClassroomName = selectedTodayLesson?.classroomName?.trim() ?? "";
  const hasResolvedSchedule = Boolean(selectedTodayLesson);

  const lessonDateValue = resolvedLessonDate || (hasResolvedSchedule ? todayIsoDate.slice(2).replace(/-/g, ".") : "-");
  const classroomNameValue = selectedClassroomName || resolvedClassroomName || "-";
  const activityTimeValue = resolvedActivityTime || "-";

  const apiAttendanceNames = useMemo(() => {
    const names: Record<string, string> = {};

    enrolledStudents.forEach((student, index) => {
      const rowIndex = Math.floor(index / attendanceColumns.length);
      const column = index % attendanceColumns.length;
      names[buildAttendanceNameKey(rowIndex, column)] = student.name ?? "";
    });

    return names;
  }, [enrolledStudents]);

  const minAttendanceRows = useMemo(
    () => Math.max(1, Math.ceil(enrolledStudents.length / attendanceColumns.length)),
    [enrolledStudents.length],
  );

  const attendanceRowCount = minAttendanceRows + additionalAttendanceRows;

  const getAttendanceName = (nameKey: string) =>
    nameKey in attendanceNameOverrides
      ? attendanceNameOverrides[nameKey]
      : (apiAttendanceNames[nameKey] ?? "");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (!hasTodayLessons) {
      toast.info("오늘은 수업이 없습니다.");
      return;
    }

    if (isAttendanceBlocked) {
      toast.info("아직 출근 전입니다. 출근을 완료한 뒤 작성할 수 있습니다.");
      return;
    }

    if (isJournalAlreadyWrittenBlocked) {
      toast.info("이미 수업 일지를 작성했습니다.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const lessonDate = parseKoreanShortDateToIsoDate(lessonDateValue.trim());
    const parsedClassroomId = enrollmentClassroomId;
    const personalInfoConsent = formData.get("privacyConsent") === "on";
    const lessonJournals = buildLessonJournals(journalSourceLessons, formData);

    if (!lessonDate) {
      toast.error("활동 일자를 00.00.00 형식으로 입력해 주세요.");
      return;
    }

    if (!Number.isInteger(parsedClassroomId) || parsedClassroomId <= 0) {
      toast.error("담당 수업 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (!personalInfoConsent) {
      toast.error("개인정보 제공 동의가 필요합니다.");
      return;
    }
    if (lessonJournals.length === 0) {
      toast.error("수업 내용을 한 교시 이상 입력해 주세요.");
      return;
    }

    const residentRegistrationNumberPrefix =
      birthPrefix.trim();

    submitMutation.mutate({
      attendances: buildStudentAttendances(formData, enrolledStudents),
      journalBody: {
        lessonDate,
        classroomId: parsedClassroomId,
        personalInfoConsent,
        residentRegistrationNumberPrefix,
        lessonJournals,
      },
    });
  };

  return (
    <PageSection>
      <HeaderRow>
        <Title>수업 일지 작성하기</Title>
        <HeaderActions>
          <ConsentLabel>
            <ConsentCheckbox
              type="checkbox"
              name="privacyConsent"
              form="class-journal-form"
              defaultChecked
            />
            <span>정보 제공 동의</span>
          </ConsentLabel>
          <SubmitButton
            type="submit"
            form="class-journal-form"
            disabled={
              isSubmitting ||
              !hasTodayLessons ||
              isAttendanceBlocked ||
              isJournalAlreadyWrittenBlocked
            }
          >
            {isSubmitting ? "제출 중..." : "수업 일지 제출하기"}
          </SubmitButton>
        </HeaderActions>
      </HeaderRow>

      <Form id="class-journal-form" onSubmit={handleSubmit}>
        {showNoClassNotice ? (
          <NoClassNotice role="status">오늘은 수업이 없습니다.</NoClassNotice>
        ) : null}
        {isAttendanceBlocked ? (
          <NoClassNotice role="status">
            아직 출근 전입니다. 출근을 완료한 뒤 작성할 수 있습니다.
          </NoClassNotice>
        ) : null}
        {isJournalAlreadyWrittenBlocked ? (
          <NoClassNotice role="status">이미 수업 일지를 작성했습니다.</NoClassNotice>
        ) : null}
        <InfoGrid>
          <InfoField>
            <FieldLabel htmlFor="writer">작성자</FieldLabel>
            <ReadOnlyFieldInput
              id="writer"
              name="writer"
              type="text"
              value={writerName}
              placeholder="작성자"
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="birthPrefix">주민번호 앞자리</FieldLabel>
            <ReadOnlyFieldInput
              id="birthPrefix"
              name="birthPrefix"
              type="text"
              placeholder="000000"
              value={birthPrefix}
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="phone">연락처</FieldLabel>
            <ReadOnlyFieldInput
              id="phone"
              name="phone"
              type="text"
              value={formatPhone(phoneNumber)}
              placeholder="010-0000-0000"
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="classroomName">담당 반</FieldLabel>
            <ReadOnlyFieldInput
              id="classroomName"
              name="classroomName"
              type="text"
              placeholder="-"
              value={classroomNameValue}
              disabled
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="lessonDate">활동 일자</FieldLabel>
            <ReadOnlyFieldInput
              id="lessonDate"
              name="lessonDate"
              type="text"
              placeholder="-"
              value={lessonDateValue}
              disabled
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="activityTime">활동 시간</FieldLabel>
            <ReadOnlyFieldInput
              id="activityTime"
              name="activityTime"
              type="text"
              placeholder="-"
              value={activityTimeValue}
              disabled
              readOnly
            />
          </InfoField>
        </InfoGrid>

        <LessonSection>
          <SectionTitle>수업 내용</SectionTitle>
          {lessonPeriods.map((period) => (
            <LessonField key={period}>
              <FieldLabel htmlFor={`lesson-${period}`}>{period}교시</FieldLabel>
              <LessonTextArea
                id={`lesson-${period}`}
                name={`lesson${period}`}
                placeholder={`${period}교시 수업 내용을 작성해주세요`}
                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                disabled={
                  !hasTodayLessons ||
                  isAttendanceBlocked ||
                  isJournalAlreadyWrittenBlocked
                }
              />
            </LessonField>
          ))}
        </LessonSection>

        <AttendanceSection>
          <SectionTitle>출석</SectionTitle>
          <AttendanceTableWrap>
            <AttendanceBlocks>
              {Array.from({ length: attendanceRowCount }, (_, rowIndex) => (
                <AttendanceGrid
                  key={rowIndex}
                  aria-label={rowIndex === 0 ? "출석부" : `출석부 ${rowIndex + 1}`}
                >
                  {attendanceColumns.map((column) => {
                    const nameKey = buildAttendanceNameKey(rowIndex, column);

                    return (
                      <AttendanceInput
                        key={`student-${rowIndex}-${column}`}
                        name={`studentName${rowIndex * 10 + column + 1}`}
                        aria-label={`${rowIndex * 10 + column + 1}번 학생 이름`}
                        value={getAttendanceName(nameKey)}
                        disabled={
                          !hasTodayLessons ||
                          isAttendanceBlocked ||
                          isJournalAlreadyWrittenBlocked
                        }
                        onChange={(event) =>
                          setAttendanceNameOverrides((current) => ({
                            ...current,
                            [nameKey]: event.target.value,
                          }))
                        }
                      />
                    );
                  })}
                  {attendanceColumns.map((column) => {
                    const statusIndex = rowIndex * 10 + column + 1;

                    return (
                      <AttendanceStatusCell key={`attendance-${rowIndex}-${column}`}>
                        <AttendanceStatusSelect
                          defaultValue="ABSENT"
                          name={`attendanceStatus${statusIndex}`}
                          aria-label={`${statusIndex}번 학생 출석 상태`}
                          disabled={
                            !hasTodayLessons ||
                            isAttendanceBlocked ||
                            isJournalAlreadyWrittenBlocked
                          }
                        >
                          {dailyStudentAttendanceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </AttendanceStatusSelect>
                      </AttendanceStatusCell>
                    );
                  })}
                </AttendanceGrid>
              ))}
            </AttendanceBlocks>
            <AddAttendanceButton
              type="button"
              disabled={
                !hasTodayLessons ||
                isAttendanceBlocked ||
                isJournalAlreadyWrittenBlocked
              }
              onClick={() => setAdditionalAttendanceRows((count) => count + 1)}
            >
              출석부 추가하기
            </AddAttendanceButton>
          </AttendanceTableWrap>
        </AttendanceSection>
      </Form>
    </PageSection>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 4rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 6rem;
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
  margin-bottom: 2.1875rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const ConsentLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    font-size: ${typography.fontSize20};
  }
`;

const ConsentCheckbox = styled.input`
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin: 0;
  appearance: none;
  border: 1px solid #c8deb8;
  border-radius: 4px;
  background-color: #eef9e6;
  cursor: pointer;

  &:checked {
    background-color: #eef9e6;
    border-color: ${colors.point};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%2388CD5A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2 6l3 3 5-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 0.75rem;
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }

  @media (min-width: 120rem) {
    width: 1.5625rem;
    height: 1.5625rem;

    &:checked {
      background-size: 1rem;
    }
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space24};

  @media (min-width: 120rem) {
    gap: 2rem;
  }
`;

const NoClassNotice = styled.p`
  margin: 0;
  padding: ${spacing.space16} ${spacing.space20};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: #fdeceb;
  color: #b24d46;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InfoGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space20} 3.75rem;

  @media (min-width: 120rem) {
    gap: 1.875rem 5.625rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const InfoField = styled.div`
  display: grid;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const FieldLabel = styled.label`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const fieldBaseStyle = `
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid #c0c0c0;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  &:disabled {
    color: #6d6d6d;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const FieldInput = styled.input`
  ${fieldBaseStyle}
`;

const ReadOnlyFieldInput = styled(FieldInput)`
  color: #6d6d6d;
  cursor: not-allowed;
`;

const LessonSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const LessonField = styled.div`
  display: contents;
`;

const LessonTextArea = styled.textarea`
  width: 100%;
  min-height: 5.375rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid #c0c0c0;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  resize: none;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 8.0625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const AttendanceSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const AttendanceTableWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: max-content;
  max-width: 100%;
  align-self: flex-start;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const AttendanceBlocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space16};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const AttendanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(4.5rem, 1fr));
  overflow-x: auto;
  border-top: 1px solid #c0c0c0;
  border-left: 1px solid #c0c0c0;
`;

const AttendanceInput = styled.input`
  min-width: 0;
  min-height: 2.75rem;
  padding: ${spacing.space8};
  border: 0;
  border-right: 1px solid #c0c0c0;
  border-bottom: 1px solid #c0c0c0;
  background-color: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-align: center;
  outline: none;

  &::placeholder {
    color: #000000;
  }

  @media (min-width: 120rem) {
    min-height: 3.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const AttendanceStatusCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 2.75rem;
  border-right: 1px solid #c0c0c0;
  border-bottom: 1px solid #c0c0c0;
  background-color: transparent;

  @media (min-width: 120rem) {
    min-height: 3.875rem;
  }
`;

const AttendanceStatusSelect = styled.select`
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: ${spacing.space8} 2rem ${spacing.space8} ${spacing.space8};
  border: 0;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.25 6 6.25l5-5' fill='none' stroke='%23262626' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  appearance: none;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-align: center;
  text-align-last: center;
  outline: none;
  cursor: pointer;

  &:disabled {
    color: #6d6d6d;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 3.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const AddAttendanceButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.6875rem;
  border: 1px solid #d3d3d3;
  background-color: #f8f8f8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:not(:disabled):hover {
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 3.4375rem;
    font-size: ${typography.fontSize20};
  }
`;
