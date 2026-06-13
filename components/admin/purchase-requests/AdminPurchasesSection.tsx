"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import styled from "styled-components";
import type { ClassroomListItemDto } from "@/api/classroom/classroom.dto";
import type {
  PurchaseRequestListItemDto,
  PurchaseRequestResponseDto,
  PurchaseRequestStatus,
} from "@/api/request/request.dto";
import type { PurchaseCreateState } from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  Label,
  List,
  ListItem,
  MetaGrid,
  MetaItem,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextArea,
  TextInput,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, spacing } from "@/styles/tokens";

type QueryState<TData> = {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
};

type VoidMutationAction = {
  isPending: boolean;
  mutate: () => void;
};

type AdminPurchasesSectionProps = {
  classrooms: ClassroomListItemDto[];
  purchases: PurchaseRequestListItemDto[];
  selectedPurchaseId: number | null;
  purchaseStatus: PurchaseRequestStatus | "";
  purchaseCreate: PurchaseCreateState;
  reviewNote: string;
  purchasesQuery: QueryState<unknown>;
  purchaseDetailQuery: QueryState<PurchaseRequestResponseDto>;
  createPurchaseMutation: VoidMutationAction;
  approvePurchaseMutation: VoidMutationAction;
  rejectPurchaseMutation: VoidMutationAction;
  confirmPurchaseMutation: VoidMutationAction;
  deletePurchaseMutation: VoidMutationAction;
  setPurchaseStatus: Dispatch<SetStateAction<PurchaseRequestStatus | "">>;
  setPurchaseCreate: Dispatch<SetStateAction<PurchaseCreateState>>;
  setSelectedPurchaseId: Dispatch<SetStateAction<number | null>>;
  setReviewNote: Dispatch<SetStateAction<string>>;
};

export function AdminPurchasesSection({
  classrooms,
  purchases,
  selectedPurchaseId,
  purchaseStatus,
  purchaseCreate,
  reviewNote,
  purchasesQuery,
  purchaseDetailQuery,
  createPurchaseMutation,
  approvePurchaseMutation,
  rejectPurchaseMutation,
  confirmPurchaseMutation,
  deletePurchaseMutation,
  setPurchaseStatus,
  setPurchaseCreate,
  setSelectedPurchaseId,
  setReviewNote,
}: AdminPurchasesSectionProps) {
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const selectedStatus = purchaseDetailQuery.data?.status;
  const canReviewPurchase = selectedStatus === "PENDING";
  const canConfirmPurchase = selectedStatus === "PURCHASED";
  const canDeletePurchase = selectedStatus === "PENDING";
  const isRejecting = rejectTargetId === selectedPurchaseId && canReviewPurchase;
  const canSubmitRejection =
    isRejecting && reviewNote.trim().length > 0 && !rejectPurchaseMutation.isPending;
  const canShowReceiptRows = selectedStatus === "PURCHASED" || selectedStatus === "CONFIRMED";
  const receiptRows =
    purchaseDetailQuery.data?.transactions?.map((transaction, index) => ({
      id: transaction.id ?? index,
      label: transaction.itemNames?.join(", ") || "영수증",
      url: transaction.receiptFileUrl,
    })) ?? [];

  function approvePurchase() {
    setReviewNote("");
    approvePurchaseMutation.mutate();
  }

  function startRejecting() {
    if (!selectedPurchaseId || !canReviewPurchase) {
      return;
    }

    setReviewNote("");
    setRejectTargetId(selectedPurchaseId);
  }

  function cancelRejecting() {
    setReviewNote("");
    setRejectTargetId(null);
  }

  function submitRejection() {
    if (!canSubmitRejection) {
      return;
    }

    rejectPurchaseMutation.mutate();
    setRejectTargetId(null);
  }

  return (
    <>
      <SectionCard>
        <SectionTitle>구매 요청 작성</SectionTitle>
        <FormGrid
          onSubmit={(event) => {
            event.preventDefault();
            createPurchaseMutation.mutate();
          }}
        >
          <Label>
            제목
            <TextInput
              value={purchaseCreate.title}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            내용
            <TextArea
              value={purchaseCreate.content}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, content: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            분반
            <Select
              value={purchaseCreate.classroomId}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, classroomId: event.target.value }))
              }
              required
            >
              <option value="">분반 선택</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            품목명
            <TextInput
              value={purchaseCreate.itemName}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, itemName: event.target.value }))
              }
              required
            />
          </Label>
          <Label>
            수량
            <TextInput
              type="number"
              min="1"
              step="1"
              value={purchaseCreate.itemQuantity}
              onChange={(event) =>
                setPurchaseCreate((current) => ({
                  ...current,
                  itemQuantity: event.target.value,
                }))
              }
              required
            />
          </Label>
          <Label>
            구매 사유
            <TextInput
              value={purchaseCreate.itemReason}
              onChange={(event) =>
                setPurchaseCreate((current) => ({ ...current, itemReason: event.target.value }))
              }
            />
          </Label>
          <Label>
            결제 유형
            <Select
              value={purchaseCreate.itemPaymentType}
              onChange={(event) =>
                setPurchaseCreate((current) => ({
                  ...current,
                  itemPaymentType: event.target.value as PurchaseCreateState["itemPaymentType"],
                }))
              }
            >
              <option value="ACTUAL">실 결제</option>
              <option value="PREPAID">선금 결제</option>
            </Select>
          </Label>
          <PrimaryButton disabled={createPurchaseMutation.isPending || !purchaseCreate.classroomId}>
            구매 요청 작성
          </PrimaryButton>
        </FormGrid>
      </SectionCard>
      <TwoColumnGrid>
        <SectionCard>
          <SectionTitle>구매 요청 목록</SectionTitle>
          <ControlRow>
            <Select
              value={purchaseStatus}
              onChange={(event) =>
                setPurchaseStatus(event.target.value as PurchaseRequestStatus | "")
              }
            >
              <option value="">전체</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PURCHASED">PURCHASED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>
          </ControlRow>
          <DataState
            isLoading={purchasesQuery.isLoading}
            isError={purchasesQuery.isError}
            isEmpty={purchases.length === 0}
            loadingLabel="구매 요청 목록 불러오는 중"
            errorLabel="구매 요청 목록을 불러오지 못했습니다."
            emptyLabel="구매 요청이 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>분반</th>
                  <th>요청자</th>
                  <th>상태</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((item) => (
                  <tr key={item.id} onClick={() => item.id && setSelectedPurchaseId(item.id)}>
                    <td>{item.title}</td>
                    <td>{item.classroomName}</td>
                    <td>{item.requestedByName}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.status === "PENDING" ||
                      item.status === "REJECTED" ||
                      item.status === "APPROVED"
                        ? "-"
                        : (item.totalPrice ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </SectionCard>
        <SectionCard>
          <SectionTitle>구매 요청 상세</SectionTitle>
          <DataState
            isLoading={purchaseDetailQuery.isLoading}
            isError={purchaseDetailQuery.isError}
            isEmpty={!selectedPurchaseId}
            loadingLabel="구매 요청 상세 불러오는 중"
            errorLabel="구매 요청 상세를 불러오지 못했습니다."
            emptyLabel="구매 요청을 선택하세요."
          >
            <MetaGrid>
              <MetaItem>제목: {purchaseDetailQuery.data?.title}</MetaItem>
              <MetaItem>상태: {purchaseDetailQuery.data?.status}</MetaItem>
              <MetaItem>요청자: {purchaseDetailQuery.data?.requestedByName}</MetaItem>
              <MetaItem>분반: {purchaseDetailQuery.data?.classroomName}</MetaItem>
            </MetaGrid>
            <List>
              {purchaseDetailQuery.data?.items?.map((item) => (
                <ListItem key={item.id}>
                  <span>{item.name}</span>
                  <span>
                    {item.quantity ?? 0}개 /{" "}
                    {item.paymentType === "PREPAID" ? "선금 결제" : "실 결제"}
                  </span>
                </ListItem>
              ))}
              {canShowReceiptRows && receiptRows.length
                ? receiptRows.map((receipt) => (
                    <ListItem key={`receipt-${receipt.id}`}>
                      <span>영수증</span>
                      <span>
                        {receipt.url ? (
                          <ReceiptLink href={receipt.url} target="_blank" rel="noreferrer">
                            영수증 보기
                          </ReceiptLink>
                        ) : (
                          "-"
                        )}
                      </span>
                    </ListItem>
                  ))
                : null}
              {canShowReceiptRows && receiptRows.length === 0 ? (
                <ListItem>
                  <span>영수증</span>
                  <span>-</span>
                </ListItem>
              ) : null}
            </List>
            {purchaseDetailQuery.data?.status === "REJECTED" ? (
              <SectionDescription>
                반려 사유: {purchaseDetailQuery.data.note?.trim() || "-"}
              </SectionDescription>
            ) : null}
            <FormGrid onSubmit={(event) => event.preventDefault()}>
              {isRejecting ? (
                <>
                  <Label>
                    반려 사유
                    <TextInput
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      autoFocus
                    />
                  </Label>
                  <ButtonRow>
                    <DangerButton
                      type="button"
                      disabled={!canSubmitRejection}
                      onClick={submitRejection}
                    >
                      확인
                    </DangerButton>
                    <SmallButton
                      type="button"
                      disabled={rejectPurchaseMutation.isPending}
                      onClick={cancelRejecting}
                    >
                      취소
                    </SmallButton>
                  </ButtonRow>
                </>
              ) : (
                <ButtonRow>
                  <ApproveButton
                    type="button"
                    disabled={!canReviewPurchase || approvePurchaseMutation.isPending}
                    onClick={approvePurchase}
                  >
                    승인
                  </ApproveButton>
                  <DangerButton
                    type="button"
                    disabled={!canReviewPurchase || rejectPurchaseMutation.isPending}
                    onClick={startRejecting}
                  >
                    반려
                  </DangerButton>
                  <SmallButton
                    type="button"
                    disabled={!canConfirmPurchase || confirmPurchaseMutation.isPending}
                    onClick={() => confirmPurchaseMutation.mutate()}
                  >
                    결재 확인
                  </SmallButton>
                  <DangerButton
                    type="button"
                    disabled={!canDeletePurchase || deletePurchaseMutation.isPending}
                    onClick={() => deletePurchaseMutation.mutate()}
                  >
                    삭제
                  </DangerButton>
                </ButtonRow>
              )}
            </FormGrid>
          </DataState>
        </SectionCard>
      </TwoColumnGrid>
    </>
  );
}

const ApproveButton = styled.button`
  min-height: 2.375rem;
  border: 1px solid ${colors.point};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  padding: 0 ${spacing.space16};
  color: ${colors.point};
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const ReceiptLink = styled.a`
  color: ${colors.point};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;
