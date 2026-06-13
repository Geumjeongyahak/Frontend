"use client";

import styled from "styled-components";
import { formatAbsenceDate } from "@/components/admin/absence-requests/absenceRequestConstants";
import { AbsenceStatusBadge } from "@/components/admin/absence-requests/AbsenceStatusBadge";
import type { AdminAbsenceRequestsViewModel } from "@/components/admin/absence-requests/useAdminAbsenceRequests";
import {
  ButtonRow,
  DangerButton,
  DataState,
  FormGrid,
  PrimaryButton,
  SectionCard,
  SectionTitle,
  TextArea,
} from "@/components/admin/AdminDashboardSectionParts";
import { spacing, typography } from "@/styles/tokens";

type AdminAbsenceRequestsDetailPanelProps = Pick<
  AdminAbsenceRequestsViewModel,
  | "selectedAbsence"
  | "rejectNote"
  | "setRejectNote"
  | "handleApprove"
  | "handleReject"
  | "isActionPending"
>;

export function AdminAbsenceRequestsDetailPanel({
  selectedAbsence,
  rejectNote,
  setRejectNote,
  handleApprove,
  handleReject,
  isActionPending,
}: AdminAbsenceRequestsDetailPanelProps) {
  return (
    <SectionCard>
      <SectionTitle>결강 요청 상세/처리</SectionTitle>

      <DataState
        isLoading={false}
        isError={false}
        isEmpty={!selectedAbsence}
        loadingLabel=""
        errorLabel=""
        emptyLabel="결강 요청을 선택하세요."
      >
        <DetailStack>
          <DetailFields>
            <DetailField $fullWidth>
              <DetailFieldLabel>제목</DetailFieldLabel>
              <DetailFieldValue>{selectedAbsence?.title ?? "-"}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>분반</DetailFieldLabel>
              <DetailFieldValue>{selectedAbsence?.classroomName ?? "-"}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>수업일</DetailFieldLabel>
              <DetailFieldValue>{formatAbsenceDate(selectedAbsence?.lessonDate)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>요청자</DetailFieldLabel>
              <DetailFieldValue>{selectedAbsence?.requestedByName ?? "-"}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>상태</DetailFieldLabel>
              <DetailFieldValue>
                <AbsenceStatusBadge status={selectedAbsence?.status} />
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>만료 시각</DetailFieldLabel>
              <DetailFieldValue>{formatAbsenceDate(selectedAbsence?.expiresAt)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>요청일</DetailFieldLabel>
              <DetailFieldValue>{formatAbsenceDate(selectedAbsence?.createdAt)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>처리일</DetailFieldLabel>
              <DetailFieldValue>{formatAbsenceDate(selectedAbsence?.approvalAt)}</DetailFieldValue>
            </DetailField>
          </DetailFields>

          <ReasonSection>
            <CompactDivider />

            <DetailField $fullWidth $compact>
              <DetailFieldLabel>사유</DetailFieldLabel>
              <DetailTextBox>{selectedAbsence?.reason?.trim() || "-"}</DetailTextBox>
            </DetailField>

            {selectedAbsence?.status === "REJECTED" ? (
              <DetailField $fullWidth $compact>
                <DetailFieldLabel>거절 사유</DetailFieldLabel>
                <DetailNoteBox>{selectedAbsence.note?.trim() || "-"}</DetailNoteBox>
              </DetailField>
            ) : null}

            <CompactDivider />
          </ReasonSection>

          <ActionSection>
            <DetailFieldLabel>처리</DetailFieldLabel>
            {selectedAbsence?.approvalAt ? (
              <ProcessedBadge>처리 완료</ProcessedBadge>
            ) : (
              <FormGrid onSubmit={(event) => event.preventDefault()}>
                <RejectNoteTextArea
                  value={rejectNote}
                  placeholder="거절 사유를 입력해 주세요."
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
                    거절
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

function ProcessedBadge({ children }: { children: string }) {
  return <ProcessedBadgeBox>{children}</ProcessedBadgeBox>;
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
  color: #1f2b28;
`;

const CompactDivider = styled.hr`
  width: 100%;
  margin: ${spacing.space8} 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

const ReasonSection = styled.section`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
`;

const ActionSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
  margin-top: -${spacing.space12};
`;

const RejectNoteTextArea = styled(TextArea)`
  resize: none;
  font-weight: 500;
`;

const ProcessedBadgeBox = styled.span`
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
