"use client";

import styled from "styled-components";
import { AdminSubjectCreateForm } from "@/components/admin/subjects/AdminSubjectCreateForm";
import {
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { spacing } from "@/styles/tokens";

const PageStack = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const CreateSectionHeader = styled(SectionHeaderRow)`
  margin-bottom: ${spacing.space12};
`;

export function AdminSubjectsSection() {
  return (
    <PageStack>
      <SectionCard>
        <CreateSectionHeader>
          <SectionTitle>과목 등록</SectionTitle>
        </CreateSectionHeader>
        <AdminSubjectCreateForm />
      </SectionCard>

      <TwoColumnGrid>
        <SectionCard>
          <SectionHeaderRow>
            <SectionTitle>과목 목록</SectionTitle>
          </SectionHeaderRow>
        </SectionCard>
        <SectionCard>
          <SectionHeaderRow>
            <SectionTitle>과목 상세</SectionTitle>
          </SectionHeaderRow>
        </SectionCard>
      </TwoColumnGrid>
    </PageStack>
  );
}
