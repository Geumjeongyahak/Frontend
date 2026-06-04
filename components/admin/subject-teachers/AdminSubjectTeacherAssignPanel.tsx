"use client";

import styled from "styled-components";
import {
  ButtonRow,
  DataState,
  InlineStatus,
  Label,
  PrimaryButton,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
} from "@/components/admin/AdminDashboardSectionParts";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  getTeacherClassroomName,
  getTeacherUserId,
  useAdminSubjectTeacherAssign,
} from "@/components/admin/subject-teachers/useAdminSubjectTeacherAssign";
import {
  CenteredChoiceButton,
  CenteredChoiceTitle,
  ChoiceButton,
  ChoiceGrid,
  ChoiceHeightPlaceholder,
  ChoiceMeta,
  ChoiceStack,
  ChoiceTitle,
} from "@/components/admin/subjects/shared/subjectChoiceStyles";
import { spacing } from "@/styles/tokens";

const SectionHeader = styled(SectionHeaderRow)`
  margin-bottom: ${spacing.space12};
`;

const PanelBody = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const AssignLabel = styled(Label)`
  gap: ${spacing.space8};
`;

const FooterStack = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

type AdminSubjectTeacherAssignPanelProps = {
  subject: SubjectDetailResponseDto | null;
};

export function AdminSubjectTeacherAssignPanel({ subject }: AdminSubjectTeacherAssignPanelProps) {
  const assign = useAdminSubjectTeacherAssign({ subject });

  if (!subject) {
    return (
      <SectionCard>
        <SectionHeader>
          <SectionTitle>과목 담당 교사 관리</SectionTitle>
        </SectionHeader>
        <InlineStatus>과목을 선택하세요.</InlineStatus>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionHeader>
        <SectionTitle>과목 담당 교사 관리</SectionTitle>
      </SectionHeader>

      <PanelBody>
        <AssignLabel>
          교사 선택
          <ChoiceStack>
            <ChoiceGrid>
              <CenteredChoiceButton
                type="button"
                $selected={assign.isUnselectedChoiceSelected}
                $disabled={assign.isUnselectedChoiceDisabled}
                disabled={assign.isUnselectedChoiceDisabled}
                aria-pressed={assign.isUnselectedChoiceSelected}
                onClick={assign.selectTeacherUnselected}
              >
                <ChoiceHeightPlaceholder aria-hidden>
                  <ChoiceTitle>{"\u00A0"}</ChoiceTitle>
                  <ChoiceMeta>{"\u00A0"}</ChoiceMeta>
                </ChoiceHeightPlaceholder>
                <CenteredChoiceTitle $disabled={assign.isUnselectedChoiceDisabled}>
                  교사 미선택
                </CenteredChoiceTitle>
              </CenteredChoiceButton>
            </ChoiceGrid>

            <DataState
              compact
              isLoading={assign.teachersQuery.isLoading}
              isError={assign.teachersQuery.isError}
              isEmpty={assign.teachers.length === 0}
              loadingLabel="교사 목록 불러오는 중"
              errorLabel="교사 목록을 불러오지 못했습니다."
              emptyLabel="활동 중인 교사가 없습니다."
            >
              <ChoiceGrid>
                {assign.teachers.map((teacher) => {
                  const teacherId = getTeacherUserId(teacher);
                  if (teacherId == null) return null;

                  const isDisabled = assign.isTeacherChoiceDisabled(teacherId);
                  const isSelected = assign.selectedTeacherId === teacherId;

                  return (
                    <ChoiceButton
                      key={teacherId}
                      type="button"
                      $selected={isSelected}
                      $disabled={isDisabled}
                      disabled={isDisabled}
                      aria-pressed={isSelected}
                      onClick={() => assign.setSelectedTeacherId(teacherId)}
                    >
                      <ChoiceTitle $selected={isSelected} $disabled={isDisabled}>
                        {teacher.name ?? "—"}
                      </ChoiceTitle>
                      <ChoiceMeta>{getTeacherClassroomName(teacher)}</ChoiceMeta>
                    </ChoiceButton>
                  );
                })}
              </ChoiceGrid>
            </DataState>
          </ChoiceStack>
        </AssignLabel>

        <FooterStack>
          <ButtonRow>
            <PrimaryButton
              type="button"
              disabled={!assign.canSubmit}
              onClick={assign.handleSubmit}
            >
              {assign.isSubmitting
                ? "처리 중..."
                : assign.isTeacherUnassigned
                  ? "교사 배정"
                  : "교사 변경"}
            </PrimaryButton>
          </ButtonRow>

          {assign.submitError ? <InlineStatus role="alert">{assign.submitError}</InlineStatus> : null}
        </FooterStack>
      </PanelBody>
    </SectionCard>
  );
}
