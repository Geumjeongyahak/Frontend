"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getSubjects } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { AdminSubjectDetailPanel } from "@/components/admin/subjects/detail/AdminSubjectDetailPanel";
import { useAdminSubjectDetail } from "@/components/admin/subjects/detail/useAdminSubjectDetail";
import { AdminSubjectListPanel } from "@/components/admin/subjects/list/AdminSubjectListPanel";
import { filterActiveSubjects, getSubjectId } from "@/components/admin/subjects/shared/subjectDisplay";
import { AdminSubjectTeacherAssignPanel } from "@/components/admin/subject-teachers/AdminSubjectTeacherAssignPanel";
import { queryKeys } from "@/lib/queryKeys";
import { spacing } from "@/styles/tokens";

const PageStack = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const ListSectionHeader = styled(SectionHeaderRow)`
  margin-bottom: ${spacing.space12};
`;

type AdminSubjectsListDetailBlockProps = {
  readOnly?: boolean;
};

export function AdminSubjectsListDetailBlock({ readOnly = false }: AdminSubjectsListDetailBlockProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const subjectsQuery = useQuery({
    queryKey: queryKeys.admin.subjects(),
    queryFn: () => getSubjects(),
  });

  const subjects = useMemo(() => {
    const items = Array.isArray(subjectsQuery.data) ? subjectsQuery.data : [];
    return filterActiveSubjects(items);
  }, [subjectsQuery.data]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => getSubjectId(subject) === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects],
  );

  const handleSelectSubject = (subject: SubjectDetailResponseDto) => {
    const subjectId = getSubjectId(subject);
    if (subjectId == null) return;
    setSelectedSubjectId(subjectId);
  };

  const subjectDetail = useAdminSubjectDetail({
    subject: selectedSubject,
    onClearSelection: () => setSelectedSubjectId(null),
  });

  return (
    <PageStack>
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
          <AdminSubjectDetailPanel
            subject={selectedSubject}
            detail={subjectDetail}
            readOnly={readOnly}
          />
        </SectionCard>
      </TwoColumnGrid>

      {readOnly ? <AdminSubjectTeacherAssignPanel subject={selectedSubject} /> : null}
    </PageStack>
  );
}
