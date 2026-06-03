"use client";

import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { SubjectDescriptionTextArea } from "@/components/admin/subjects/shared/subjectFormStyles";
import {
  CompactDivider,
  DescriptionSection,
  DetailField,
  DetailFieldLabel,
  DetailTextBox,
} from "@/components/admin/subjects/detail/AdminSubjectDetailPanel.styles";
import type { AdminSubjectDetailViewModel } from "@/components/admin/subjects/detail/useAdminSubjectDetail";

type AdminSubjectDetailDescriptionProps = {
  subject: SubjectDetailResponseDto;
  detail: AdminSubjectDetailViewModel;
};

export function AdminSubjectDetailDescription({ subject, detail }: AdminSubjectDetailDescriptionProps) {
  return (
    <DescriptionSection>
      <CompactDivider />
      <DetailField $fullWidth $compact>
        <DetailFieldLabel>설명</DetailFieldLabel>
        {detail.isEditingInfo ? (
          <SubjectDescriptionTextArea
            value={detail.infoForm.description}
            onChange={(event) => {
              detail.clearActionError();
              detail.setInfoForm((current) => ({
                ...current,
                description: event.target.value,
              }));
            }}
          />
        ) : (
          <DetailTextBox>{subject.description?.trim() || "—"}</DetailTextBox>
        )}
      </DetailField>
    </DescriptionSection>
  );
}
