"use client";

import styled from "styled-components";
import { formatLessonExchangeDate } from "@/components/admin/lesson-exchange/lessonExchangeRequestConstants";
import { LessonExchangeStatusBadge } from "@/components/admin/lesson-exchange/LessonExchangeStatusBadge";
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

type AdminLessonExchangeRequestsDetailPanelProps = Pick<
  AdminLessonExchangeRequestsViewModel,
  | "selectedRequestId"
  | "lessonExchangeDetailQuery"
  | "rejectNote"
  | "setRejectNote"
  | "handleApprove"
  | "handleReject"
  | "isActionPending"
>;

export function AdminLessonExchangeRequestsDetailPanel({
  selectedRequestId,
  lessonExchangeDetailQuery,
  rejectNote,
  setRejectNote,
  handleApprove,
  handleReject,
  isActionPending,
}: AdminLessonExchangeRequestsDetailPanelProps) {
  const detail = lessonExchangeDetailQuery.data;
  const isLoading = selectedRequestId !== null && lessonExchangeDetailQuery.isLoading;
  const isError = selectedRequestId !== null && lessonExchangeDetailQuery.isError;
  const rejectionNote = detail?.rejectionNote?.trim();
  const isProcessed = Boolean(detail?.processedAt);
  const isExpired = detail?.status === "EXPIRED";
  const showProcessingMeta =
    isProcessed ||
    detail?.status === "APPROVED" ||
    detail?.status === "REJECTED" ||
    detail?.status === "COMPLETED" ||
    detail?.status === "CANCELLED";

  return (
    <SectionCard>
      <SectionTitle>수업 교환 요청 상세/처리</SectionTitle>
      <SectionDescription>
        선택한 수업 교환 요청의 상세 정보를 확인하고 승인 또는 반려 처리를 수행합니다.
      </SectionDescription>

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
            <DetailField $fullWidth>
              <DetailFieldLabel>제목</DetailFieldLabel>
              <DetailFieldValue>{detail?.title ?? "-"}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>분반</DetailFieldLabel>
              <DetailFieldValue>{detail?.classroomName ?? "-"}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>요청자</DetailFieldLabel>
              <DetailFieldValue>{detail?.requestedByName ?? "-"}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>수업일</DetailFieldLabel>
              <DetailFieldValue>{formatLessonExchangeDate(detail?.lessonDate)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>만료일</DetailFieldLabel>
              <DetailFieldValue>{formatLessonExchangeDate(detail?.expiresAt)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>요청일</DetailFieldLabel>
              <DetailFieldValue>{formatLessonExchangeDate(detail?.createdAt)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>상태</DetailFieldLabel>
              <DetailFieldValue>
                <LessonExchangeStatusBadge status={detail?.status} />
              </DetailFieldValue>
            </DetailField>
          </DetailFields>

          <ContentSection>
            <DetailField $fullWidth $compact>
              <DetailFieldLabel>내용</DetailFieldLabel>
              <DetailTextBox>{detail?.content?.trim() || "-"}</DetailTextBox>
            </DetailField>

            {rejectionNote || showProcessingMeta ? <CompactDivider /> : null}

            {rejectionNote ? (
              <DetailField $fullWidth $compact>
                <DetailFieldLabel>반려 사유</DetailFieldLabel>
                <DetailNoteBox>{rejectionNote}</DetailNoteBox>
              </DetailField>
            ) : null}

            {showProcessingMeta ? (
              <ProcessingMetaFields $spacedFromRejection={Boolean(rejectionNote)}>
                  <DetailField>
                    <DetailFieldLabel>처리자</DetailFieldLabel>
                    <DetailFieldValue>{detail?.processedByName ?? "-"}</DetailFieldValue>
                  </DetailField>
                  <DetailField>
                    <DetailFieldLabel>처리일</DetailFieldLabel>
                    <DetailFieldValue>{formatLessonExchangeDate(detail?.processedAt)}</DetailFieldValue>
                  </DetailField>
                  <DetailField>
                    <DetailFieldLabel>완료일</DetailFieldLabel>
                    <DetailFieldValue>{formatLessonExchangeDate(detail?.completedAt)}</DetailFieldValue>
                  </DetailField>
                  <DetailField>
                    <DetailFieldLabel>취소일</DetailFieldLabel>
                    <DetailFieldValue>{formatLessonExchangeDate(detail?.cancelledAt)}</DetailFieldValue>
                  </DetailField>
              </ProcessingMetaFields>
            ) : null}

            <ActionDivider />
          </ContentSection>

          <ActionSection>
            <DetailFieldLabel>처리</DetailFieldLabel>
            {isExpired ? (
              <UnavailableBadge>만료된 요청으로 처리불가</UnavailableBadge>
            ) : isProcessed ? (
              <ProcessedBadge>처리 완료</ProcessedBadge>
            ) : (
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
            )}
          </ActionSection>
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

const DetailFieldValue = styled.div`
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: break-word;
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
  margin: ${spacing.space8} 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

const ActionDivider = styled(CompactDivider)`
  margin-top: ${spacing.space4};
  margin-bottom: ${spacing.space4};
`;

const ContentSection = styled.section`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
`;

const ProcessingMetaFields = styled.div<{ $spacedFromRejection?: boolean }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space16};
  margin-top: ${({ $spacedFromRejection }) => ($spacedFromRejection ? spacing.space8 : "0")};
`;

const ActionSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
  margin-top: -${spacing.space8};
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
