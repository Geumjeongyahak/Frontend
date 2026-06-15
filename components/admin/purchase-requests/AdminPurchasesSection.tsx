"use client";

import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import styled from "styled-components";
import type { ClassroomListItemDto } from "@/api/classroom/classroom.dto";
import type {
  PaymentType,
  PurchaseRequestListItemDto,
  PurchaseRequestResponseDto,
  PurchaseRequestItemResponseDto,
  PurchaseTransactionResponseDto,
  PurchaseRequestStatus,
} from "@/api/request/request.dto";
import type { VendorResponseDto } from "@/api/vendor/vendor.dto";
import type {
  PurchaseCreateItemState,
  PurchaseCreateState,
} from "@/components/admin/AdminDashboardTypes";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  Label,
  List,
  ListItem,
  SectionCard,
  SectionDescription,
  SectionHeaderRow,
  SectionTitle,
  SmallButton,
  Table,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const PURCHASES_PER_PAGE = 10;

type QueryState<TData> = {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
};

type VoidMutationAction = {
  isPending: boolean;
  mutate: () => void;
};

type PurchaseConfirmAction = "approve" | "reject" | "confirm" | "delete";

type AdminPurchasesSectionProps = {
  classrooms: ClassroomListItemDto[];
  purchases: PurchaseRequestListItemDto[];
  selectedPurchaseId: number | null;
  purchaseStatus: PurchaseRequestStatus | "";
  purchaseSearch: string;
  isPurchaseCreateModalOpen: boolean;
  purchaseCreate: PurchaseCreateState;
  reviewNote: string;
  purchasesQuery: QueryState<unknown>;
  purchaseDetailQuery: QueryState<PurchaseRequestResponseDto>;
  vendorsQuery: QueryState<VendorResponseDto[]>;
  createPurchaseMutation: VoidMutationAction;
  approvePurchaseMutation: VoidMutationAction;
  rejectPurchaseMutation: VoidMutationAction;
  confirmPurchaseMutation: VoidMutationAction;
  deletePurchaseMutation: VoidMutationAction;
  setPurchaseStatus: Dispatch<SetStateAction<PurchaseRequestStatus | "">>;
  setPurchaseSearch: Dispatch<SetStateAction<string>>;
  setIsPurchaseCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setPurchaseCreate: Dispatch<SetStateAction<PurchaseCreateState>>;
  setSelectedPurchaseId: Dispatch<SetStateAction<number | null>>;
  setReviewNote: Dispatch<SetStateAction<string>>;
  emptyPurchaseCreate: PurchaseCreateState;
};

function formatPurchaseStatus(status?: PurchaseRequestStatus) {
  const labels: Record<PurchaseRequestStatus, string> = {
    PENDING: "대기",
    APPROVED: "승인",
    PURCHASED: "구매 완료",
    CONFIRMED: "결제 확인",
    REJECTED: "반려",
  };

  return status ? labels[status] : "-";
}

function formatPaymentType(paymentType?: PaymentType) {
  return paymentType === "PREPAID" ? "선금 결제" : "실 결제";
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toLocaleString("ko-KR")}원`;
}

function formatPurchaseListAmount(item: PurchaseRequestListItemDto) {
  if (item.status !== "PURCHASED" && item.status !== "CONFIRMED") {
    return "-";
  }

  return formatCurrency(item.totalPrice);
}

function createPurchaseItem(): PurchaseCreateItemState {
  return {
    id: `purchase-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemName: "",
    itemQuantity: "1",
    itemReason: "",
    itemPaymentType: "ACTUAL",
  };
}

function getReceiptsForItem(
  item: PurchaseRequestItemResponseDto,
  transactions?: PurchaseTransactionResponseDto[],
) {
  const itemName = item.name?.trim();

  if (!itemName) {
    return [];
  }

  return (transactions ?? []).filter((transaction) =>
    transaction.itemNames?.some((name) => name.trim() === itemName),
  );
}

export function AdminPurchasesSection({
  classrooms,
  purchases,
  selectedPurchaseId,
  purchaseStatus,
  purchaseSearch,
  isPurchaseCreateModalOpen,
  purchaseCreate,
  reviewNote,
  purchasesQuery,
  purchaseDetailQuery,
  vendorsQuery,
  createPurchaseMutation,
  approvePurchaseMutation,
  rejectPurchaseMutation,
  confirmPurchaseMutation,
  deletePurchaseMutation,
  setPurchaseStatus,
  setPurchaseSearch,
  setIsPurchaseCreateModalOpen,
  setPurchaseCreate,
  setSelectedPurchaseId,
  setReviewNote,
  emptyPurchaseCreate,
}: AdminPurchasesSectionProps) {
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<PurchaseConfirmAction | null>(null);
  const [isVendorBalanceModalOpen, setIsVendorBalanceModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const isDetailOpen = selectedPurchaseId !== null;
  const paginationKey = `${purchaseStatus}:${purchaseSearch}`;
  const totalPages = Math.max(1, Math.ceil(purchases.length / PURCHASES_PER_PAGE));
  const requestedPage = pagination.search === paginationKey ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedPurchases = purchases.slice(
    (safeCurrentPage - 1) * PURCHASES_PER_PAGE,
    safeCurrentPage * PURCHASES_PER_PAGE,
  );
  const selectedStatus = purchaseDetailQuery.data?.status;
  const canReviewPurchase = selectedStatus === "PENDING";
  const canConfirmPurchase = selectedStatus === "PURCHASED";
  const canDeletePurchase = selectedStatus === "PENDING";
  const isRejecting = rejectTargetId === selectedPurchaseId && canReviewPurchase;
  const canSubmitRejection =
    isRejecting && reviewNote.trim().length > 0 && !rejectPurchaseMutation.isPending;
  const canSubmitPurchase = Boolean(
    purchaseCreate.title.trim().length > 0 &&
    purchaseCreate.classroomId &&
    purchaseCreate.items.length > 0 &&
    purchaseCreate.items.every((item) => item.itemName.trim().length > 0),
  );
  const confirmMessage = {
    approve: "승인하시겠습니까?",
    reject: "반려하시겠습니까?",
    confirm: "결제 확인하시겠습니까?",
    delete: "삭제하시겠습니까?",
  } satisfies Record<PurchaseConfirmAction, string>;

  function closePurchaseDetail() {
    setSelectedPurchaseId(null);
    setReviewNote("");
    setRejectTargetId(null);
    setConfirmAction(null);
  }

  function openCreateModal() {
    setSelectedPurchaseId(null);
    setReviewNote("");
    setRejectTargetId(null);
    setConfirmAction(null);
    setPurchaseCreate(emptyPurchaseCreate);
    setIsPurchaseCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createPurchaseMutation.isPending) {
      return;
    }

    setIsPurchaseCreateModalOpen(false);
    setPurchaseCreate(emptyPurchaseCreate);
  }

  function selectPurchase(item: PurchaseRequestListItemDto) {
    if (!item.id) {
      return;
    }

    setSelectedPurchaseId(item.id);
    setReviewNote("");
    setRejectTargetId(null);
    setConfirmAction(null);
  }

  function approvePurchase() {
    setReviewNote("");
    setConfirmAction("approve");
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

    setConfirmAction("reject");
  }

  function runConfirmedAction() {
    if (!confirmAction) {
      return;
    }

    if (confirmAction === "approve") {
      approvePurchaseMutation.mutate();
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "reject") {
      rejectPurchaseMutation.mutate();
      setConfirmAction(null);
      setRejectTargetId(null);
      return;
    }

    if (confirmAction === "confirm") {
      confirmPurchaseMutation.mutate();
      setConfirmAction(null);
      return;
    }

    deletePurchaseMutation.mutate();
    setConfirmAction(null);
  }

  function addPurchaseItem() {
    setPurchaseCreate((current) => ({
      ...current,
      items: [...current.items, createPurchaseItem()],
    }));
  }

  function updatePurchaseItem(
    itemId: string,
    field: keyof Omit<PurchaseCreateItemState, "id">,
    value: string,
  ) {
    setPurchaseCreate((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  function removePurchaseItem(itemId: string) {
    setPurchaseCreate((current) => {
      if (current.items.length <= 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter((item) => item.id !== itemId),
      };
    });
  }

  function handlePurchaseListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedPurchaseRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedPurchaseRow) {
      closePurchaseDetail();
    }
  }

  function handlePurchaseSearchChange(value: string) {
    setPurchaseSearch(value);
    setPagination({ page: 1, search: `${purchaseStatus}:${value}` });

    if (isDetailOpen) {
      closePurchaseDetail();
    }
  }

  return (
    <>
      <PurchaseListSection $isPanelOpen={isDetailOpen} onClick={handlePurchaseListSectionClick}>
        <SectionHeaderRow>
          <SectionTitle>결제 요청 목록</SectionTitle>
          <HeaderButtonGroup>
            <SmallButton type="button" onClick={() => setIsVendorBalanceModalOpen(true)}>
              거래처별 잔액 확인
            </SmallButton>
            <SmallButton type="button" onClick={openCreateModal}>
              요청서 작성
            </SmallButton>
          </HeaderButtonGroup>
        </SectionHeaderRow>

        <ControlRow>
          <FilterSelect
            value={purchaseStatus}
            onChange={(event) =>
              setPurchaseStatus(event.target.value as PurchaseRequestStatus | "")
            }
            aria-label="결제 요청 상태 필터"
          >
            <option value="">전체</option>
            <option value="PENDING">대기</option>
            <option value="APPROVED">승인</option>
            <option value="PURCHASED">구매 완료</option>
            <option value="CONFIRMED">결제 확인</option>
            <option value="REJECTED">반려</option>
          </FilterSelect>
          <TextInput
            value={purchaseSearch}
            onChange={(event) => handlePurchaseSearchChange(event.target.value)}
            placeholder="제목, 소속, 요청자, ID 검색"
          />
        </ControlRow>

        <PurchaseListFrame>
          <DataState
            isLoading={purchasesQuery.isLoading}
            isError={purchasesQuery.isError}
            isEmpty={purchases.length === 0}
            loadingLabel="결제 요청 목록 불러오는 중"
            errorLabel="결제 요청 목록을 불러오지 못했습니다."
            emptyLabel="결제 요청이 없습니다."
          >
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제목</th>
                  <th>소속</th>
                  <th>요청자</th>
                  <th>상태</th>
                  <th>결제 금액</th>
                </tr>
              </thead>
              <tbody>
                {pagedPurchases.map((item) => (
                  <tr key={item.id} onClick={() => selectPurchase(item)}>
                    <td>{item.id ?? "-"}</td>
                    <td>{item.title ?? "-"}</td>
                    <td>{item.classroomName ?? "-"}</td>
                    <td>{item.requestedByName ?? "-"}</td>
                    <td>{formatPurchaseStatus(item.status)}</td>
                    <td>{formatPurchaseListAmount(item)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </PurchaseListFrame>

        <Pagination aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setPagination({
                page: Math.max(1, safeCurrentPage - 1),
                search: paginationKey,
              })
            }
          >
            ◀
          </PageArrowButton>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <PageNumberButton
                key={pageNumber}
                type="button"
                $isActive={pageNumber === safeCurrentPage}
                aria-current={pageNumber === safeCurrentPage ? "page" : undefined}
                onClick={() => setPagination({ page: pageNumber, search: paginationKey })}
              >
                {pageNumber}
              </PageNumberButton>
            );
          })}
          <PageArrowButton
            type="button"
            aria-label="다음 페이지"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setPagination({
                page: Math.min(totalPages, safeCurrentPage + 1),
                search: paginationKey,
              })
            }
          >
            ▶
          </PageArrowButton>
        </Pagination>

        {isDetailOpen ? (
          <>
            <PanelBackdrop aria-hidden="true" />
            <SlidePanel aria-label="결제 요청 상세" onClick={(event) => event.stopPropagation()}>
              <PanelHeader>
                <ClosePanelButton
                  type="button"
                  aria-label="결제 요청 상세 닫기"
                  onClick={closePurchaseDetail}
                >
                  <CloseIcon aria-hidden="true" />
                </ClosePanelButton>
                <SectionTitle>결제 요청 상세</SectionTitle>
              </PanelHeader>

              <DataState
                isLoading={purchaseDetailQuery.isLoading}
                isError={purchaseDetailQuery.isError}
                isEmpty={!selectedPurchaseId}
                loadingLabel="결제 요청 상세 불러오는 중"
                errorLabel="결제 요청 상세를 불러오지 못했습니다."
                emptyLabel="결제 요청을 선택하세요."
              >
                <PanelContent>
                  <DetailBlock>
                    <DetailBlockTitle>요청 정보</DetailBlockTitle>
                    <List>
                      <ListItem>
                        <span>제목</span>
                        <span>{purchaseDetailQuery.data?.title ?? "-"}</span>
                      </ListItem>
                      <ListItem>
                        <span>요청자</span>
                        <span>{purchaseDetailQuery.data?.requestedByName ?? "-"}</span>
                      </ListItem>
                      <ListItem>
                        <span>소속</span>
                        <span>{purchaseDetailQuery.data?.classroomName ?? "-"}</span>
                      </ListItem>
                      <ListItem>
                        <span>상태</span>
                        <span>{formatPurchaseStatus(purchaseDetailQuery.data?.status)}</span>
                      </ListItem>
                    </List>
                  </DetailBlock>

                  <DetailBlock>
                    <DetailBlockTitle>품목</DetailBlockTitle>
                    <ItemDetailList>
                      {purchaseDetailQuery.data?.items?.length ? (
                        purchaseDetailQuery.data.items.map((item, index) => {
                          const receipts = getReceiptsForItem(
                            item,
                            purchaseDetailQuery.data?.transactions,
                          );

                          return (
                            <ItemDetailCard key={item.id ?? `item-${index}`}>
                              <ItemDetailHeader>
                                <strong>{item.name ?? `품목 ${index + 1}`}</strong>
                                <span>
                                  {item.quantity ?? 0}개 / {formatPaymentType(item.paymentType)}
                                </span>
                              </ItemDetailHeader>
                              <ItemDetailRow>
                                <span>결제 사유</span>
                                <span>{item.reason?.trim() || "-"}</span>
                              </ItemDetailRow>
                              <ItemDetailRow>
                                <span>구매처</span>
                                <span>
                                  {receipts.length
                                    ? receipts
                                        .map((receipt) => receipt.vendorName)
                                        .filter(Boolean)
                                        .join(", ") || "-"
                                    : "-"}
                                </span>
                              </ItemDetailRow>
                              <ItemDetailRow>
                                <span>영수증</span>
                                <span>
                                  {receipts.length
                                    ? receipts.map((receipt, receiptIndex) =>
                                        receipt.receiptFileUrl ? (
                                          <ReceiptLink
                                            key={receipt.id ?? `receipt-${receiptIndex}`}
                                            href={receipt.receiptFileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            영수증 보기
                                          </ReceiptLink>
                                        ) : (
                                          <span key={receipt.id ?? `receipt-${receiptIndex}`}>
                                            -
                                          </span>
                                        ),
                                      )
                                    : "-"}
                                </span>
                              </ItemDetailRow>
                            </ItemDetailCard>
                          );
                        })
                      ) : (
                        <ItemDetailCard>
                          <ItemDetailHeader>
                            <strong>품목</strong>
                            <span>-</span>
                          </ItemDetailHeader>
                        </ItemDetailCard>
                      )}
                    </ItemDetailList>
                  </DetailBlock>

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
                        <PurchaseActionButton
                          type="button"
                          disabled={!canReviewPurchase || approvePurchaseMutation.isPending}
                          onClick={approvePurchase}
                        >
                          승인
                        </PurchaseActionButton>
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
                          onClick={() => setConfirmAction("confirm")}
                        >
                          결제 확인
                        </SmallButton>
                        <DangerButton
                          type="button"
                          disabled={!canDeletePurchase || deletePurchaseMutation.isPending}
                          onClick={() => setConfirmAction("delete")}
                        >
                          삭제
                        </DangerButton>
                      </ButtonRow>
                    )}
                  </FormGrid>
                </PanelContent>
              </DataState>
            </SlidePanel>
          </>
        ) : null}
      </PurchaseListSection>

      {isPurchaseCreateModalOpen ? (
        <ModalBackdrop onMouseDown={closeCreateModal}>
          <ModalDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-create-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="purchase-create-modal-title">요청서 작성</SectionTitle>
              <SmallButton
                type="button"
                disabled={createPurchaseMutation.isPending}
                onClick={closeCreateModal}
              >
                닫기
              </SmallButton>
            </ModalHeader>
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
                소속
                <PurchaseSelect
                  value={purchaseCreate.classroomId}
                  onChange={(event) =>
                    setPurchaseCreate((current) => ({
                      ...current,
                      classroomId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">소속 선택</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </PurchaseSelect>
              </Label>
              <CreateItemsStack>
                {purchaseCreate.items.map((item, index) => (
                  <CreateItemGroup key={item.id}>
                    <CreateItemTitle>품목 {index + 1}</CreateItemTitle>
                    <Label>
                      품목명
                      <TextInput
                        value={item.itemName}
                        onChange={(event) =>
                          updatePurchaseItem(item.id, "itemName", event.target.value)
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
                        value={item.itemQuantity}
                        onChange={(event) =>
                          updatePurchaseItem(item.id, "itemQuantity", event.target.value)
                        }
                        required
                      />
                    </Label>
                    <Label>
                      구매 사유
                      <TextInput
                        value={item.itemReason}
                        onChange={(event) =>
                          updatePurchaseItem(item.id, "itemReason", event.target.value)
                        }
                      />
                    </Label>
                    <Label>
                      결제 유형
                      <PurchaseSelect
                        value={item.itemPaymentType}
                        onChange={(event) =>
                          updatePurchaseItem(item.id, "itemPaymentType", event.target.value)
                        }
                      >
                        <option value="ACTUAL">실 결제</option>
                        <option value="PREPAID">선금 결제</option>
                      </PurchaseSelect>
                    </Label>
                    {purchaseCreate.items.length > 1 ? (
                      <ItemDeleteRow>
                        <DangerButton type="button" onClick={() => removePurchaseItem(item.id)}>
                          삭제
                        </DangerButton>
                      </ItemDeleteRow>
                    ) : null}
                  </CreateItemGroup>
                ))}
              </CreateItemsStack>
              <ButtonRow>
                <PurchaseActionButton
                  type="submit"
                  disabled={createPurchaseMutation.isPending || !canSubmitPurchase}
                >
                  작성
                </PurchaseActionButton>
                <SmallButton
                  type="button"
                  disabled={createPurchaseMutation.isPending}
                  onClick={addPurchaseItem}
                >
                  품목 추가
                </SmallButton>
                <SmallButton
                  type="button"
                  disabled={createPurchaseMutation.isPending}
                  onClick={closeCreateModal}
                >
                  취소
                </SmallButton>
              </ButtonRow>
            </FormGrid>
          </ModalDialog>
        </ModalBackdrop>
      ) : null}

      {confirmAction ? (
        <ModalBackdrop onMouseDown={() => setConfirmAction(null)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-action-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="purchase-action-confirm-title">결제 요청 처리</ConfirmTitle>
            <ConfirmMessage>{confirmMessage[confirmAction]}</ConfirmMessage>
            <ButtonRow>
              <PurchaseActionButton
                type="button"
                disabled={
                  approvePurchaseMutation.isPending ||
                  rejectPurchaseMutation.isPending ||
                  confirmPurchaseMutation.isPending ||
                  deletePurchaseMutation.isPending
                }
                onClick={runConfirmedAction}
              >
                확인
              </PurchaseActionButton>
              <SmallButton
                type="button"
                disabled={
                  approvePurchaseMutation.isPending ||
                  rejectPurchaseMutation.isPending ||
                  confirmPurchaseMutation.isPending ||
                  deletePurchaseMutation.isPending
                }
                onClick={() => setConfirmAction(null)}
              >
                취소
              </SmallButton>
            </ButtonRow>
          </ConfirmDialog>
        </ModalBackdrop>
      ) : null}

      {isVendorBalanceModalOpen ? (
        <ModalBackdrop onMouseDown={() => setIsVendorBalanceModalOpen(false)}>
          <VendorBalanceDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendor-balance-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <SectionTitle id="vendor-balance-modal-title">현재 거래처별 잔액</SectionTitle>
              <SmallButton type="button" onClick={() => setIsVendorBalanceModalOpen(false)}>
                닫기
              </SmallButton>
            </ModalHeader>
            <DataState
              isLoading={vendorsQuery.isLoading}
              isError={vendorsQuery.isError}
              isEmpty={!vendorsQuery.data?.length}
              loadingLabel="거래처 잔액 불러오는 중"
              errorLabel="거래처 잔액을 불러오지 못했습니다."
              emptyLabel="거래처 정보가 없습니다."
              compact
            >
              <VendorBalanceTable>
                <tbody>
                  {vendorsQuery.data?.map((vendor) => (
                    <tr key={vendor.id ?? vendor.name}>
                      <th scope="row">{vendor.name ?? "-"}</th>
                      <td>{formatCurrency(vendor.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </VendorBalanceTable>
            </DataState>
          </VendorBalanceDialog>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

const PurchaseListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const HeaderButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space8};
`;

const PurchaseListFrame = styled.div`
  position: relative;
  min-height: 22.35rem;
  border-radius: 0.5rem;

  @media (min-width: 120rem) {
    min-height: 22.5rem;
  }
`;

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: ${spacing.space16};
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
    margin-top: ${spacing.space28};
    font-size: ${typography.fontSize16};
  }
`;

const PageArrowButton = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const PageNumberButton = styled.button<{ $isActive?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  color: ${({ $isActive }) => ($isActive ? "#111" : "#9a9a9a")};
  font: inherit;
  font-size: ${typography.fontSize16};
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const PanelBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: rgba(17, 24, 39, 0.18);
  pointer-events: none;
  animation: fadePurchasePanelBackdropIn 0.18s ease-out both;

  @keyframes fadePurchasePanelBackdropIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const SlidePanel = styled.aside`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
  display: grid;
  align-content: start;
  gap: ${spacing.space12};
  width: 75%;
  max-height: 100%;
  min-height: 100%;
  overflow-y: auto;
  border-left: 1px solid #e6e9e7;
  background-color: ${colors.white};
  padding: 1.25rem 1rem;
  box-shadow: -1rem 0 2rem rgba(17, 24, 39, 0.12);
  animation: slidePurchasePanelIn 0.22s ease-out both;

  @keyframes slidePurchasePanelIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (min-width: 120rem) {
    padding: 2rem 1.75rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 88%;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

const CloseIcon = styled.span`
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  background-color: currentColor;
  mask: url("/chevron_right.svg") center / contain no-repeat;
  -webkit-mask: url("/chevron_right.svg") center / contain no-repeat;
`;

const ClosePanelButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #1f2b28;
  cursor: pointer;

  &:hover {
    background-color: #f5fff0;
    color: #5eb63a;
  }
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

const DetailBlockTitle = styled.h3`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const ItemDetailList = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const ItemDetailCard = styled.div`
  display: grid;
  gap: ${spacing.space8};
  padding: ${spacing.space8};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  background-color: ${colors.white};
`;

const ItemDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.space12};
  color: #1f2b28;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  strong {
    font-weight: 800;
  }

  span {
    color: #64706c;
    font-weight: 700;
  }
`;

const ItemDetailRow = styled.div`
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: ${spacing.space8};
  color: #1f2b28;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  > span:first-child {
    color: #64706c;
    font-weight: 800;
  }

  > span:last-child {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${spacing.space8};
    text-align: right;
    word-break: keep-all;
  }
`;

const CreateItemsStack = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const CreateItemGroup = styled.div`
  display: grid;
  gap: ${spacing.space12};
  padding: ${spacing.space12};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  background-color: #fbfcfb;
`;

const CreateItemTitle = styled.h3`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const ItemDeleteRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const selectBase = `
  width: 100%;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 ${spacing.space12};
  background-color: ${colors.white};
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  appearance: none;
  outline: none;

  &:focus {
    border-color: ${colors.point};
  }

  &:disabled {
    opacity: 1;
    color: #64706c;
    background-color: ${colors.white};
  }
`;

const FilterSelect = styled.select`
  ${selectBase}
  width: 9.5rem;
  min-width: 9.5rem;
  max-width: 9.5rem;
  flex: 0 0 9.5rem;
  height: 2.375rem;
  min-height: 2.375rem;
`;

const PurchaseSelect = styled.select`
  ${selectBase}
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

const ModalDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 32rem);
  max-height: calc(100vh - 2.5rem);
  overflow-y: auto;
  padding: ${spacing.space20};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 18%);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space16};

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

const ConfirmDialog = styled(ModalDialog)`
  width: min(100%, 24rem);
`;

const VendorBalanceDialog = styled(ModalDialog)`
  width: min(100%, 48rem);
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

const VendorBalanceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #cfd6d2;
  table-layout: fixed;

  th,
  td {
    width: 50%;
    padding: ${spacing.space12};
    border: 1px solid #cfd6d2;
    color: #000000;
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight130};
  }

  th {
    background-color: #fbfcfb;
    font-weight: 700;
    text-align: left;
  }

  td {
    font-weight: 700;
    text-align: right;
  }
`;

const PurchaseActionButton = styled.button.attrs<{ type?: "button" | "submit" | "reset" }>(
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

  @media (min-width: 120rem) {
    min-height: 2.375rem;
    padding: 0 ${spacing.space16};
    font-size: ${typography.fontSize14};
  }
`;

const ReceiptLink = styled.a`
  color: ${colors.point};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;
