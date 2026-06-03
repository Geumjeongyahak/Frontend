"use client";

import styled from "styled-components";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { DataState, StableListArea } from "@/components/admin/AdminDashboardSectionParts";
import {
  formatSubjectDateRange,
  formatSubjectDayOfWeek,
  formatSubjectTeacherName,
  getSubjectId,
} from "@/components/admin/subjects/shared/subjectDisplay";
import { colors, layout, spacing, typography } from "@/styles/tokens";

const ListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const SubjectBlock = styled.button<{ $selected: boolean }>`
  display: grid;
  gap: ${spacing.space8};
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: ${spacing.space12};
  border: 1px solid ${({ $selected }) => ($selected ? colors.point : "#e1e5e3")};
  border-radius: 0.5rem;
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : colors.white)};
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${colors.point};
  }
`;

const BlockMetaRow = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacing.space4} ${spacing.space8};
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight150};
`;

const BlockTitle = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const BlockSchedule = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight150};
`;

type AdminSubjectListPanelProps = {
  subjects: SubjectDetailResponseDto[];
  selectedSubjectId: number | null;
  isLoading: boolean;
  isError: boolean;
  onSelectSubject: (subject: SubjectDetailResponseDto) => void;
};

export function AdminSubjectListPanel({
  subjects,
  selectedSubjectId,
  isLoading,
  isError,
  onSelectSubject,
}: AdminSubjectListPanelProps) {
  return (
    <StableListArea>
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={subjects.length === 0}
        loadingLabel="과목 목록 불러오는 중"
        errorLabel="과목 목록을 불러오지 못했습니다."
        emptyLabel="등록된 과목이 없습니다."
      >
        <ListGrid>
          {subjects.map((subject) => {
            const subjectId = getSubjectId(subject);
            if (subjectId == null) return null;

            const isSelected = selectedSubjectId === subjectId;

            return (
              <SubjectBlock
                key={subjectId}
                type="button"
                $selected={isSelected}
                aria-pressed={isSelected}
                onClick={() => onSelectSubject(subject)}
              >
                <BlockTitle>{subject.name ?? "—"}</BlockTitle>
                <BlockMetaRow>
                  <span>{subject.classroomName ?? "—"}</span>
                  <span>{formatSubjectTeacherName(subject.teacherName)}</span>
                </BlockMetaRow>
                <BlockSchedule>
                  {formatSubjectDateRange(subject.startAt, subject.endAt)}{" "}
                  {formatSubjectDayOfWeek(subject.dayOfWeek)}
                </BlockSchedule>
              </SubjectBlock>
            );
          })}
        </ListGrid>
      </DataState>
    </StableListArea>
  );
}
