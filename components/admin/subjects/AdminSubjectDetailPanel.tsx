"use client";

import styled from "styled-components";
import type { SubjectDayOfWeek, SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  ButtonRow,
  DataState,
  DangerButton,
  InlineStatus,
  Label,
  PrimaryButton,
  SmallButton,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { SubjectDescriptionTextArea } from "@/components/admin/subjects/subjectFormStyles";
import { TimeWheelPicker } from "@/components/admin/subjects/TimeWheelPicker";
import { SUBJECT_DAY_OPTIONS } from "@/components/admin/subjects/subjectCreateForm";
import {
  formatSubjectDateRange,
  formatSubjectDayOfWeek,
  formatSubjectTeacherAssignedAt,
  formatSubjectTeacherName,
  formatSubjectTimeRange,
  isSubjectTeacherUnassigned,
} from "@/components/admin/subjects/subjectDisplay";
import type { useAdminSubjectDetail } from "@/components/admin/subjects/useAdminSubjectDetail";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type AdminSubjectDetailViewModel = ReturnType<typeof useAdminSubjectDetail>;

type AdminSubjectDetailPanelProps = {
  subject: SubjectDetailResponseDto | null;
  detail: AdminSubjectDetailViewModel;
};

export function AdminSubjectDetailPanel({ subject, detail }: AdminSubjectDetailPanelProps) {
  const teacherNameLabel = formatSubjectTeacherName(subject?.teacherName);
  const isTeacherUnassigned = isSubjectTeacherUnassigned(subject?.teacherName);
  const showActionButtons = Boolean(subject) && !detail.isEditingInfo && !detail.isEditingSchedule;

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
            {detail.isEditingInfo ? (
              <TextInput
                value={detail.infoForm.name}
                onChange={(event) => {
                  detail.clearActionError();
                  detail.setInfoForm((current) => ({ ...current, name: event.target.value }));
                }}
                required
              />
            ) : (
              <DetailFieldValue>{subject?.name ?? "—"}</DetailFieldValue>
            )}
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

          {detail.isEditingSchedule ? (
            <>
              <DetailField $fullWidth>
                <ScheduleEditGrid>
                  <Label>
                    시작일
                    <TextInput
                      type="date"
                      value={detail.scheduleForm.startAt}
                      max={detail.scheduleForm.endAt || undefined}
                      onChange={(event) =>
                        detail.setScheduleForm((current) => ({
                          ...current,
                          startAt: event.target.value,
                        }))
                      }
                      required
                    />
                  </Label>
                  <Label>
                    종료일
                    <TextInput
                      type="date"
                      value={detail.scheduleForm.endAt}
                      min={detail.scheduleForm.startAt || undefined}
                      onChange={(event) =>
                        detail.setScheduleForm((current) => ({
                          ...current,
                          endAt: event.target.value,
                        }))
                      }
                      required
                    />
                  </Label>
                </ScheduleEditGrid>
              </DetailField>
              <DetailField $fullWidth>
                <EditLabel>요일</EditLabel>
                <DayChoiceGrid>
                  {SUBJECT_DAY_OPTIONS.map((option) => {
                    const isSelected = detail.scheduleForm.dayOfWeek === option.value;

                    return (
                      <DayChoiceButton
                        key={option.value}
                        type="button"
                        $selected={isSelected}
                        aria-pressed={isSelected}
                        onClick={() =>
                          detail.setScheduleForm((current) => ({
                            ...current,
                            dayOfWeek: option.value,
                          }))
                        }
                      >
                        <DayChoiceLabel $selected={isSelected}>{option.label}</DayChoiceLabel>
                      </DayChoiceButton>
                    );
                  })}
                </DayChoiceGrid>
              </DetailField>
              <DetailField $fullWidth>
                <ScheduleTimeRow>
                  <TimeWheelPicker
                    label="시작 시간"
                    value={detail.scheduleForm.startTime}
                    onChange={(value) =>
                      detail.setScheduleForm((current) => ({ ...current, startTime: value }))
                    }
                  />
                  <TimeWheelPicker
                    label="종료 시간"
                    value={detail.scheduleForm.endTime}
                    onChange={(value) =>
                      detail.setScheduleForm((current) => ({ ...current, endTime: value }))
                    }
                  />
                </ScheduleTimeRow>
              </DetailField>
              <DetailField>
                <EditLabel>교시</EditLabel>
                <TextInput
                  type="number"
                  min={1}
                  step={1}
                  value={detail.scheduleForm.period}
                  onChange={(event) =>
                    detail.setScheduleForm((current) => ({ ...current, period: event.target.value }))
                  }
                  required
                />
              </DetailField>
            </>
          ) : (
            <>
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
            </>
          )}

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
              <DetailTextBox>{subject?.description?.trim() || "—"}</DetailTextBox>
            )}
          </DetailField>
        </DescriptionSection>

        <ActionSection>
          {showActionButtons ? (
            <ActionButtonRow>
              <PrimaryButton type="button" disabled={detail.isActionPending} onClick={detail.startInfoEdit}>
                수정
              </PrimaryButton>
              <SmallButton
                type="button"
                disabled={detail.isActionPending}
                onClick={detail.startScheduleEdit}
              >
                일정 수정
              </SmallButton>
              <DangerButton type="button" disabled={detail.isActionPending} onClick={detail.removeSubject}>
                삭제
              </DangerButton>
            </ActionButtonRow>
          ) : null}

          {detail.isEditingInfo ? (
            <ActionButtonRow>
              <PrimaryButton type="button" disabled={detail.isActionPending} onClick={detail.saveInfo}>
                {detail.isActionPending ? "저장 중..." : "저장"}
              </PrimaryButton>
              <SmallButton type="button" disabled={detail.isActionPending} onClick={detail.cancelInfoEdit}>
                취소
              </SmallButton>
            </ActionButtonRow>
          ) : null}

          {detail.isEditingSchedule ? (
            <ActionButtonRow>
              <PrimaryButton
                type="button"
                disabled={detail.isActionPending}
                onClick={detail.saveSchedule}
              >
                {detail.isActionPending ? "저장 중..." : "일정 저장"}
              </PrimaryButton>
              <SmallButton
                type="button"
                disabled={detail.isActionPending}
                onClick={detail.cancelScheduleEdit}
              >
                취소
              </SmallButton>
            </ActionButtonRow>
          ) : null}

          {detail.actionError ? <InlineStatus role="alert">{detail.actionError}</InlineStatus> : null}
        </ActionSection>
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

const EditLabel = styled(Label)`
  gap: ${spacing.space8};
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

const ActionSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
`;

const ActionButtonRow = styled(ButtonRow)`
  justify-content: flex-end;
`;

const ScheduleEditGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ScheduleTimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const DayChoiceGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

const DayChoiceButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  margin: 0;
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid ${({ $selected }) => ($selected ? colors.point : "#e1e5e3")};
  border-radius: 0.5rem;
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : colors.white)};
  font-family: inherit;
  cursor: pointer;

  &:hover {
    border-color: ${colors.point};
  }
`;

const DayChoiceLabel = styled.span<{ $selected?: boolean }>`
  color: ${({ $selected }) => ($selected ? colors.text : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;
