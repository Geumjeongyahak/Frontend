"use client";

import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  DangerButton,
  InlineStatus,
  PrimaryButton,
  SmallButton,
} from "@/components/admin/AdminDashboardSectionParts";
import {
  ActionButtonRow,
  ActionSection,
} from "@/components/admin/subjects/detail/AdminSubjectDetailPanel.styles";
import type { AdminSubjectDetailViewModel } from "@/components/admin/subjects/detail/useAdminSubjectDetail";

type AdminSubjectDetailActionsProps = {
  subject: SubjectDetailResponseDto | null;
  detail: AdminSubjectDetailViewModel;
};

export function AdminSubjectDetailActions({ subject, detail }: AdminSubjectDetailActionsProps) {
  const showActionButtons = Boolean(subject) && !detail.isEditingInfo && !detail.isEditingSchedule;

  return (
    <ActionSection>
      {showActionButtons ? (
        <ActionButtonRow>
          <PrimaryButton type="button" disabled={detail.isActionPending} onClick={detail.startInfoEdit}>
            수정
          </PrimaryButton>
          <SmallButton type="button" disabled={detail.isActionPending} onClick={detail.startScheduleEdit}>
            일정 수정
          </SmallButton>
          <DangerButton type="button" disabled={detail.isActionPending} onClick={detail.removeSubject}>
            삭제
          </DangerButton>
        </ActionButtonRow>
      ) : null}

      {detail.isEditingInfo ? (
        <ActionButtonRow>
          <PrimaryButton type="button" disabled={detail.isActionPending} onClick={detail.saveInfo}>
            {detail.isActionPending ? "저장 중..." : "저장"}
          </PrimaryButton>
          <SmallButton type="button" disabled={detail.isActionPending} onClick={detail.cancelInfoEdit}>
            취소
          </SmallButton>
        </ActionButtonRow>
      ) : null}

      {detail.isEditingSchedule ? (
        <ActionButtonRow>
          <PrimaryButton type="button" disabled={detail.isActionPending} onClick={detail.saveSchedule}>
            {detail.isActionPending ? "저장 중..." : "일정 저장"}
          </PrimaryButton>
          <SmallButton type="button" disabled={detail.isActionPending} onClick={detail.cancelScheduleEdit}>
            취소
          </SmallButton>
        </ActionButtonRow>
      ) : null}

      {detail.actionError ? <InlineStatus role="alert">{detail.actionError}</InlineStatus> : null}
    </ActionSection>
  );
}
