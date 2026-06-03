"use client";

import styled from "styled-components";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { DataState } from "@/components/admin/AdminDashboardSectionParts";
import {
  formatSubjectDateRange,
  formatSubjectDayOfWeek,
  formatSubjectTeacherAssignedAt,
  formatSubjectTeacherName,
  formatSubjectTimeRange,
  isSubjectTeacherUnassigned,
} from "@/components/admin/subjects/subjectDisplay";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type AdminSubjectDetailPanelProps = {
  subject: SubjectDetailResponseDto | null;
};

export function AdminSubjectDetailPanel({ subject }: AdminSubjectDetailPanelProps) {
  const teacherNameLabel = formatSubjectTeacherName(subject?.teacherName);
  const isTeacherUnassigned = isSubjectTeacherUnassigned(subject?.teacherName);

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
        <DetailFields>
          <DetailField $fullWidth>
            <DetailFieldLabel>과목명</DetailFieldLabel>
            <DetailFieldValue>{subject?.name ?? "—"}</DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>분반</DetailFieldLabel>
            <DetailFieldValue>{subject?.classroomName ?? "—"}</DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>담당 교사</DetailFieldLabel>
            <DetailFieldValue>
              {isTeacherUnassigned ? (
                <UnassignedTeacherBadge>{teacherNameLabel}</UnassignedTeacherBadge>
              ) : (
                teacherNameLabel
              )}
            </DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>기간</DetailFieldLabel>
            <DetailFieldValue>
              {formatSubjectDateRange(subject?.startAt, subject?.endAt)}
            </DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>요일</DetailFieldLabel>
            <DetailFieldValue>{formatSubjectDayOfWeek(subject?.dayOfWeek)}</DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>시간</DetailFieldLabel>
            <DetailFieldValue>
              {formatSubjectTimeRange(subject?.startTime, subject?.endTime)}
            </DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>교시</DetailFieldLabel>
            <DetailFieldValue>{subject?.period ?? "—"}</DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>교사 배정일</DetailFieldLabel>
            <DetailFieldValue>
              {formatSubjectTeacherAssignedAt(subject?.teacherAssignedAt)}
            </DetailFieldValue>
          </DetailField>
        </DetailFields>

        <DescriptionSection>
          <CompactDivider />
          <DetailField $fullWidth $compact>
            <DetailFieldLabel>설명</DetailFieldLabel>
            <DetailTextBox>{subject?.description?.trim() || "—"}</DetailTextBox>
          </DetailField>
        </DescriptionSection>
      </DetailStack>
    </DataState>
  );
}

const DetailStack = styled.div`
  display: grid;
  gap: ${spacing.space20};
`;

const DetailFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space16};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const DetailField = styled.div<{ $fullWidth?: boolean; $compact?: boolean }>`
  display: grid;
  gap: ${({ $compact }) => ($compact ? spacing.space4 : spacing.space8)};
  min-width: 0;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
`;

const DetailFieldLabel = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const DetailFieldValue = styled.div`
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: break-word;
`;

const UnassignedTeacherBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.25rem 0.625rem;
  border: 1px solid #f3c6c2;
  border-radius: 999px;
  background: ${colors.noticeSoft};
  color: ${colors.notice};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;

const DetailTextBox = styled.div`
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  background: #fafbfa;
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
  word-break: break-word;
`;

const CompactDivider = styled.hr`
  width: 100%;
  margin: ${spacing.space8} 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

const DescriptionSection = styled.section`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
`;
