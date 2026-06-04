"use client";

import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { DataState } from "@/components/admin/AdminDashboardSectionParts";
import { AdminSubjectDetailActions } from "@/components/admin/subjects/detail/AdminSubjectDetailActions";
import { AdminSubjectDetailDescription } from "@/components/admin/subjects/detail/AdminSubjectDetailDescription";
import { DetailStack } from "@/components/admin/subjects/detail/AdminSubjectDetailPanel.styles";
import { AdminSubjectDetailViewFields } from "@/components/admin/subjects/detail/AdminSubjectDetailViewFields";
import type { AdminSubjectDetailViewModel } from "@/components/admin/subjects/detail/useAdminSubjectDetail";

type AdminSubjectDetailPanelProps = {
  subject: SubjectDetailResponseDto | null;
  detail: AdminSubjectDetailViewModel;
  readOnly?: boolean;
};

export function AdminSubjectDetailPanel({
  subject,
  detail,
  readOnly = false,
}: AdminSubjectDetailPanelProps) {
  return (
    <DataState
      isLoading={false}
      isError={false}
      isEmpty={!subject}
      loadingLabel=""
      errorLabel=""
      emptyLabel="과목을 선택하세요."
    >
      <DetailStack>
        {subject ? (
          <>
            <AdminSubjectDetailViewFields subject={subject} detail={detail} />
            <AdminSubjectDetailDescription subject={subject} detail={detail} />
          </>
        ) : null}
        {readOnly ? null : <AdminSubjectDetailActions subject={subject} detail={detail} />}
      </DetailStack>
    </DataState>
  );
}
