"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  deleteJournal,
  getDailySchedule,
  updateJournal,
  updateStudentAttendances,
} from "@/api/dailySchedule/dailySchedule.api";
import type {
  DailyStudentAttendanceStatus,
  DailyStudentAttendanceResponseDto,
  UpdateDailyStudentAttendanceItemRequestDto,
} from "@/api/dailySchedule/dailySchedule.dto";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, spacing, typography, radii } from "@/styles/tokens";
import {
  dailyStudentAttendanceOptions,
  getDailyStudentAttendanceStatusOrDefault,
} from "@/utils/dailyStudentAttendance";
import {
  buildUpdateJournalBody,
  mapClassJournalDetailView,
  type ClassJournalDetailView,
} from "@/utils/mapClassJournalDetailView";

const emptyJournal: ClassJournalDetailView = {
  createdAt: "",
  writer: "",
  birthPrefix: "",
  phone: "",
  className: "",
  activityDate: "",
  activityTime: "",
  lessons: ["", "", ""],
  attendance: Array.from({ length: 10 }, () => ({ name: "", status: "" })),
};

const ATTENDANCE_SLOT_COUNT = 10;

function mapStudentAttendancesToStatuses(students?: DailyStudentAttendanceResponseDto[]) {
  return Array.from({ length: ATTENDANCE_SLOT_COUNT }, (_, index) => {
    return getDailyStudentAttendanceStatusOrDefault(students?.[index]?.status);
  });
}

function buildEditableStudentAttendances(
  students: DailyStudentAttendanceResponseDto[] | undefined,
  statuses: DailyStudentAttendanceStatus[],
): UpdateDailyStudentAttendanceItemRequestDto[] {
  return (students ?? []).flatMap((student, index) => {
    if (typeof student.studentId !== "number") return [];

    const status =
      index < statuses.length
        ? statuses[index]
        : getDailyStudentAttendanceStatusOrDefault(student.status);

    return [{ studentId: student.studentId, status }];
  });
}

const detailFields = [
  { label: "작성자", key: "writer" },
  { label: "주민번호 앞자리", key: "birthPrefix" },
  { label: "연락처", key: "phone" },
  { label: "담당 수업", key: "className" },
  { label: "활동 일자", key: "activityDate" },
  { label: "활동 시간", key: "activityTime" },
] as const;

type ClassJournalDetailPageClientProps = {
  dailyScheduleId: number;
};

export default function ClassJournalDetailPageClient({
  dailyScheduleId,
}: ClassJournalDetailPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status: authStatus, user } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const [isEditing, setIsEditing] = useState(false);
  const [editableNotes, setEditableNotes] = useState(["", "", ""]);
  const [editableAttendance, setEditableAttendance] = useState<DailyStudentAttendanceStatus[]>(() =>
    Array.from({ length: ATTENDANCE_SLOT_COUNT }, () => "ABSENT"),
  );

  const scheduleQuery = useQuery({
    queryKey: ["daily-schedules", "detail", dailyScheduleId] as const,
    queryFn: () => getDailySchedule({ dailyScheduleId }),
    enabled: isAuthenticated && Number.isInteger(dailyScheduleId) && dailyScheduleId > 0,
    retry: false,
  });

  const deleteJournalMutation = useMutation({
    mutationFn: () => deleteJournal({ dailyScheduleId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["daily-schedules", "list"] });
      window.alert("수업 일지가 삭제되었습니다.");
      router.push("/staff/class-management/class-journal");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 일지 삭제에 실패했습니다.");
    },
  });

  const updateJournalMutation = useMutation({
    mutationFn: async () => {
      const schedule = scheduleQuery.data;
      if (!schedule) throw new Error("수업 일지 정보를 불러오지 못했습니다.");

      await updateJournal({ dailyScheduleId }, buildUpdateJournalBody(schedule, editableNotes));

      const attendances = buildEditableStudentAttendances(
        schedule.studentAttendances,
        editableAttendance,
      );
      if (attendances.length > 0) {
        await updateStudentAttendances({ dailyScheduleId }, { attendances });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["daily-schedules", "detail", dailyScheduleId],
      });
      await queryClient.invalidateQueries({ queryKey: ["daily-schedules", "list"] });
      setIsEditing(false);
      window.alert("수업 일지가 수정되었습니다.");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 일지 수정에 실패했습니다.");
    },
  });

  const journal = scheduleQuery.data
    ? mapClassJournalDetailView(scheduleQuery.data)
    : emptyJournal;

  const isSubmitting = updateJournalMutation.isPending || deleteJournalMutation.isPending;
  const canManageJournal =
    isAuthenticated &&
    Boolean(
      user?.role === "ADMIN" ||
        (typeof user?.id === "number" &&
          typeof scheduleQuery.data?.teacherId === "number" &&
          user.id === scheduleQuery.data.teacherId),
    );

  const handleDeleteClick = () => {
    if (deleteJournalMutation.isPending) return;
    if (!window.confirm("수업 일지를 삭제하시겠습니까?")) return;
    deleteJournalMutation.mutate();
  };

  const handleEditClick = () => {
    if (!isEditing) {
      setEditableNotes(journal.lessons);
      setEditableAttendance(
        mapStudentAttendancesToStatuses(scheduleQuery.data?.studentAttendances),
      );
      setIsEditing(true);
      return;
    }

    updateJournalMutation.mutate();
  };

  return (
    <PageSection>
      <ButtonRow>
        {canManageJournal ? (
          <>
            <ActionButton
              type="button"
              $variant="danger"
              disabled={isSubmitting}
              onClick={handleDeleteClick}
            >
              {deleteJournalMutation.isPending ? "삭제 중..." : "삭제"}
            </ActionButton>
            <ActionButton
              type="button"
              $variant="edit"
              disabled={isSubmitting || !scheduleQuery.data}
              onClick={handleEditClick}
            >
              {updateJournalMutation.isPending ? "저장 중..." : isEditing ? "저장" : "수정"}
            </ActionButton>
          </>
        ) : null}
        <LinkButton href="/staff/class-management/class-journal">목록</LinkButton>
      </ButtonRow>

      <ContentColumn>
        <DateBar>{journal.createdAt}</DateBar>

        <InfoGrid>
          {detailFields.map((field) => (
            <InfoField key={field.key}>
              <FieldLabel>{field.label}</FieldLabel>
              <FieldValue>{journal[field.key]}</FieldValue>
            </InfoField>
          ))}
        </InfoGrid>

        <LessonSection>
          <SectionTitle>수업 내용</SectionTitle>
          {journal.lessons.map((lesson, index) => (
            <LessonBlock key={index + 1}>
              <FieldLabel>{index + 1}교시</FieldLabel>
              {isEditing ? (
                <LessonNoteInput
                  value={editableNotes[index] ?? ""}
                  onChange={(event) =>
                    setEditableNotes((current) =>
                      current.map((note, noteIndex) =>
                        noteIndex === index ? event.target.value : note,
                      ),
                    )
                  }
                />
              ) : (
                <LessonContent>{lesson}</LessonContent>
              )}
            </LessonBlock>
          ))}
        </LessonSection>

        <AttendanceSection>
          <SectionTitle>출석</SectionTitle>
          <AttendanceTableWrap>
            <AttendanceGrid>
              {journal.attendance.map((student, index) => (
                <AttendanceColumn key={index}>
                  <AttendanceCell>{student.name}</AttendanceCell>
                  {isEditing ? (
                    <AttendanceStatusCell>
                      <AttendanceStatusSelect
                        value={editableAttendance[index] ?? "ABSENT"}
                        onChange={(event) =>
                          setEditableAttendance((current) =>
                            current.map((status, attendanceIndex) =>
                              attendanceIndex === index
                                ? getDailyStudentAttendanceStatusOrDefault(
                                    event.target.value as DailyStudentAttendanceStatus,
                                  )
                                : status,
                            ),
                          )
                        }
                        aria-label={`${index + 1}번 학생 출석 상태`}
                      >
                        {dailyStudentAttendanceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </AttendanceStatusSelect>
                    </AttendanceStatusCell>
                  ) : (
                    <AttendanceCell>{student.status}</AttendanceCell>
                  )}
                </AttendanceColumn>
              ))}
            </AttendanceGrid>
          </AttendanceTableWrap>
        </AttendanceSection>
      </ContentColumn>
    </PageSection>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 1.8125rem 3.125rem 2rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 2.75rem 4.6875rem 5.1875rem 4.625rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ $variant: "danger" | "edit" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${({ $variant }) => ($variant === "danger" ? colors.notice : colors.point)};
  background-color: ${colors.white};
  color: ${({ $variant }) => ($variant === "danger" ? colors.notice : colors.point)};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  border-radius: ${radii.radius12};

  &:hover:not(:disabled) {
    background-color: ${({ $variant }) =>
      $variant === "danger" ? colors.noticeSoft : colors.pointSoft};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid ${colors.border};
  background-color: ${colors.background};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  border-radius: ${radii.radius12};

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};
  width: 100%;

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #a8a8a8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space20} 3.75rem;
  margin-top: ${spacing.space8};

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

const FieldLabel = styled.p`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const FieldValue = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background-color: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const LessonSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  margin-top: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
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

const LessonBlock = styled.div`
  display: contents;
`;

const lessonContentStyle = `
  width: 100%;
  min-height: 5.375rem;
  margin: 0;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background-color: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    min-height: 8.0625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const LessonContent = styled.p`
  ${lessonContentStyle}
`;

const LessonNoteInput = styled.textarea`
  ${lessonContentStyle}
  border: 1px solid #c0c0c0;
  background-color: transparent;
  resize: none;
  font-family: inherit;
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
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const AttendanceGrid = styled.div`
  display: flex;
  width: max-content;
  min-width: 100%;
  border-top: 1px solid #c0c0c0;
  border-left: 1px solid #c0c0c0;
`;

const AttendanceColumn = styled.div`
  display: flex;
  flex: 1 0 4.5rem;
  flex-direction: column;
  min-width: 4.5rem;

  @media (min-width: 120rem) {
    flex-basis: 6rem;
    min-width: 6rem;
  }
`;

const AttendanceStatusCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 2.75rem;
  padding: ${spacing.space8};
  border: 0;
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

  @media (min-width: 120rem) {
    min-height: 3.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const AttendanceCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    min-height: 3.875rem;
    font-size: ${typography.fontSize20};
  }
`;
