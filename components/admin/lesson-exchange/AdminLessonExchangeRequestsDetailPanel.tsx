"use client";

import styled from "styled-components";
import { LessonExchangeDetailFieldItems } from "@/components/admin/lesson-exchange/LessonExchangeDetailFieldItems";
import {
  LESSON_EXCHANGE_BASIC_DETAIL_FIELDS,
  LESSON_EXCHANGE_PROCESSING_META_FIELDS,
} from "@/components/admin/lesson-exchange/lessonExchangeDetailFields";
import {
  getLessonExchangeDetailActionState,
  getLessonExchangeRejectionNote,
  hasLessonExchangeSupplementalContent,
  shouldShowLessonExchangeProcessingMeta,
} from "@/components/admin/lesson-exchange/lessonExchangeRequestConstants";
import type { AdminLessonExchangeRequestsViewModel } from "@/components/admin/lesson-exchange/useAdminLessonExchangeRequests";
import {
  ButtonRow,
  DangerButton,
  DataState,
  FormGrid,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionTitle,
  TextArea,
} from "@/components/admin/AdminDashboardSectionParts";
import { spacing, typography } from "@/styles/tokens";

type AdminLessonExchangeRequestsDetailPanelProps = {
  viewModel: AdminLessonExchangeRequestsViewModel;
};

export function AdminLessonExchangeRequestsDetailPanel({
  viewModel,
}: AdminLessonExchangeRequestsDetailPanelProps) {
  const {
    selectedRequestId,
    lessonExchangeDetailQuery,
    rejectNote,
    setRejectNote,
    handleApprove,
    handleReject,
    isActionPending,
  } = viewModel;

  const detail = lessonExchangeDetailQuery.data;
  const isLoading = selectedRequestId !== null && lessonExchangeDetailQuery.isLoading;
  const isError = selectedRequestId !== null && lessonExchangeDetailQuery.isError;
  const actionState = getLessonExchangeDetailActionState(detail);
  const rejectionNote = getLessonExchangeRejectionNote(detail);
  const showProcessingMeta = shouldShowLessonExchangeProcessingMeta(detail);
  const hasSupplementalContent = hasLessonExchangeSupplementalContent(detail);

  return (
    <SectionCard>
      <SectionTitle>수업 교환 요청 상세</SectionTitle>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!selectedRequestId}
        loadingLabel="수업 교환 요청 상세 불러오는 중"
        errorLabel="수업 교환 요청 상세를 불러오지 못했습니다."
        emptyLabel="수업 교환 요청을 선택하세요."
      >
        <DetailStack>
          <DetailFields>
            <LessonExchangeDetailFieldItems
              fields={LESSON_EXCHANGE_BASIC_DETAIL_FIELDS}
              detail={detail}
            />
          </DetailFields>

          <DetailLowerBlock>
            <ContentSection>
              <DetailField $fullWidth $compact>
                <DetailFieldLabel>내용</DetailFieldLabel>
                <DetailTextBox>{detail?.content?.trim() || "-"}</DetailTextBox>
              </DetailField>

              {hasSupplementalContent ? (
                <SupplementalSection>
                  <CompactDivider />

                  {rejectionNote ? (
                    <DetailField $fullWidth $compact>
                      <DetailFieldLabel>반려 사유</DetailFieldLabel>
                      <DetailNoteBox>{rejectionNote}</DetailNoteBox>
                    </DetailField>
                  ) : null}

                  {showProcessingMeta ? (
                    <ProcessingMetaFields>
                      <LessonExchangeDetailFieldItems
                        fields={LESSON_EXCHANGE_PROCESSING_META_FIELDS}
                        detail={detail}
                      />
                    </ProcessingMetaFields>
                  ) : null}
                </SupplementalSection>
              ) : null}
            </ContentSection>

            {hasSupplementalContent ? <CompactDivider /> : null}

            <ActionSection>
              <DetailFieldLabel>처리</DetailFieldLabel>
              {actionState === "expired" ? (
                <UnavailableBadge>만료된 요청으로 처리불가</UnavailableBadge>
              ) : null}
              {actionState === "processed" ? <ProcessedBadge>처리 완료</ProcessedBadge> : null}
              {actionState === "actionable" ? (
                <FormGrid onSubmit={(event) => event.preventDefault()}>
                  <RejectNoteTextArea
                    value={rejectNote}
                    placeholder="반려 사유를 입력해 주세요."
                    disabled={isActionPending}
                    onChange={(event) => setRejectNote(event.target.value)}
                  />
                  <ButtonRow>
                    <PrimaryButton type="button" disabled={isActionPending} onClick={handleApprove}>
                      승인
                    </PrimaryButton>
                    <DangerButton
                      type="button"
                      disabled={isActionPending || !rejectNote.trim()}
                      onClick={handleReject}
                    >
                      반려
                    </DangerButton>
                  </ButtonRow>
                </FormGrid>
              ) : null}
            </ActionSection>
          </DetailLowerBlock>
        </DetailStack>
      </DataState>
    </SectionCard>
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

const DetailNoteBox = styled(DetailTextBox)`
  border-color: #f3c6c2;
  background: #fff7f6;
`;

const CompactDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

const DetailLowerBlock = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const ContentSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
  margin: 0;
`;

const SupplementalSection = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ProcessingMetaFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space16};
`;

const ActionSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
`;

const RejectNoteTextArea = styled(TextArea)`
  resize: none;
  font-weight: 500;
`;

const UnavailableBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: #fff3e0;
  color: #b45f06;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;

const ProcessedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: #dcf4ea;
  color: #3da75c;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;
