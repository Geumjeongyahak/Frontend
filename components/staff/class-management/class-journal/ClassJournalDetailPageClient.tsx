"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { deleteJournal, getDailySchedule, updateJournal } from "@/api/dailySchedule/dailySchedule.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, spacing, typography, radii } from "@/styles/tokens";
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
  const { status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const [isEditing, setIsEditing] = useState(false);
  const [editableNotes, setEditableNotes] = useState(["", "", ""]);

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
      router.push("/staff/class-management");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 일지 삭제에 실패했습니다.");
    },
  });

  const updateJournalMutation = useMutation({
    mutationFn: async () => {
      const schedule = scheduleQuery.data;
      if (!schedule) throw new Error("수업 일지 정보를 불러오지 못했습니다.");
      return updateJournal({ dailyScheduleId }, buildUpdateJournalBody(schedule, editableNotes));
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

  useEffect(() => {
    if (!scheduleQuery.data) return;
    setEditableNotes(mapClassJournalDetailView(scheduleQuery.data).lessons);
  }, [scheduleQuery.data]);

  const isSubmitting = updateJournalMutation.isPending || deleteJournalMutation.isPending;

  const handleDeleteClick = () => {
    if (deleteJournalMutation.isPending) return;
    if (!window.confirm("수업 일지를 삭제하시겠습니까?")) return;
    deleteJournalMutation.mutate();
  };

  const handleEditClick = () => {
    if (!isEditing) {
      setEditableNotes(journal.lessons);
      setIsEditing(true);
      return;
    }

    updateJournalMutation.mutate();
  };

  return (
    <PageSection>
      <ButtonRow>
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
        <LinkButton href="/staff/class-management">목록</LinkButton>
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
          <AttendanceGrid>
            {journal.attendance.map((student, index) => (
              <AttendanceCell key={`name-${index}`}>{student.name}</AttendanceCell>
            ))}
            {journal.attendance.map((student, index) => (
              <AttendanceCell key={`status-${index}`}>{student.status}</AttendanceCell>
            ))}
          </AttendanceGrid>
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
  resize: vertical;
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

const AttendanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  overflow-x: auto;
  border-top: 1px solid #c0c0c0;
  border-left: 1px solid #c0c0c0;

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(5, minmax(5rem, 1fr));
  }
`;

const AttendanceCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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

  @media (min-width: 120rem) {
    min-height: 3.875rem;
    font-size: ${typography.fontSize20};
  }
`;
