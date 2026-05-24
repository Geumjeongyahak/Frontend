"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import type {
  DailyScheduleLessonResponseDto,
  LessonJournalRequestDto,
  UpdateDailyStudentAttendanceItemRequestDto,
} from "@/api/dailySchedule/dailySchedule.dto";
import {
  createJournal,
  getDailyScheduleDetail,
  updateStudentAttendances,
} from "@/api/dailySchedule/dailySchedule.api";
import type { StudentListResponseDto } from "@/api/student/student.dto";
import { getStudents } from "@/api/student/student.api";
import { getCurrentUser } from "@/api/user/user.api";
import { formatPhone } from "@/lib/googleSheet/classJournal/classJournalSheetPayload";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import { getKstTodayIsoDate, parseKoreanShortDateToIsoDate } from "@/utils/kstShortDate";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const lessonPeriods = [1, 2, 3] as const;
const attendanceColumns = Array.from({ length: 10 }, (_, index) => index);

/** TODO: users/me classroomId 필드가 고정 될 때까지 테스트를 위해 기본값으로 설정 */
const CLASS_JOURNAL_FORM_DEFAULTS = {
  classroomId: 1,
  classroomName: "벚꽃반",
  residentRegistrationNumberPrefix: "900101",
  phoneNumber: "01012345678",
} as const;

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

  return fromStudents?.trim() ? fromStudents : CLASS_JOURNAL_FORM_DEFAULTS.classroomName;
}

function trimTrailingClockSeconds(time?: string) {
  if (!time) return "";
  return time.endsWith(":00") ? time.slice(0, -3) : time;
}

function formatLessonsActivityTime(lessons?: DailyScheduleLessonResponseDto[]) {
  if (!lessons?.length) return "";

  const sorted = [...lessons].sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
  const start = trimTrailingClockSeconds(sorted[0]?.startTime);
  const end = trimTrailingClockSeconds(sorted[sorted.length - 1]?.endTime);

  if (start && end) return `${start} - ${end}`;
  return start || end || "";
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
    const isPresent = formData.get(`attendanceStatus${statusIndex}`) === "on";

    return [
      {
        studentId: student.id,
        status: isPresent ? "PRESENT" : "ABSENT",
      },
    ];
  });
}

function buildLessonJournals(
  lessons: DailyScheduleLessonResponseDto[] | undefined,
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
  const todayIsoDate = useMemo(() => getKstTodayIsoDate(), []);
  const [lessonDateText, setLessonDateText] = useState("");
  const [classroomNameText, setClassroomNameText] = useState("");
  const [activityTimeText, setActivityTimeText] = useState("");
  const [attendanceNameOverrides, setAttendanceNameOverrides] = useState<Record<string, string>>({});
  const [additionalAttendanceRows, setAdditionalAttendanceRows] = useState(0);

  const classroomId = String(CLASS_JOURNAL_FORM_DEFAULTS.classroomId);
  const birthPrefix = CLASS_JOURNAL_FORM_DEFAULTS.residentRegistrationNumberPrefix;
  const phoneNumber = CLASS_JOURNAL_FORM_DEFAULTS.phoneNumber;

  const currentUserQuery = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: getCurrentUser,
    retry: false,
  });

  const parsedClassroomId = Number.parseInt(classroomId, 10);
  const enrollmentClassroomId =
    Number.isFinite(parsedClassroomId) && parsedClassroomId > 0
      ? parsedClassroomId
      : CLASS_JOURNAL_FORM_DEFAULTS.classroomId;

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.list({
      classroomId: enrollmentClassroomId,
      status: "ENROLLED",
    }),
    queryFn: () =>
      getStudents({
        classroomId: enrollmentClassroomId as number,
        status: "ENROLLED",
      }),
    enabled: typeof enrollmentClassroomId === "number" && enrollmentClassroomId > 0,
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
      getDailyScheduleDetail({
        classroomId: enrollmentClassroomId,
        lessonDate: todayIsoDate,
      }),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      journalBody,
      dailyScheduleId,
      attendances,
    }: {
      journalBody: Parameters<typeof createJournal>[0];
      dailyScheduleId: number;
      attendances: UpdateDailyStudentAttendanceItemRequestDto[];
    }) => {
      const journal = await createJournal(journalBody);

      if (attendances.length > 0) {
        await updateStudentAttendances({ dailyScheduleId }, { attendances });
      }

      return journal;
    },
    onSuccess: (data) => {
      window.alert("수업 일지가 등록되었습니다.");
      if (data.dailyScheduleId) {
        router.push(`/staff/class-management/${data.dailyScheduleId}`);
        return;
      }
      router.push("/staff/class-management");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 일지 등록에 실패했습니다.");
    },
  });

  const isSubmitting = submitMutation.isPending;
  const currentUser = currentUserQuery.data;
  const scheduleDetail = dailyScheduleDetailQuery.data;

  const writerName = scheduleDetail?.teacherName ?? currentUser?.name ?? "";

  const resolvedLessonDate = useMemo(() => {
    if (!scheduleDetail?.lessonDate) return "";
    return formatUtcToKstShortDate(`${scheduleDetail.lessonDate}T00:00:00`);
  }, [scheduleDetail?.lessonDate]);

  const resolvedActivityTime = useMemo(
    () => formatLessonsActivityTime(scheduleDetail?.lessons),
    [scheduleDetail?.lessons],
  );

  const resolvedClassroomName = useMemo(
    () =>
      resolveClassroomName(
        enrollmentClassroomId,
        enrolledStudents,
        scheduleDetail?.classroomName,
      ),
    [enrollmentClassroomId, enrolledStudents, scheduleDetail?.classroomName],
  );

  const lessonDateValue = lessonDateText || resolvedLessonDate;
  const classroomNameValue = classroomNameText || resolvedClassroomName;
  const activityTimeValue = activityTimeText || resolvedActivityTime;

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

    const form = event.currentTarget;
    const formData = new FormData(form);
    const lessonDate = parseKoreanShortDateToIsoDate(lessonDateValue.trim());
    const parsedClassroomId = enrollmentClassroomId;
    const personalInfoConsent = formData.get("privacyConsent") === "on";
    const lessonJournals = buildLessonJournals(scheduleDetail?.lessons, formData);

    if (!lessonDate) {
      window.alert("활동 일자를 00.00.00 형식으로 입력해 주세요.");
      return;
    }

    if (!Number.isInteger(parsedClassroomId) || parsedClassroomId <= 0) {
      window.alert("담당 수업 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (!personalInfoConsent) {
      window.alert("개인정보 제공 동의가 필요합니다.");
      return;
    }

    const dailyScheduleId = scheduleDetail?.dailyScheduleId;
    if (!dailyScheduleId) {
      window.alert("일정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const residentRegistrationNumberPrefix =
      birthPrefix.trim() || CLASS_JOURNAL_FORM_DEFAULTS.residentRegistrationNumberPrefix;

    submitMutation.mutate({
      dailyScheduleId,
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
          <SubmitButton type="submit" form="class-journal-form" disabled={isSubmitting}>
            {isSubmitting ? "제출 중..." : "수업 일지 제출하기"}
          </SubmitButton>
        </HeaderActions>
      </HeaderRow>

      <Form id="class-journal-form" onSubmit={handleSubmit}>
        <InfoGrid>
          <InfoField>
            <FieldLabel htmlFor="writer">작성자</FieldLabel>
            <ReadOnlyFieldInput
              id="writer"
              name="writer"
              type="text"
              value={writerName}
              placeholder="작성자"
              disabled
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
              disabled
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="classroomName">담당 수업</FieldLabel>
            <EditableFieldInput
              id="classroomName"
              name="classroomName"
              type="text"
              placeholder="장미반"
              value={classroomNameValue}
              onChange={(event) => setClassroomNameText(event.target.value)}
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="lessonDate">활동 일자</FieldLabel>
            <EditableFieldInput
              id="lessonDate"
              name="lessonDate"
              type="text"
              placeholder="00.00.00"
              value={lessonDateValue}
              onChange={(event) => setLessonDateText(event.target.value)}
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="activityTime">활동 시간</FieldLabel>
            <EditableFieldInput
              id="activityTime"
              name="activityTime"
              type="text"
              placeholder="14:00 - 15:00"
              value={activityTimeValue}
              onChange={(event) => setActivityTimeText(event.target.value)}
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
                      <AttendanceCheckboxCell key={`attendance-${rowIndex}-${column}`}>
                        <ConsentCheckbox
                          type="checkbox"
                          name={`attendanceStatus${statusIndex}`}
                          aria-label={`${statusIndex}번 출석`}
                        />
                      </AttendanceCheckboxCell>
                    );
                  })}
                </AttendanceGrid>
              ))}
            </AttendanceBlocks>
            <AddAttendanceButton
              type="button"
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

const EditableFieldInput = styled(FieldInput)`
  color: #000000;
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

const AttendanceCheckboxCell = styled.div`
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

  &:hover {
    filter: brightness(0.98);
  }

  @media (min-width: 120rem) {
    min-height: 3.4375rem;
    font-size: ${typography.fontSize20};
  }
`;
