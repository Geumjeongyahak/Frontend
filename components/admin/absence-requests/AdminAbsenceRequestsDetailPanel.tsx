"use client";

import { useState } from "react";
import styled from "styled-components";
import {
  formatAbsenceDate,
  formatAbsenceStatus,
} from "@/components/admin/absence-requests/absenceRequestConstants";
import type { AdminAbsenceRequestsViewModel } from "@/components/admin/absence-requests/useAdminAbsenceRequests";
import {
  ButtonRow,
  DangerButton,
  DataState,
  FormGrid,
  List,
  ListItem,
  SmallButton,
  TextArea,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, radii, spacing, typography } from "@/styles/tokens";

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
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  function runConfirmedAction() {
    if (confirmAction === "approve") {
      handleApprove();
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "reject") {
      handleReject();
      setConfirmAction(null);
      setIsRejecting(false);
    }
  }

  return (
    <DetailPanelContent>
      <DataState
        isLoading={false}
        isError={false}
        isEmpty={!selectedAbsence}
        loadingLabel=""
        errorLabel=""
        emptyLabel="결강 요청을 선택하세요."
      >
        <PanelContent>
          <DetailBlock>
            <DetailBlockTitle>요청 정보</DetailBlockTitle>
            <List>
              <ListItem>
                <span>제목</span>
                <span>{selectedAbsence?.title ?? "-"}</span>
              </ListItem>
              <ListItem>
                <span>요청자</span>
                <span>{selectedAbsence?.requestedByName ?? "-"}</span>
              </ListItem>
              <ListItem>
                <span>분반</span>
                <span>{selectedAbsence?.classroomName ?? "-"}</span>
              </ListItem>
              <ListItem>
                <span>수업 일자</span>
                <span>{formatAbsenceDate(selectedAbsence?.lessonDate)}</span>
              </ListItem>
              <ListItem>
                <span>요청 일자</span>
                <span>{formatAbsenceDate(selectedAbsence?.createdAt)}</span>
              </ListItem>
              <ListItem>
                <span>상태</span>
                <span>{formatAbsenceStatus(selectedAbsence?.status)}</span>
              </ListItem>
            </List>
          </DetailBlock>

          <DetailBlock>
            <DetailBlockTitle>사유</DetailBlockTitle>
            <DetailTextBox>{selectedAbsence?.reason?.trim() || "-"}</DetailTextBox>
            {selectedAbsence?.status === "REJECTED" ? (
              <DetailBlock>
                <DetailBlockTitle>거절 사유</DetailBlockTitle>
                <DetailNoteBox>{selectedAbsence.note?.trim() || "-"}</DetailNoteBox>
              </DetailBlock>
            ) : null}
          </DetailBlock>

          {!selectedAbsence?.approvalAt ? (
            <ActionBlock>
              <FormGrid onSubmit={(event) => event.preventDefault()}>
                {isRejecting ? (
                  <RejectNoteTextArea
                    value={rejectNote}
                    placeholder="거절 사유를 입력해 주세요."
                    disabled={isActionPending}
                    onChange={(event) => setRejectNote(event.target.value)}
                    autoFocus
                  />
                ) : null}
                <ButtonRow>
                  {isRejecting ? (
                    <>
                      <DangerButton
                        type="button"
                        disabled={isActionPending || !rejectNote.trim()}
                        onClick={() => setConfirmAction("reject")}
                      >
                        확인
                      </DangerButton>
                      <SmallButton
                        type="button"
                        disabled={isActionPending}
                        onClick={() => {
                          setIsRejecting(false);
                          setRejectNote("");
                        }}
                      >
                        취소
                      </SmallButton>
                    </>
                  ) : (
                    <>
                      <AbsenceActionButton
                        type="button"
                        disabled={isActionPending}
                        onClick={() => setConfirmAction("approve")}
                      >
                        승인
                      </AbsenceActionButton>
                      <DangerButton
                        type="button"
                        disabled={isActionPending}
                        onClick={() => setIsRejecting(true)}
                      >
                        거절
                      </DangerButton>
                    </>
                  )}
                </ButtonRow>
              </FormGrid>
            </ActionBlock>
          ) : null}
        </PanelContent>
      </DataState>

      {confirmAction ? (
        <ModalBackdrop onMouseDown={() => setConfirmAction(null)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="absence-action-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="absence-action-confirm-title">결강 요청 처리</ConfirmTitle>
            <ConfirmMessage>
              {confirmAction === "approve" ? "승인하시겠습니까?" : "거절하시겠습니까?"}
            </ConfirmMessage>
            <ButtonRow>
              <AbsenceActionButton type="button" disabled={isActionPending} onClick={runConfirmedAction}>
                확인
              </AbsenceActionButton>
              <SmallButton
                type="button"
                disabled={isActionPending}
                onClick={() => setConfirmAction(null)}
              >
                취소
              </SmallButton>
            </ButtonRow>
          </ConfirmDialog>
        </ModalBackdrop>
      ) : null}
    </DetailPanelContent>
  );
}

const DetailPanelContent = styled.div`
  min-width: 0;
`;

const PanelContent = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const DetailBlock = styled.div`
  display: grid;
  gap: ${spacing.space4};

  ${List} {
    margin: 0;
  }
`;

const ActionBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const DetailBlockTitle = styled.h3`
  margin: 0;
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
  color: #1f2b28;
`;

const RejectNoteTextArea = styled(TextArea)`
  min-height: 6rem;
  resize: none;
  font-weight: 500;
`;

const AbsenceActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
  ({ type }) => ({
    type: type ?? "button",
  }),
)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.375rem;
  border: 1px solid ${colors.point};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  padding: 0 ${spacing.space16};
  color: ${colors.point};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgb(0 0 0 / 42%);
`;

const ConfirmDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 24rem);
  max-height: calc(100vh - 2.5rem);
  overflow-y: auto;
  padding: ${spacing.space20};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 18%);
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const ConfirmMessage = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;
