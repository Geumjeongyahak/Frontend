"use client";

import {
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";

export function AdminSubjectsSection() {
  return (
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
  );
}
