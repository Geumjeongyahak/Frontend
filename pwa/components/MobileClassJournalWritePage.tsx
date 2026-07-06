"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import {
  checkOutTeacherAttendance,
  createJournal,
  getDailyScheduleDetailIfExists,
  updateJournal,
  updateStudentAttendances,
} from "@/api/dailySchedule/dailySchedule.api";
import type {
  DailyScheduleLessonResponseDto,
  DailyStudentAttendanceResponseDto,
  LessonJournalRequestDto,
  UpdateDailyStudentAttendanceItemRequestDto,
} from "@/api/dailySchedule/dailySchedule.dto";
import { getMyLessons } from "@/api/lesson/lesson.api";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import { getStudents } from "@/api/student/student.api";
import type { StudentListResponseDto } from "@/api/student/student.dto";
import { getMyAssignedSubjects } from "@/api/subject/subject.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { markPendingAttendanceSuccessOverlay } from "@/pwa/pages/mobile-home/attendanceSuccessFlag";
import MobileRequestShell from "@/pwa/requests/components/MobileRequestShell";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import { getDailyStudentAttendanceStatusOrDefault } from "@/utils/dailyStudentAttendance";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import { formatPhone } from "@/utils/formatPhone";
import { getKstTodayIsoDate, parseKoreanShortDateToIsoDate } from "@/utils/kstShortDate";
import {
  buildTodayLessonOptions,
  buildTodayLessonOptionsFromSubjects,
  formatLessonRange,
} from "@/components/staff/class-management/class-journal/classJournalCreateState";
import MobileStudentAttendanceList, {
  type MobileStudentAttendanceEntry,
} from "@/pwa/components/MobileStudentAttendanceList";

const lessonPeriods = [1, 2, 3] as const;

function resolveClassroomName(
  classroomId: number,
  students: StudentListResponseDto,
  detailClassroomName?: string,
) {
  if (detailClassroomName?.trim()) {
    return detailClassroomName;
  }

  const fromStudents = students
    .flatMap((student) => student.classrooms ?? [])
    .find((classroom) => classroom.id === classroomId)?.name;

  return fromStudents?.trim() ? fromStudents : "";
}

function buildStudentAttendances(
  entries: MobileStudentAttendanceEntry[],
): UpdateDailyStudentAttendanceItemRequestDto[] {
  return entries.flatMap((entry) => {
    if (typeof entry.studentId !== "number") {
      return [];
    }

    return [
      {
        studentId: entry.studentId,
        status: getDailyStudentAttendanceStatusOrDefault(entry.status),
      },
    ];
  });
}

function buildLessonJournals(
  lessons: Array<
    Pick<DailyScheduleLessonResponseDto, "lessonId" | "period"> |
    Pick<LessonSummaryResponseDto, "lessonId" | "period">
  > | undefined,
  notes: string[],
): LessonJournalRequestDto[] {
  const orderedLessons = [...(lessons ?? [])]
    .map((lesson, index) => ({ lesson, index }))
    .sort((a, b) => {
      const periodA = a.lesson.period;
      const periodB = b.lesson.period;
      if (typeof periodA === "number" && typeof periodB === "number") {
        return periodA - periodB;
      }
      return a.index - b.index;
    })
    .map(({ lesson }) => lesson);

  return lessonPeriods.flatMap((period, index) => {
    const note = notes[index]?.trim() ?? "";
    const lesson = orderedLessons.find((item) => item.period === period) ?? orderedLessons[index];
    const lessonId = lesson?.lessonId;

    if (typeof lessonId !== "number" || !note) {
      return [];
    }

    return [{ lessonId, note }];
  });
}

function buildInitialLessonNotes(lessons?: DailyScheduleLessonResponseDto[]) {
  const orderedLessons = [...(lessons ?? [])]
    .map((lesson, index) => ({ lesson, index }))
    .sort((a, b) => {
      const periodA = a.lesson.period;
      const periodB = b.lesson.period;
      if (typeof periodA === "number" && typeof periodB === "number") {
        return periodA - periodB;
      }
      return a.index - b.index;
    })
    .map(({ lesson }) => lesson);

  return lessonPeriods.map((period, index) => {
    const lesson = orderedLessons.find((item) => item.period === period) ?? orderedLessons[index];
    return lesson?.note ?? "";
  });
}

function buildInitialAttendanceEntries(
  enrolledStudents: StudentListResponseDto,
  studentAttendances?: DailyStudentAttendanceResponseDto[],
) {
  const statusMap = new Map(
    (studentAttendances ?? [])
      .filter((attendance) => typeof attendance.studentId === "number")
      .map((attendance) => [
        attendance.studentId as number,
        getDailyStudentAttendanceStatusOrDefault(attendance.status),
      ]),
  );

  return enrolledStudents.map((student, index) => ({
    key: `student-${student.id ?? index}`,
    studentId: student.id,
    name: student.name ?? "",
    status:
      typeof student.id === "number"
        ? (statusMap.get(student.id) ?? "ABSENT")
        : "ABSENT",
  }));
}

export default function MobileClassJournalWritePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const todayIsoDate = useMemo(() => getKstTodayIsoDate(), []);
  const [lessonNotes, setLessonNotes] = useState(["", "", ""]);
  const [attendanceEntries, setAttendanceEntries] = useState<MobileStudentAttendanceEntry[]>([]);
  const [isAttendanceEditing, setIsAttendanceEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
  const todayLessonOptions =
    lessonBackedOptions.length > 0 ? lessonBackedOptions : subjectBackedOptions;
  const selectedTodayLesson = todayLessonOptions[0] ?? null;
  const hasTodayLessons = todayLessonOptions.length > 0;
  const showNoClassNotice =
    myTodayLessonsQuery.isFetched && myAssignedSubjectsQuery.isFetched && !hasTodayLessons;
  const enrollmentClassroomId = selectedTodayLesson?.classroomId ?? 0;

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.list({
      classroomId: enrollmentClassroomId,
    }),
    queryFn: () =>
      getStudents({
        classroomId: enrollmentClassroomId,
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

  useEffect(() => {
    setLessonNotes(buildInitialLessonNotes(dailyScheduleDetailQuery.data?.lessons));
  }, [dailyScheduleDetailQuery.data?.lessons]);

  useEffect(() => {
    setAttendanceEntries(
      buildInitialAttendanceEntries(
        enrolledStudents,
        dailyScheduleDetailQuery.data?.studentAttendances,
      ),
    );
    setIsAttendanceEditing(false);
  }, [dailyScheduleDetailQuery.data?.studentAttendances, enrolledStudents]);

  const submitMutation = useMutation({
    mutationFn: async ({
      createBody,
      updateBody,
      attendances,
    }: {
      createBody: Parameters<typeof createJournal>[0];
      updateBody: Parameters<typeof updateJournal>[1];
      attendances: UpdateDailyStudentAttendanceItemRequestDto[];
    }) => {
      const dailyScheduleId = dailyScheduleDetailQuery.data?.dailyScheduleId;
      const hasExistingJournal = Boolean(
        dailyScheduleDetailQuery.data?.lessons?.some((lesson) => lesson.note?.trim()),
      );
      const hasCheckedOut =
        dailyScheduleDetailQuery.data?.teacherAttendance?.isCheckedOut === true ||
        dailyScheduleDetailQuery.data?.isTeacherCheckedOut === true;

      let schedule =
        hasExistingJournal && typeof dailyScheduleId === "number"
          ? await updateJournal({ dailyScheduleId }, updateBody)
          : await createJournal(createBody);

      if (typeof schedule.dailyScheduleId === "number" && attendances.length > 0) {
        schedule = await updateStudentAttendances(
          { dailyScheduleId: schedule.dailyScheduleId },
          { attendances },
        );
      }

      if (typeof schedule.dailyScheduleId === "number" && !hasExistingJournal && !hasCheckedOut) {
        schedule = await checkOutTeacherAttendance({ dailyScheduleId: schedule.dailyScheduleId });
      }

      return schedule;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["daily-schedules", "list"] });
      await queryClient.invalidateQueries({ queryKey: ["daily-schedules", "detail"] });
      await queryClient.invalidateQueries({ queryKey: ["mobile-home", "daily-schedule"] });
      markPendingAttendanceSuccessOverlay("checkout");
      toast.success("제출이 완료되었습니다.");
      router.push("/");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "제출에 실패했습니다."));
    },
  });

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
  const isReadOnlyExistingJournal = hasTodayLessons && hasExistingJournal && !isEditMode;

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
  const lessonDateValue =
    resolvedLessonDate || (hasTodayLessons ? todayIsoDate.slice(2).replace(/-/g, ".") : "-");
  const classroomNameValue = selectedClassroomName || resolvedClassroomName || "-";
  const activityTimeValue = resolvedActivityTime || "-";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitMutation.isPending) {
      return;
    }

    if (!hasTodayLessons) {
      toast.info("오늘은 수업이 없습니다.");
      return;
    }

    if (isAttendanceBlocked) {
      toast.info("아직 출근 전입니다. 출근을 완료한 뒤 작성할 수 있습니다.");
      return;
    }

    const lessonDate = parseKoreanShortDateToIsoDate(lessonDateValue.trim());
    const personalInfoConsent = true;
    const lessonJournals = buildLessonJournals(journalSourceLessons, lessonNotes);

    if (!lessonDate) {
      toast.error("활동 일자를 확인해 주세요.");
      return;
    }

    if (!Number.isInteger(enrollmentClassroomId) || enrollmentClassroomId <= 0) {
      toast.error("담당 수업 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (lessonJournals.length === 0) {
      toast.error("수업 내용을 한 교시 이상 입력해 주세요.");
      return;
    }

    submitMutation.mutate({
      attendances: buildStudentAttendances(attendanceEntries),
      createBody: {
        lessonDate,
        classroomId: enrollmentClassroomId,
        personalInfoConsent,
        residentRegistrationNumberPrefix: birthPrefix.trim(),
        lessonJournals,
      },
      updateBody: {
        personalInfoConsent,
        residentRegistrationNumberPrefix: birthPrefix.trim(),
        lessonJournals,
      },
    });
  }

  function handlePrimaryAction() {
    if (hasExistingJournal && !isEditMode) {
      setIsEditMode(true);
      return;
    }

    const form = document.getElementById("mobile-class-journal-form");
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  }

  return (
    <MobileRequestShell
      backHref="/"
      title="수업 일지"
    >
      <Form id="mobile-class-journal-form" onSubmit={handleSubmit}>
        {showNoClassNotice ? (
          <StateCard role="status">오늘은 작성할 수업이 없습니다.</StateCard>
        ) : null}
        {isAttendanceBlocked ? (
          <StateCard role="status">
            아직 출근 전입니다. 출근을 완료한 뒤 작성할 수 있습니다.
          </StateCard>
        ) : null}

        <Card>
          <CardTitle>기본 정보</CardTitle>
          <InfoGrid>
            <InfoField>
              <FieldLabel>작성자</FieldLabel>
              <ReadOnlyValue>{writerName || "-"}</ReadOnlyValue>
            </InfoField>
            <InfoField>
              <FieldLabel>주민번호 앞자리</FieldLabel>
              <ReadOnlyValue>{birthPrefix || "-"}</ReadOnlyValue>
            </InfoField>
            <InfoField>
              <FieldLabel>연락처</FieldLabel>
              <ReadOnlyValue>{formatPhone(phoneNumber) || "-"}</ReadOnlyValue>
            </InfoField>
            <InfoField>
              <FieldLabel>담당 반</FieldLabel>
              <ReadOnlyValue>{classroomNameValue}</ReadOnlyValue>
            </InfoField>
            <InfoField>
              <FieldLabel>활동 일자</FieldLabel>
              <ReadOnlyValue>{lessonDateValue}</ReadOnlyValue>
            </InfoField>
            <InfoField>
              <FieldLabel>활동 시간</FieldLabel>
              <ReadOnlyValue>{activityTimeValue}</ReadOnlyValue>
            </InfoField>
          </InfoGrid>
        </Card>

        <Card>
          <CardTitle>수업 내용</CardTitle>
          <SectionColumn>
            {lessonPeriods.map((period, index) => (
              <FieldBlock key={period}>
                <FieldLabel htmlFor={`mobile-journal-lesson-${period}`}>{period}교시</FieldLabel>
                <LessonTextArea
                  id={`mobile-journal-lesson-${period}`}
                  value={lessonNotes[index] ?? ""}
                  placeholder={`${period}교시 수업 내용을 작성해주세요`}
                  disabled={!hasTodayLessons || isAttendanceBlocked || isReadOnlyExistingJournal}
                  onChange={(event) =>
                    setLessonNotes((current) =>
                      current.map((note, noteIndex) =>
                        noteIndex === index ? event.target.value : note,
                      ),
                    )
                  }
                />
              </FieldBlock>
            ))}
          </SectionColumn>
        </Card>

        <Card>
          <AttendanceHeader>
            <CardTitle>출석</CardTitle>
            <AttendanceEditButton
              type="button"
              disabled={!hasTodayLessons || isAttendanceBlocked || isReadOnlyExistingJournal}
              onClick={() => setIsAttendanceEditing((current) => !current)}
            >
              {isAttendanceEditing ? "완료" : "수정"}
            </AttendanceEditButton>
          </AttendanceHeader>
          <MobileStudentAttendanceList
            entries={attendanceEntries}
            isEditing={isAttendanceEditing}
            disabled={!hasTodayLessons || isAttendanceBlocked || isReadOnlyExistingJournal}
            onChangeName={(entryIndex, name) =>
              setAttendanceEntries((current) =>
                current.map((entry, index) =>
                  index === entryIndex ? { ...entry, name } : entry,
                ),
              )
            }
            onChangeStatus={(entryIndex, status) =>
              setAttendanceEntries((current) => {
                const next = [...current];
                return next.map((entry, index) =>
                  index === entryIndex ? { ...entry, status } : entry,
                );
              })
            }
            onDelete={(entryIndex) =>
              setAttendanceEntries((current) => current.filter((_, index) => index !== entryIndex))
            }
            onAdd={() =>
              setAttendanceEntries((current) => [
                ...current,
                {
                  key: `manual-${Date.now()}-${current.length}`,
                  name: "",
                  status: "ABSENT",
                },
              ])
            }
          />
        </Card>

        <BottomActions>
          <CancelButton type="button" onClick={() => router.push("/")}>
            취소
          </CancelButton>
          <SubmitButton
            type="button"
            onClick={handlePrimaryAction}
            disabled={
              !hasTodayLessons ||
              isAttendanceBlocked ||
              submitMutation.isPending
            }
          >
            {submitMutation.isPending ? "제출 중..." : hasExistingJournal && !isEditMode ? "수정" : "제출"}
          </SubmitButton>
        </BottomActions>
      </Form>
    </MobileRequestShell>
  );
}

const Form = styled.form`
  display: grid;
  gap: ${spacing.space16};
`;

const Card = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const StateCard = styled(Card)`
  color: #b24d46;
  background: ${colors.noticeSoft};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const CardTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const AttendanceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const AttendanceEditButton = styled.button`
  min-height: 2.375rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius12};
  background: ${colors.white};
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  &:disabled {
    opacity: 0.55;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 26rem) {
    grid-template-columns: 1fr;
  }
`;

const InfoField = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const FieldBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const FieldLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const ReadOnlyValue = styled.div`
  min-height: 3rem;
  padding: 0.875rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: #61705b;
  font-size: ${typography.fontSize14};
`;

const SectionColumn = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const LessonTextArea = styled.textarea`
  width: 100%;
  min-height: 7.5rem;
  padding: 0.875rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  resize: vertical;
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const BottomActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const CancelButton = styled.button`
  min-height: 3.25rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius999};
  background: ${colors.background};
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
`;

const SubmitButton = styled.button`
  min-height: 3.25rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
`;
