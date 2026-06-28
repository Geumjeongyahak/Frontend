"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getLessonDetail } from "@/api/lesson/lesson.api";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import { AdminLessonDeleteConfirmModal } from "@/components/admin/lesson-management/AdminLessonDeleteConfirmModal";
import {
  formatLessonStatusLabel,
  formatLessonTimeRange,
} from "@/components/admin/lesson-management/lessonCreateError";
import { useLessonDelete } from "@/components/admin/lesson-management/useLessonDelete";
import {
  ButtonRow,
  DangerButton,
  DataState,
  SectionDescription,
  StatePanel,
} from "@/components/admin/AdminDashboardSectionParts";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import { colors, spacing, typography } from "@/styles/tokens";

type AdminLessonDetailPanelProps = {
  selectedLessonId: number | null;
  selectedLessonSummary: LessonSummaryResponseDto | null;
  onClearSelection: () => void;
};

function buildDeleteConfirmMessage(lesson: LessonSummaryResponseDto) {
  const dateLabel = formatUtcToKstShortDate(lesson.date);
  const periodLabel = lesson.period != null ? `${lesson.period}교시` : "—";
  const subjectLabel = lesson.subjectName ?? "—";
  const teacherLabel = lesson.teacherName ?? "—";

  return `${dateLabel} ${periodLabel} · ${subjectLabel} · ${teacherLabel} 수업을 삭제할까요?`;
}

export function AdminLessonDetailPanel({
  selectedLessonId,
  selectedLessonSummary,
  onClearSelection,
}: AdminLessonDetailPanelProps) {
  const [confirmState, setConfirmState] = useState<{ lessonId: number | null; open: boolean }>({
    lessonId: null,
    open: false,
  });
  const isConfirmOpen = confirmState.lessonId === selectedLessonId && confirmState.open;

  const detailQuery = useQuery({
    queryKey: ["admin", "lessons", "detail", selectedLessonId],
    queryFn: () => getLessonDetail({ lessonId: selectedLessonId ?? 0 }),
    enabled: selectedLessonId != null && selectedLessonId > 0,
    retry: false,
  });

  const { deleteLessonById, isDeleting } = useLessonDelete({
    onDeleted: () => {
      setConfirmState({ lessonId: null, open: false });
      onClearSelection();
    },
  });

  const deleteMessage = useMemo(
    () => (selectedLessonSummary ? buildDeleteConfirmMessage(selectedLessonSummary) : ""),
    [selectedLessonSummary],
  );

  if (selectedLessonId == null) {
    return (
      <>
        <SectionDescription>목록에서 수업을 선택하면 상세 정보를 확인할 수 있습니다.</SectionDescription>
        <StatePanel>목록에서 수업을 선택해 주세요.</StatePanel>
      </>
    );
  }

  const lesson = detailQuery.data;

  return (
    <>
      <SectionDescription>선택한 수업의 상세 정보를 확인하고 삭제할 수 있습니다.</SectionDescription>

      <DataState
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        isEmpty={false}
        loadingLabel="수업 상세 불러오는 중"
        errorLabel="수업 상세를 불러오지 못했습니다."
        emptyLabel=""
      >
        {lesson ? (
          <>
            <DetailGrid>
              <DetailField>
                <DetailLabel>일자</DetailLabel>
                <DetailValue>{formatUtcToKstShortDate(lesson.date)}</DetailValue>
              </DetailField>
              <DetailField>
                <DetailLabel>교시</DetailLabel>
                <DetailValue>{lesson.period ?? "—"}</DetailValue>
              </DetailField>
              <DetailField>
                <DetailLabel>시간</DetailLabel>
                <DetailValue>{formatLessonTimeRange(lesson.startTime, lesson.endTime)}</DetailValue>
              </DetailField>
              <DetailField>
                <DetailLabel>담당 교사</DetailLabel>
                <DetailValue>{lesson.teacherName ?? "—"}</DetailValue>
              </DetailField>
              <DetailField>
                <DetailLabel>과목</DetailLabel>
                <DetailValue>{lesson.subjectName ?? "—"}</DetailValue>
              </DetailField>
              <DetailField>
                <DetailLabel>상태</DetailLabel>
                <DetailValue>{formatLessonStatusLabel(lesson.status)}</DetailValue>
              </DetailField>
            </DetailGrid>

            <ButtonRow>
              <DangerButton
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmState({ lessonId: selectedLessonId, open: true })}
              >
                삭제
              </DangerButton>
            </ButtonRow>
          </>
        ) : null}
      </DataState>

      <AdminLessonDeleteConfirmModal
        open={isConfirmOpen}
        message={deleteMessage}
        isPending={isDeleting}
        onCancel={() => setConfirmState({ lessonId: selectedLessonId, open: false })}
        onConfirm={() => {
          if (selectedLessonId != null) deleteLessonById(selectedLessonId);
        }}
      />
    </>
  );
}

const DetailGrid = styled.dl`
  display: grid;
  gap: ${spacing.space12};
  margin: 0 0 ${spacing.space16};
`;

const DetailField = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const DetailLabel = styled.dt`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
`;

const DetailValue = styled.dd`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;
