"use client";

import styled from "styled-components";
import { AdminSubjectCreateForm } from "@/components/admin/subjects/create/AdminSubjectCreateForm";
import { AdminSubjectsListDetailBlock } from "@/components/admin/subjects/AdminSubjectsListDetailBlock";
import {
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
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

      <AdminSubjectsListDetailBlock />
    </PageStack>
  );
}
