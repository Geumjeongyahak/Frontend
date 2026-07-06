"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import { uploadPurchaseItemImage } from "@/api/file/file.api";
import { getClassrooms } from "@/api/classroom/classroom.api";
import {
  createPurchaseRequest,
  getPurchaseRequestDetail,
  getPurchaseRequests,
  reportPurchase,
  updatePurchaseItemReceipts,
} from "@/api/request/request.api";
import type {
  CreatePurchaseRequestDto,
  PaymentType,
  PurchaseRequestItemDto,
  PurchaseRequestItemResponseDto,
  PurchaseRequestResponseDto,
} from "@/api/request/request.dto";
import { getVendors } from "@/api/vendor/vendor.api";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import MobileRequestShell from "@/pwa/requests/components/MobileRequestShell";
import RequestStatusBadge from "@/pwa/requests/components/RequestStatusBadge";
import { buildPurchaseRequestContent } from "@/pwa/requests/requestFormUtils";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceItemForm = {
  id: number;
  name: string;
  quantity: string;
  reason: string;
  paymentType: PaymentType;
};

type RequestViewMode = "mine" | "all";

type ReportItem = {
  itemId: number;
  vendorId: string;
  name: string;
  price: string;
  receiptFile: File | null;
  receiptFileName: string;
  receiptFileId?: string;
  receiptFileUrl?: string;
};

type VendorBalanceItem = {
  id?: number;
  name: string;
  balance?: number;
};

const fallbackVendorNames = ["예소디자인", "목민서관", "지성문구", "마트"] as const;

const initialItem: FinanceItemForm = {
  id: 1,
  name: "",
  quantity: "1",
  reason: "",
  paymentType: "ACTUAL",
};
const REQUESTS_PER_PAGE = 10;

function getRequestTime(createdAt?: string) {
  if (!createdAt) return 0;

  const time = new Date(createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function buildPageTokens(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function getReceiptName(receipt: {
  fileName?: string;
  originalName?: string;
  ext?: string;
  fileId?: string;
  receiptFileId?: string;
}) {
  if (receipt.fileName) {
    return receipt.fileName;
  }

  if (!receipt.originalName) {
    return receipt.fileId ?? receipt.receiptFileId ?? "영수증";
  }

  return receipt.ext && !receipt.originalName.endsWith(`.${receipt.ext}`)
    ? `${receipt.originalName}.${receipt.ext}`
    : receipt.originalName;
}

function formatReceiptDisplayLabel(value?: string) {
  if (!value) {
    return "영수증 첨부";
  }

  const extensionMatch = value.match(/\.([a-z0-9]+)$/i);
  return extensionMatch ? `영수증.${extensionMatch[1].toLowerCase()}` : "영수증";
}

function findPurchaseItemForTransaction(
  transactionItemNames?: string[],
  items?: PurchaseRequestItemResponseDto[],
) {
  return items?.find((item) => {
    if (!item.name) {
      return false;
    }

    return transactionItemNames?.some((name) => name.trim() === item.name);
  });
}

function mapPurchaseItemsToReportItems(purchase?: PurchaseRequestResponseDto): ReportItem[] {
  if (purchase?.transactions?.length) {
    return purchase.transactions.map((transaction, index) => {
      const item = findPurchaseItemForTransaction(transaction.itemNames, purchase.items);

      return {
        itemId: transaction.id ?? item?.id ?? index + 1,
        vendorId: typeof transaction.vendorId === "number" ? String(transaction.vendorId) : "",
        name: transaction.itemNames?.join(", ") || item?.name || "",
        price: typeof transaction.amount === "number" ? String(transaction.amount) : "",
        receiptFile: null,
        receiptFileName:
          transaction.receiptFileId || transaction.receiptFileUrl
            ? getReceiptName({ receiptFileId: transaction.receiptFileId })
            : "",
        receiptFileId: transaction.receiptFileId,
        receiptFileUrl: transaction.receiptFileUrl,
      };
    });
  }

  return (purchase?.items ?? [])
    .filter((item) => typeof item.id === "number")
    .map((item) => ({
      itemId: item.id ?? 0,
      vendorId: "",
      name: item.name ?? "",
      price: "",
      receiptFile: null,
      receiptFileName: "",
    }));
}

export default function MobilePaymentRequestsPage() {
  const queryClient = useQueryClient();
  const { status, user, refreshSession } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());
  const isAuthPending = status === "loading" || (status === "error" && hasStoredToken);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [affiliationValue, setAffiliationValue] = useState("");
  const [items, setItems] = useState<FinanceItemForm[]>([initialItem]);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [isReportEditing, setIsReportEditing] = useState(false);
  const [viewMode, setViewMode] = useState<RequestViewMode>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const purchaseListParams = {
    mine: viewMode === "mine" ? true : undefined,
    keyword: searchKeyword.trim() || undefined,
    page: currentPage - 1,
    size: REQUESTS_PER_PAGE,
  };

  const purchaseListQuery = useQuery({
    queryKey: [...queryKeys.requests.purchaseList(purchaseListParams), "mobile"],
    queryFn: () => getPurchaseRequests(purchaseListParams),
    placeholderData: (previousData) => previousData,
    enabled: isAuthenticated,
    retry: false,
  });

  const myPurchaseCountQuery = useQuery({
    queryKey: [
      ...queryKeys.requests.purchaseList({ mine: true, page: 0, size: 1 }),
      "mobile",
      "mine-count",
    ],
    queryFn: () =>
      getPurchaseRequests({
        mine: true,
        page: 0,
        size: 1,
      }),
    enabled: isAuthenticated,
    retry: false,
  });

  const purchaseDetailQuery = useQuery({
    queryKey: queryKeys.requests.purchaseDetail(selectedRequestId ?? 0),
    queryFn: () => getPurchaseRequestDetail({ requestId: selectedRequestId as number }),
    enabled: isAuthenticated && typeof selectedRequestId === "number",
    retry: false,
  });

  const classroomsQuery = useQuery({
    queryKey: [...queryKeys.classrooms.list(), "payment-mobile"],
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    enabled: isAuthenticated,
    retry: false,
  });

  const vendorsQuery = useQuery({
    queryKey: [...queryKeys.vendors.list(), "payment-mobile"],
    queryFn: () => getVendors(),
    enabled: isAuthenticated,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreatePurchaseRequestDto) => createPurchaseRequest(body),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.purchaseList(),
      });
      toast.success("결제 신청서를 제출했습니다.");
      setShowComposer(false);
      setTitle("");
      setAffiliationValue("");
      setItems([initialItem]);
      setCurrentPage(1);

      if (typeof created.id === "number") {
        setSelectedRequestId(created.id);
      }
    },
    onError: () => {
      toast.error("결제 신청서 제출에 실패했습니다.");
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const activeDetail = purchaseDetailQuery.data;
      const activeReportItems = reportItems.length ? reportItems : initialReportItems;

      if (!activeDetail || !selectedRequestId) {
        throw new Error("보고할 결제 신청 상세가 없습니다.");
      }

      const uploadedReceiptIds = await Promise.all(
        activeReportItems.map(async (item) => {
          if (!item.receiptFile) {
            return null;
          }

          const uploaded = await uploadPurchaseItemImage(item.receiptFile, item.receiptFile.name);
          return uploaded.fileId ?? null;
        }),
      );

      const body = {
        transactions: activeReportItems.map((item, index) => ({
          vendorId: Number(item.vendorId),
          itemNames: item.name
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean),
          amount: Number(item.price),
          ...(uploadedReceiptIds[index] || item.receiptFileId
            ? { receiptFileId: uploadedReceiptIds[index] ?? item.receiptFileId }
            : {}),
        })),
      };

      if (activeDetail.status === "PURCHASED") {
        return updatePurchaseItemReceipts({ requestId: selectedRequestId }, body);
      }

      return reportPurchase({ requestId: selectedRequestId }, body);
    },
    onSuccess: async () => {
      setIsReportEditing(false);
      setReportItems([]);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.purchaseDetail(selectedRequestId ?? 0),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.purchaseList(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.list(),
      });
      toast.success("구매 보고를 저장했습니다.");
    },
    onError: () => {
      toast.error("구매 보고 저장에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (status === "error" && hasStoredToken) {
      refreshSession().catch(() => undefined);
    }
  }, [hasStoredToken, refreshSession, status]);

  const requests = [...(purchaseListQuery.data?.content ?? [])].sort(
    (left, right) => getRequestTime(right.createdAt) - getRequestTime(left.createdAt),
  );
  const totalPages = Math.max(1, purchaseListQuery.data?.totalPages ?? 1);
  const pageTokens = buildPageTokens(currentPage, totalPages);
  const classrooms = classroomsQuery.data?.content ?? [];
  const affiliationOptions = classrooms
    .filter((classroom) => typeof classroom.id === "number")
    .map((classroom) => ({
      id: classroom.id as number,
      label: classroom.name ?? `반 ${classroom.id}`,
      value: `classroom:${classroom.id}`,
    }));
  const selectedAffiliation = affiliationOptions.find(
    (option) => option.value === affiliationValue,
  );
  const vendorBalances: VendorBalanceItem[] =
    vendorsQuery.data?.length && vendorsQuery.data.length > 0
      ? vendorsQuery.data.map((vendor) => ({
          id: vendor.id,
          name: vendor.name ?? "-",
          balance: vendor.balance,
        }))
      : fallbackVendorNames.map((name) => ({ id: undefined, name, balance: undefined }));
  const vendorOptions = vendorBalances
    .filter((vendor) => typeof vendor.id === "number" && vendor.name !== "-")
    .map((vendor) => ({
      id: vendor.id as number,
      name: vendor.name,
    }));
  const initialReportItems = mapPurchaseItemsToReportItems(purchaseDetailQuery.data);
  const activeReportItems = reportItems.length ? reportItems : initialReportItems;
  const canSubmitReport =
    isReportEditing &&
    activeReportItems.length > 0 &&
    activeReportItems.every(
      (item) =>
        Number.isInteger(Number(item.vendorId)) &&
        item.name.trim().length > 0 &&
        item.price.trim().length > 0 &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 1,
    ) &&
    !reportMutation.isPending;

  const normalizedItems: PurchaseRequestItemDto[] = items
    .map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity.trim().length > 0 ? Number(item.quantity) : Number.NaN,
      reason: item.reason.trim() || undefined,
      paymentType: "ACTUAL" as PaymentType,
    }))
    .filter((item) => item.name.length > 0);

  const canSubmit =
    title.trim().length > 0 &&
    Boolean(selectedAffiliation) &&
    normalizedItems.length > 0 &&
    !normalizedItems.some(
      (item) =>
        !Number.isInteger(item.quantity) || Number.isNaN(item.quantity) || item.quantity < 1,
    ) &&
    !createMutation.isPending;

  const applicantName = user?.name ?? user?.nickname ?? user?.email ?? "교원";

  function updateItem(itemId: number, patch: Partial<FinanceItemForm>) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { ...initialItem, id: Math.max(...current.map((item) => item.id)) + 1 },
    ]);
  }

  function removeItem(itemId: number) {
    setItems((current) => {
      if (current.length <= 1) {
        return [{ ...initialItem, id: current[0]?.id ?? 1 }];
      }

      return current.filter((item) => item.id !== itemId);
    });
  }

  function handleSelectRequest(requestId?: number) {
    if (typeof requestId !== "number") {
      return;
    }

    setIsReportEditing(false);
    setReportItems([]);
    setSelectedRequestId((current) => (current === requestId ? null : requestId));
  }

  function handleChangeViewMode(nextMode: RequestViewMode) {
    setSelectedRequestId(null);
    setViewMode(nextMode);
    setCurrentPage(1);
  }

  function handleChangePage(nextPage: number) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setSelectedRequestId(null);
    setCurrentPage(safePage);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedRequestId(null);
    setCurrentPage(1);
    setSearchKeyword(searchInput.trim());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || !selectedAffiliation) {
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      content: buildPurchaseRequestContent({
        classroomName: selectedAffiliation.label,
        applicantName,
        items: normalizedItems,
      }),
      classroomId: selectedAffiliation.id,
      items: normalizedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        reason: item.reason,
        paymentType: item.paymentType,
      })),
    });
  }

  function startReportEditing() {
    setReportItems(mapPurchaseItemsToReportItems(purchaseDetailQuery.data));
    setIsReportEditing(true);
  }

  function cancelReportEditing() {
    setReportItems([]);
    setIsReportEditing(false);
  }

  function updateReportItem(
    itemId: number,
    patch: Partial<{
      vendorId: string;
      name: string;
      price: string;
      receiptFile: File | null;
      receiptFileName: string;
      receiptFileId: string;
      receiptFileUrl: string;
    }>,
  ) {
    setReportItems((current) =>
      (current.length ? current : initialReportItems).map((item) =>
        item.itemId === itemId ? { ...item, ...patch } : item,
      ),
    );
  }

  function handleReceiptChange(itemId: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    updateReportItem(itemId, {
      receiptFile: file,
      receiptFileName: file?.name ?? "",
    });
  }

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitReport) {
      return;
    }

    reportMutation.mutate();
  }

  return (
    <MobileRequestShell
      backHref="/"
      title="결제 신청"
      action={
        <HeaderActionButton
          type="button"
          onClick={() => setShowComposer((current) => !current)}
          disabled={!isAuthenticated}
        >
          <IconPlus size={18} stroke={2.1} />
          <span>{showComposer ? "닫기" : "작성"}</span>
        </HeaderActionButton>
      }
    >
      {isAuthPending ? (
        <LoadingPanel>
          <AuthStatusSpinner />
          <LoadingText>로그인 상태를 확인하는 중입니다.</LoadingText>
        </LoadingPanel>
      ) : null}

      {!isAuthPending && !isAuthenticated ? (
        <StatePanel>
          <StateTitle>로그인이 필요한 메뉴입니다.</StateTitle>
          <StateDescription>
            교원 계정으로 로그인하면 신청서 작성과 내역 조회를 이용할 수 있습니다.
          </StateDescription>
          <PrimaryLink href="/login">로그인하기</PrimaryLink>
        </StatePanel>
      ) : null}

      {isAuthenticated ? (
        <>
          <SummaryPanel>
            <SummaryCard>
              <SummaryLabel>나의 결제 신청</SummaryLabel>
              <SummaryValue>
                {myPurchaseCountQuery.isLoading
                  ? "-"
                  : (myPurchaseCountQuery.data?.totalElements ?? 0)}
              </SummaryValue>
            </SummaryCard>
          </SummaryPanel>

          {showComposer ? (
            <ComposerPanel>
              <PanelTitle>새 결제 신청서</PanelTitle>
              <PanelNote>선금 결제 요청은 PC에서만 가능합니다.</PanelNote>
              <Form onSubmit={handleSubmit}>
                <FieldGroup>
                  <FieldLabel htmlFor="mobile-payment-title">제목</FieldLabel>
                  <TextInput
                    id="mobile-payment-title"
                    placeholder="예: 7월 학급 교구 구매"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </FieldGroup>

                <TwoColumn>
                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-payment-classroom">소속</FieldLabel>
                    <Select
                      id="mobile-payment-classroom"
                      value={affiliationValue}
                      onChange={(event) => setAffiliationValue(event.target.value)}
                    >
                      <option value="">반을 선택해 주세요</option>
                      {affiliationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-payment-applicant">신청자</FieldLabel>
                    <ReadOnlyInput id="mobile-payment-applicant" value={applicantName} readOnly />
                  </FieldGroup>
                </TwoColumn>

                <FieldGroup>
                  <FieldLabel htmlFor="mobile-payment-type">결제 유형</FieldLabel>
                  <ReadOnlyInput id="mobile-payment-type" value="실 결제" readOnly />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>거래처 잔액</FieldLabel>
                  <VendorGrid>
                    {vendorBalances.map((vendor) => (
                      <VendorCard key={vendor.name}>
                        <span>{vendor.name}</span>
                        <strong>
                          {typeof vendor.balance === "number"
                            ? `${vendor.balance.toLocaleString()}원`
                            : "-"}
                        </strong>
                      </VendorCard>
                    ))}
                  </VendorGrid>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>품목</FieldLabel>
                  <ItemStack>
                    {items.map((item, index) => (
                      <ItemCard key={item.id}>
                        <ItemCardHeader>
                          <strong>{items.length > 1 ? `품목 ${index + 1}` : "품목"}</strong>
                          {items.length > 1 ? (
                            <InlineMutedButton type="button" onClick={() => removeItem(item.id)}>
                              삭제
                            </InlineMutedButton>
                          ) : null}
                        </ItemCardHeader>

                        <FieldGroup>
                          <FieldLabel htmlFor={`payment-item-name-${item.id}`}>품목명</FieldLabel>
                          <TextInput
                            id={`payment-item-name-${item.id}`}
                            placeholder="예: 공책"
                            value={item.name}
                            onChange={(event) => updateItem(item.id, { name: event.target.value })}
                          />
                        </FieldGroup>

                        <TwoColumn>
                          <FieldGroup>
                            <FieldLabel htmlFor={`payment-item-quantity-${item.id}`}>
                              수량
                            </FieldLabel>
                            <TextInput
                              id={`payment-item-quantity-${item.id}`}
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(item.id, { quantity: event.target.value })
                              }
                            />
                          </FieldGroup>
                          <FieldGroup>
                            <FieldLabel htmlFor={`payment-item-reason-${item.id}`}>사유</FieldLabel>
                            <TextInput
                              id={`payment-item-reason-${item.id}`}
                              placeholder="선택 입력"
                              value={item.reason}
                              onChange={(event) =>
                                updateItem(item.id, { reason: event.target.value })
                              }
                            />
                          </FieldGroup>
                        </TwoColumn>

                      </ItemCard>
                    ))}
                  </ItemStack>

                  <SecondaryButton type="button" onClick={addItem}>
                    품목 추가하기
                  </SecondaryButton>
                </FieldGroup>

                <PrimaryButton type="submit" disabled={!canSubmit}>
                  {createMutation.isPending ? "제출 중..." : "결제 신청서 제출"}
                </PrimaryButton>
              </Form>
            </ComposerPanel>
          ) : null}

          <Panel>
            <PanelHeader>
              <PanelTitleRow>
                <PanelTitle>결제 신청 내역</PanelTitle>
                <ViewModeLabel>
                  <span>{viewMode === "mine" ? "나의 신청 내역" : "전체 신청 내역"}</span>
                  <SwitchInput
                    type="checkbox"
                    aria-label="나의 결제 신청 내역만 보기"
                    checked={viewMode === "mine"}
                    onChange={(event) =>
                      handleChangeViewMode(event.target.checked ? "mine" : "all")
                    }
                  />
                  <SwitchTrack aria-hidden="true">
                    <SwitchThumb />
                  </SwitchTrack>
                </ViewModeLabel>
              </PanelTitleRow>
              <SearchForm role="search" onSubmit={handleSearch}>
                <SearchInput
                  type="search"
                  placeholder="소속 or 제목 or 작성자"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                <SearchButton type="submit" aria-label="검색">
                  <IconSearch size={18} stroke={2.25} />
                </SearchButton>
              </SearchForm>
            </PanelHeader>

            {purchaseListQuery.isLoading ? (
              <EmptyText>결제 신청 내역을 불러오는 중입니다.</EmptyText>
            ) : requests.length === 0 ? (
              <EmptyText>아직 등록된 결제 신청이 없습니다.</EmptyText>
            ) : (
              <RequestList>
                {requests.map((request) => {
                  const isOpen = selectedRequestId === request.id;

                  return (
                    <RequestCard key={request.id}>
                      <RequestButton
                        type="button"
                        onClick={() => handleSelectRequest(request.id)}
                        $expanded={isOpen}
                      >
                        <RequestMain>
                          <RequestTopRow>
                            <RequestStatusBadge
                              label={formatRequestStatus(request.status)}
                              status={request.status}
                            />
                            <RequestDate>{formatUtcToKstShortDate(request.createdAt)}</RequestDate>
                          </RequestTopRow>
                          <RequestTitle>{request.title ?? "제목 없음"}</RequestTitle>
                          <RequestMeta>
                            {request.classroomName ? <span>{request.classroomName}</span> : null}
                            {request.requestedByName ? (
                              <span>{request.requestedByName}</span>
                            ) : null}
                            {typeof request.totalPrice === "number" ? (
                              <strong>{`${request.totalPrice.toLocaleString()}원`}</strong>
                            ) : null}
                          </RequestMeta>
                        </RequestMain>
                        <ChevronWrap $expanded={isOpen}>
                          <IconChevronDown size={18} stroke={2.1} />
                        </ChevronWrap>
                      </RequestButton>

                      {isOpen ? (
                        <RequestDetail>
                          {purchaseDetailQuery.isLoading ? (
                            <DetailMuted>상세 정보를 불러오는 중입니다.</DetailMuted>
                          ) : purchaseDetailQuery.data ? (
                            <>
                              <DetailGrid>
                                <DetailField>
                                  <DetailLabel>상태</DetailLabel>
                                  <DetailStatusText $status={purchaseDetailQuery.data.status}>
                                    {formatRequestStatus(purchaseDetailQuery.data.status)}
                                  </DetailStatusText>
                                </DetailField>
                                <DetailField>
                                  <DetailLabel>신청 일시</DetailLabel>
                                  <DetailValue>
                                    {formatUtcToKstShortDate(purchaseDetailQuery.data.createdAt)}
                                  </DetailValue>
                                </DetailField>
                                <DetailField>
                                  <DetailLabel>소속</DetailLabel>
                                  <DetailValue>
                                    {purchaseDetailQuery.data.classroomName ?? "-"}
                                  </DetailValue>
                                </DetailField>
                                <DetailField>
                                  <DetailLabel>신청자</DetailLabel>
                                  <DetailValue>
                                    {purchaseDetailQuery.data.requestedByName ?? "-"}
                                  </DetailValue>
                                </DetailField>
                              </DetailGrid>
                              <DetailBlock>
                                <DetailLabel>내용</DetailLabel>
                                <DetailBody>{purchaseDetailQuery.data.content ?? "-"}</DetailBody>
                              </DetailBlock>
                              <DetailBlock>
                                <DetailLabel>품목</DetailLabel>
                                <ItemSummaryList>
                                  {(purchaseDetailQuery.data.items ?? []).map((item, index) => (
                                    <ItemSummary key={item.id ?? `${item.name}-${index}`}>
                                      <span>{item.name ?? "품목명 없음"}</span>
                                      <small>
                                        {item.quantity ?? 0}개 ·{" "}
                                        {item.paymentType === "PREPAID" ? "선금 결제" : "실 결제"}
                                      </small>
                                    </ItemSummary>
                                  ))}
                                </ItemSummaryList>
                              </DetailBlock>
                              {purchaseDetailQuery.data.transactions?.length ? (
                                <DetailBlock>
                                  <DetailRowHeader>
                                    <DetailLabel>구매 보고 내역</DetailLabel>
                                    {purchaseDetailQuery.data.status === "PURCHASED" &&
                                    !isReportEditing ? (
                                      <InlineTextButton type="button" onClick={startReportEditing}>
                                        수정
                                      </InlineTextButton>
                                    ) : null}
                                  </DetailRowHeader>
                                  <ItemSummaryList>
                                    {purchaseDetailQuery.data.transactions.map(
                                      (transaction, index) => (
                                        <ReportSummary
                                          key={transaction.id ?? `${transaction.vendorId}-${index}`}
                                        >
                                          <span>
                                            {transaction.itemNames?.join(", ") || "품목명 없음"}
                                          </span>
                                          <ReportSummaryMetaRow>
                                            <small>
                                              {transaction.vendorName ?? "구매처 미선택"} ·{" "}
                                              {typeof transaction.amount === "number"
                                                ? `${transaction.amount.toLocaleString()}원`
                                                : "-"}
                                            </small>
                                            {transaction.receiptFileUrl ? (
                                              <ReceiptLink
                                                href={transaction.receiptFileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                영수증
                                              </ReceiptLink>
                                            ) : null}
                                          </ReportSummaryMetaRow>
                                        </ReportSummary>
                                      ),
                                    )}
                                  </ItemSummaryList>
                                </DetailBlock>
                              ) : null}
                              {purchaseDetailQuery.data.status === "APPROVED" &&
                              !isReportEditing ? (
                                <InlineActionRow>
                                  <SecondaryOutlineButton
                                    type="button"
                                    onClick={startReportEditing}
                                  >
                                    구매 완료 보고하기
                                  </SecondaryOutlineButton>
                                </InlineActionRow>
                              ) : null}
                              {isReportEditing ? (
                                <ReportForm onSubmit={handleReportSubmit}>
                                  <DetailLabel>
                                    {purchaseDetailQuery.data.status === "PURCHASED"
                                      ? "구매 보고 수정"
                                      : "구매 보고"}
                                  </DetailLabel>
                                  <ReportCardList>
                                    {activeReportItems.map((item) => (
                                      <ReportCard key={item.itemId}>
                                        <FieldGroup>
                                          <FieldLabel>품목</FieldLabel>
                                          <ReadOnlyInput
                                            value={item.name || "품목명 없음"}
                                            readOnly
                                          />
                                        </FieldGroup>
                                        <FieldGroup>
                                          <FieldLabel
                                            htmlFor={`payment-report-vendor-${item.itemId}`}
                                          >
                                            구매처
                                          </FieldLabel>
                                          <Select
                                            id={`payment-report-vendor-${item.itemId}`}
                                            value={item.vendorId}
                                            onChange={(event) =>
                                              updateReportItem(item.itemId, {
                                                vendorId: event.target.value,
                                              })
                                            }
                                          >
                                            <option value="">구매처를 선택해 주세요</option>
                                            {vendorOptions.map((vendor) => (
                                              <option key={vendor.id} value={String(vendor.id)}>
                                                {vendor.name}
                                              </option>
                                            ))}
                                          </Select>
                                        </FieldGroup>
                                        <FieldGroup>
                                          <FieldLabel
                                            htmlFor={`payment-report-price-${item.itemId}`}
                                          >
                                            금액
                                          </FieldLabel>
                                          <TextInput
                                            id={`payment-report-price-${item.itemId}`}
                                            type="number"
                                            min="1"
                                            step="1"
                                            inputMode="numeric"
                                            placeholder="금액을 입력해 주세요"
                                            value={item.price}
                                            onChange={(event) =>
                                              updateReportItem(item.itemId, {
                                                price: event.target.value,
                                              })
                                            }
                                          />
                                        </FieldGroup>
                                        <FieldGroup>
                                          <FieldLabel
                                            htmlFor={`payment-report-receipt-${item.itemId}`}
                                          >
                                            영수증
                                          </FieldLabel>
                                          <HiddenFileInput
                                            id={`payment-report-receipt-${item.itemId}`}
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(event) =>
                                              handleReceiptChange(item.itemId, event)
                                            }
                                          />
                                          <UploadButton
                                            htmlFor={`payment-report-receipt-${item.itemId}`}
                                          >
                                            {formatReceiptDisplayLabel(item.receiptFileName)}
                                          </UploadButton>
                                        </FieldGroup>
                                      </ReportCard>
                                    ))}
                                  </ReportCardList>
                                  <InlineActionRow>
                                    <ReportPrimaryButton type="submit" disabled={!canSubmitReport}>
                                      {reportMutation.isPending ? "저장 중..." : "제출"}
                                    </ReportPrimaryButton>
                                    <ReportSecondaryButton
                                      type="button"
                                      onClick={cancelReportEditing}
                                      disabled={reportMutation.isPending}
                                    >
                                      취소
                                    </ReportSecondaryButton>
                                  </InlineActionRow>
                                </ReportForm>
                              ) : null}
                            </>
                          ) : (
                            <DetailMuted>상세 정보를 불러오지 못했습니다.</DetailMuted>
                          )}
                        </RequestDetail>
                      ) : null}
                    </RequestCard>
                  );
                })}
              </RequestList>
            )}

            {!purchaseListQuery.isLoading && requests.length > 0 ? (
              <PaginationRow aria-label="페이지 이동">
                <PageArrowButton
                  type="button"
                  onClick={() => handleChangePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="이전 페이지"
                >
                  <IconChevronLeft size={18} stroke={2.1} />
                </PageArrowButton>
                {pageTokens.map((token, index) =>
                  token === "ellipsis" ? (
                    <PageEllipsis key={`payment-ellipsis-${index}`}>...</PageEllipsis>
                  ) : (
                    <PageNumberButton
                      key={`payment-page-${viewMode}-${token}`}
                      type="button"
                      $active={token === currentPage}
                      onClick={() => handleChangePage(token as number)}
                    >
                      {token}
                    </PageNumberButton>
                  ),
                )}
                <PageArrowButton
                  type="button"
                  onClick={() => handleChangePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                >
                  <IconChevronRight size={18} stroke={2.1} />
                </PageArrowButton>
              </PaginationRow>
            ) : null}
          </Panel>
        </>
      ) : null}
    </MobileRequestShell>
  );
}

const HeaderActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.5rem;
  padding: 0 0.95rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
  }
`;

const StatePanel = styled.section`
  display: grid;
  gap: ${spacing.space12};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const LoadingPanel = styled(StatePanel)`
  justify-items: center;
  align-content: center;
  min-height: 16rem;
`;

const LoadingText = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const StateTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const StateDescription = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 ${spacing.space20};
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  text-decoration: none;
`;

const SummaryPanel = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${spacing.space12};
`;

const SummaryCard = styled.div`
  display: grid;
  gap: ${spacing.space8};
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0.75rem 1.75rem rgba(0, 0, 0, 0.05);
`;

const SummaryLabel = styled.span`
  color: #6b7665;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const SummaryValue = styled.strong`
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 800;
  line-height: 1.2;
`;

const Panel = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const ComposerPanel = styled(Panel)`
  gap: ${spacing.space20};
`;

const PanelHeader = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const PanelTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const PanelTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const PanelNote = styled.p`
  margin: -${spacing.space12} 0 0;
  color: #72806a;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: ${spacing.space8};
  margin-top: ${spacing.space8};
`;

const ViewModeLabel = styled.label`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${spacing.space8};
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const SwitchInput = styled.input`
  position: absolute;
  opacity: 0;

  &:checked + span {
    background-color: #eef9e6;
  }

  &:checked + span span {
    transform: translateX(1.125rem);
    background-color: ${colors.point};
  }

  &:focus-visible + span {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }
`;

const SwitchTrack = styled.span`
  position: relative;
  display: inline-flex;
  width: 2.625rem;
  height: 1.5rem;
  border-radius: ${radii.radius999};
  background-color: #d9d9d9;
  transition: background-color 0.2s ease;
`;

const SwitchThumb = styled.span`
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: #616161;
  transition: transform 0.2s ease;
`;

const Form = styled.form`
  display: grid;
  gap: ${spacing.space16};
`;

const FieldGroup = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const FieldLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const fieldStyle = `
  width: 100%;
  min-height: 3rem;
  padding: 0 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  outline: none;

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const TextInput = styled.input`
  ${fieldStyle}

  &::placeholder {
    color: ${colors.placeholder};
  }
`;

const SearchInput = styled(TextInput)`
  min-width: 0;
`;

const Select = styled.select`
  ${fieldStyle}
  appearance: none;
`;

const ReadOnlyInput = styled(TextInput)`
  color: #61705b;
`;

const TwoColumn = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 26rem) {
    grid-template-columns: 1fr;
  }
`;

const VendorGrid = styled.div`
  display: grid;
  gap: ${spacing.space8};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const VendorCard = styled.div`
  display: grid;
  gap: ${spacing.space4};
  padding: 0.875rem 1rem;
  border: 1px solid #e3e7df;
  border-radius: 1rem;
  background: #fbfcfa;

  span {
    color: #64705f;
    font-size: ${typography.fontSize13};
  }

  strong {
    color: ${colors.text};
    font-size: ${typography.fontSize14};
  }
`;

const ItemStack = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ItemCard = styled.div`
  display: grid;
  gap: ${spacing.space12};
  padding: 1rem;
  border: 1px solid #e4e8e1;
  border-radius: 1rem;
  background: #fcfdfb;
`;

const ItemCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};

  strong {
    color: ${colors.text};
    font-size: ${typography.fontSize14};
  }
`;

const SegmentRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space8};
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  min-height: 2.75rem;
  border: 1px solid ${({ $active }) => ($active ? colors.point : "#d7ddd3")};
  border-radius: ${radii.radius15};
  background: ${({ $active }) => ($active ? colors.pointSoft : colors.white)};
  color: ${({ $active }) => ($active ? "#4f8f27" : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const SecondaryButton = styled.button`
  min-height: 2.75rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #f6f8f4;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const PrimaryButton = styled.button`
  min-height: 3.125rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
`;

const InlineMutedButton = styled.button`
  border: 0;
  background: transparent;
  color: #6e7a68;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: #72806a;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  text-align: center;
  padding: ${spacing.space20} 0;
`;

const RequestList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const PaginationRow = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  margin-top: ${spacing.space8};
`;

const PageArrowButton = styled.button`
  border: 0;
  background: transparent;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;

  &:disabled {
    opacity: 0.35;
  }
`;

const PageNumberButton = styled.button<{ $active: boolean }>`
  min-width: 2rem;
  min-height: 2rem;
  border: 0;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? colors.pointSoft : "transparent")};
  color: ${({ $active }) => ($active ? "#4f8f27" : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
`;

const PageEllipsis = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  min-height: 3rem;
  border: 0;
  border-radius: ${radii.radius15};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
`;

const RequestCard = styled.article`
  border: 1px solid #e5e8e1;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fcfdfb;
`;

const RequestButton = styled.button<{ $expanded: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  width: 100%;
  padding: 1rem 2.75rem 1rem 1rem;
  border: 0;
  background: ${({ $expanded }) => ($expanded ? "#f7fbf2" : "transparent")};
  text-align: left;
`;

const RequestMain = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const RequestTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const RequestDate = styled.span`
  color: #80907a;
  font-size: ${typography.fontSize13};
  font-weight: 600;
`;

const RequestTitle = styled.h3`
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: 1.35;
  word-break: keep-all;
`;

const RequestMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: #6b7665;
  font-size: ${typography.fontSize13};

  strong {
    color: #4f8f27;
  }
`;

const ChevronWrap = styled.span<{ $expanded: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7665;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

const RequestDetail = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 1rem 1rem 1rem;
  border-top: 1px solid #eef1eb;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const DetailField = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const DetailLabel = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const DetailValue = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const DetailStatusText = styled.span<{ $status?: string }>`
  color: ${({ $status }) =>
    $status === "APPROVED" || $status === "COMPLETED"
      ? "#4f8f27"
      : $status === "REJECTED" || $status === "EXPIRED" || $status === "CANCELLED"
        ? colors.notice
        : "#7c866f"};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const DetailBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const DetailBody = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
`;

const DetailMuted = styled.p`
  color: #72806a;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const DetailRowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const InlineTextButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #6e7a68;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;

const InlineActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

const SecondaryOutlineButton = styled.button`
  min-height: 2.75rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: ${colors.white};
  padding: 0 ${spacing.space16};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
  }
`;

const ReportPrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  min-height: 3rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #bfe7a6 0%, #7fd7a6 100%);
  padding: 0 ${spacing.space20};
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  white-space: nowrap;
  flex: 0 0 auto;

  &:disabled {
    opacity: 0.55;
  }
`;

const ReportSecondaryButton = styled(SecondaryOutlineButton)`
  min-width: 5.5rem;
  min-height: 3rem;
  padding: 0 ${spacing.space20};
  white-space: nowrap;
  flex: 0 0 auto;
`;

const ReportForm = styled.form`
  display: grid;
  gap: ${spacing.space12};
  padding-top: ${spacing.space4};
`;

const ReportCardList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ReportCard = styled.div`
  display: grid;
  gap: ${spacing.space12};
  padding: 1rem;
  border: 1px solid #e4e8e1;
  border-radius: 1rem;
  background: #fcfdfb;
`;

const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  border: 1px dashed #cfd6c9;
  border-radius: ${radii.radius15};
  background: #f7f9f5;
  padding: 0 ${spacing.space16};
  color: #62705c;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  cursor: pointer;
`;

const ReceiptLink = styled.a`
  color: #4f8f27;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;

const ReportSummary = styled.div`
  display: grid;
  gap: ${spacing.space4};
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: #f7f9f5;

  span {
    color: ${colors.text};
    font-size: ${typography.fontSize14};
    font-weight: 700;
  }

  small {
    color: #6f7b69;
    font-size: ${typography.fontSize13};
  }
`;

const ReportSummaryMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};

  small {
    min-width: 0;
  }
`;

const ItemSummaryList = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const ItemSummary = styled.div`
  display: grid;
  gap: ${spacing.space4};
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: #f7f9f5;

  span {
    color: ${colors.text};
    font-size: ${typography.fontSize14};
    font-weight: 700;
  }

  small {
    color: #6f7b69;
    font-size: ${typography.fontSize13};
  }
`;
