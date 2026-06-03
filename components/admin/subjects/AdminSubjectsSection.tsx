"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getSubjects } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { AdminSubjectCreateForm } from "@/components/admin/subjects/AdminSubjectCreateForm";
import { AdminSubjectDetailPanel } from "@/components/admin/subjects/AdminSubjectDetailPanel";
import { AdminSubjectListPanel } from "@/components/admin/subjects/AdminSubjectListPanel";
import { getSubjectId } from "@/components/admin/subjects/subjectDisplay";
import {
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { queryKeys } from "@/lib/queryKeys";
import { spacing } from "@/styles/tokens";

const PageStack = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const CreateSectionHeader = styled(SectionHeaderRow)`
  margin-bottom: ${spacing.space12};
`;

const ListSectionHeader = styled(SectionHeaderRow)`
  margin-bottom: ${spacing.space12};
`;

export function AdminSubjectsSection() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const subjectsQuery = useQuery({
    queryKey: queryKeys.admin.subjects(),
    queryFn: () => getSubjects(),
  });

  const subjects = useMemo(
    () => (Array.isArray(subjectsQuery.data) ? subjectsQuery.data : []),
    [subjectsQuery.data],
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => getSubjectId(subject) === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects],
  );

  const handleSelectSubject = (subject: SubjectDetailResponseDto) => {
    const subjectId = getSubjectId(subject);
    if (subjectId == null) return;
    setSelectedSubjectId(subjectId);
  };

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
          <ListSectionHeader>
            <SectionTitle>과목 목록</SectionTitle>
          </ListSectionHeader>
          <AdminSubjectListPanel
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            isLoading={subjectsQuery.isLoading}
            isError={subjectsQuery.isError}
            onSelectSubject={handleSelectSubject}
          />
        </SectionCard>
        <SectionCard>
          <ListSectionHeader>
            <SectionTitle>과목 상세</SectionTitle>
          </ListSectionHeader>
          <AdminSubjectDetailPanel subject={selectedSubject} />
        </SectionCard>
      </TwoColumnGrid>
    </PageStack>
  );
}
