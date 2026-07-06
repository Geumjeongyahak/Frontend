"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { IconDownload, IconFilePlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { uploadPurchaseItemImage } from "@/api/file/file.api";
import {
  deletePurchaseRequest,
  getPurchaseRequestDetail,
  reportPurchase,
  updateAdminPurchaseItemReceipts,
  updatePurchaseItemReceipts,
} from "@/api/request/request.api";
import type {
  PurchaseRequestItemResponseDto,
  PurchaseRequestListResponseDto,
  PurchaseRequestResponseDto,
  PurchaseRequestStatus,
} from "@/api/request/request.dto";
import { getVendors } from "@/api/vendor/vendor.api";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestDetailPageProps = {
  requestId: number;
};

type PaymentType = "PREPAID" | "ACTUAL";

type VendorBalance = {
  vendorId?: number;
  vendorName?: string;
  balance?: number;
};

type AffiliationOption = {
  id: number;
  label: string;
  value: string;
  type: "classroom" | "department";
};

type ExtendedPurchaseItem = PurchaseRequestItemResponseDto;

type ExtendedPurchaseRequest = PurchaseRequestResponseDto;

const fallbackVendorNames = ["예소디자인", "목민서관", "지성문구", "마트"] as const;

function getAffiliationLabel(request?: PurchaseRequestResponseDto) {
  return request?.departmentName ?? request?.classroomName ?? "-";
}

type EditableItem = {
  id: number;
  name: string;
  quantity: string;
  reason: string;
};

type ReportItem = {
  itemId: number;
  vendorId: string;
  vendorName: string;
  name: string;
  price: string;
  receiptFile: File | null;
  receiptFileName: string;
  receiptFileId?: string;
  receiptFileUrl?: string;
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  PENDING: "대기 중",
  APPROVED: "승인 완료",
  PURCHASED: "구매 완료",
  CONFIRMED: "결재 확인",
  REJECTED: "거절",
};

function getStatusLabel(status?: PurchaseRequestStatus) {
  return status ? (statusLabels[status] ?? status) : "-";
}

function getPaymentTypeLabel(paymentType?: PaymentType) {
  if (paymentType === "PREPAID") return "선금 결제";
  if (paymentType === "ACTUAL") return "실 결제";
  return "-";
}

function formatAmount(amount?: number) {
  return typeof amount === "number" ? `${amount.toLocaleString()}원` : "-";
}

function getStatusTone(status?: PurchaseRequestStatus) {
  switch (status) {
    case "APPROVED":
      return "#3DA75C";
    case "PURCHASED":
      return "#2F80ED";
    case "CONFIRMED":
      return "#1D9A35";
    case "REJECTED":
      return "#DA3A30";
    case "PENDING":
    default:
      return "#E5AD34";
  }
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

function mapPurchaseItemsToEditableItems(items?: PurchaseRequestItemResponseDto[]) {
  return (items ?? []).map((item, index) => {
    return {
      id: item.id ?? index + 1,
      name: item.name ?? "",
      quantity: typeof item.quantity === "number" ? String(item.quantity) : "1",
      reason: item.reason ?? "",
    };
  });
}

function getRequestPaymentType(items?: PurchaseRequestItemResponseDto[]): PaymentType {
  const paymentType = items?.find((item) => item.paymentType)?.paymentType;
  return paymentType === "PREPAID" ? "PREPAID" : "ACTUAL";
}

function mapPurchaseItemsToReportItems(purchase?: ExtendedPurchaseRequest): ReportItem[] {
  if (purchase?.transactions?.length) {
    return purchase.transactions.map((transaction, index) => {
      const item = findPurchaseItemForTransaction(transaction.itemNames, purchase.items);

      return {
        itemId: transaction.id ?? item?.id ?? index + 1,
        vendorId: typeof transaction.vendorId === "number" ? String(transaction.vendorId) : "",
        vendorName: transaction.vendorName ?? "",
        name: transaction.itemNames?.join(", ") || item?.name || "",
        price: typeof transaction.amount === "number" ? String(transaction.amount) : "0",
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
      vendorName: purchase?.vendorName ?? "",
      name: item.name ?? "",
      price: "0",
      receiptFile: null,
      receiptFileName: "",
    }));
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

export default function FinanceRequestDetailPage({ requestId }: FinanceRequestDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAffiliationValue, setEditAffiliationValue] = useState("");
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [isReportEditing, setIsReportEditing] = useState(false);
  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.requests.purchaseDetail(requestId),
    queryFn: () => getPurchaseRequestDetail({ requestId }),
    retry: false,
  });
  const { data: vendorData } = useQuery({
    queryKey: queryKeys.vendors.list(),
    queryFn: () => getVendors(),
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const { data: classroomData } = useQuery({
    queryKey: queryKeys.classrooms.list(),
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
    retry: false,
  });
  const { data: departmentData } = useQuery({
    queryKey: ["departments", "finance-request-detail"],
    queryFn: () => getDepartments(),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePurchaseRequest({ requestId }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseDetail(requestId) });
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseList() });
      router.replace("/staff/finance-management");
    },
  });

  const purchase = request as ExtendedPurchaseRequest | undefined;
  const initialEditItems = useMemo(
    () => mapPurchaseItemsToEditableItems(request?.items),
    [request?.items],
  );
  const initialReportItems = useMemo(() => mapPurchaseItemsToReportItems(purchase), [purchase]);
  const activeReportItems = reportItems.length ? reportItems : initialReportItems;
  const classrooms = useMemo(() => classroomData?.content ?? [], [classroomData]);
  const departments = useMemo(() => departmentData?.departments ?? [], [departmentData]);
  const affiliationOptions = useMemo<AffiliationOption[]>(
    () => [
      ...classrooms
        .filter((classroom) => typeof classroom.id === "number")
        .map((classroom) => ({
          id: classroom.id as number,
          label: classroom.name ?? `반 ${classroom.id}`,
          value: `classroom:${classroom.id}`,
          type: "classroom" as const,
        })),
      ...departments
        .filter((department) => typeof department.id === "number")
        .map((department) => ({
          id: department.id as number,
          label: department.name ?? `부서 ${department.id}`,
          value: `department:${department.id}`,
          type: "department" as const,
        })),
    ],
    [classrooms, departments],
  );
  const selectedAffiliation = affiliationOptions.find(
    (option) => option.value === editAffiliationValue,
  );
  const requestAffiliationValue = useMemo(() => {
    const currentAffiliation = affiliationOptions.find((option) =>
      option.type === "department"
        ? typeof request?.departmentId === "number"
          ? option.id === request.departmentId
          : option.label === request?.departmentName
        : typeof request?.classroomId === "number"
          ? option.id === request.classroomId
          : option.label === request?.classroomName,
    );

    return currentAffiliation?.value ?? "";
  }, [affiliationOptions, request]);

  const reportMutation = useMutation({
    mutationFn: async () => {
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

      if (isReportEditing) {
        return user?.role === "ADMIN"
          ? updateAdminPurchaseItemReceipts({ requestId }, body)
          : updatePurchaseItemReceipts({ requestId }, body);
      }

      return reportPurchase({ requestId }, body);
    },
    onSuccess: () => {
      setIsReportEditing(false);
      setReportItems([]);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.purchaseDetail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.purchaseList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.list() });
    },
  });

  const detailItems = purchase?.transactions?.length
    ? purchase.transactions.map((transaction, index) => {
        const item = findPurchaseItemForTransaction(transaction.itemNames, purchase.items);

        return {
          id: transaction.id ?? item?.id ?? index,
          name: transaction.itemNames?.join(", ") || item?.name || "-",
          reason: item?.reason ?? purchase.content ?? "-",
          quantity: item?.quantity,
          paymentType: item?.paymentType,
          vendorName: transaction.vendorName,
          price: transaction.amount,
          receipt:
            transaction.receiptFileId || transaction.receiptFileUrl
              ? {
                  receiptFileId: transaction.receiptFileId,
                  fileUrl: transaction.receiptFileUrl,
                }
              : undefined,
        };
      })
    : purchase?.items?.length
      ? purchase.items.map((item, index) => {
          const extendedItem = item as ExtendedPurchaseItem;
          return {
            id: item.id ?? index,
            name: item.name ?? "-",
            reason: item.reason ?? purchase.content ?? "-",
            quantity: extendedItem.quantity,
            paymentType: extendedItem.paymentType,
            vendorName: purchase.vendorName,
            price: undefined,
            receipt: undefined,
          };
        })
      : [
          {
            id: purchase?.id ?? 0,
            name: purchase?.title ?? "-",
            reason: purchase?.content ?? "-",
            quantity: undefined,
            paymentType: undefined,
            vendorName: purchase?.vendorName,
            price: purchase?.totalPrice,
            receipt: undefined,
          },
        ];
  const isRequester =
    authStatus === "authenticated" &&
    typeof user?.id === "number" &&
    typeof request?.requestedById === "number" &&
    user.id === request.requestedById;
  const isAdmin = authStatus === "authenticated" && user?.role === "ADMIN";
  const canManageRequest = isAdmin || isRequester;
  const canManagePurchaseReport = authStatus === "authenticated" && canManageRequest;
  const canEditRequest = request?.status === "PENDING" && canManageRequest;
  const canDeleteRequest = request?.status === "PENDING" && canManageRequest;
  const canShowReportForm = request?.status === "APPROVED" && isRequester;
  const canEditPurchaseReport = request?.status === "PURCHASED" && canManagePurchaseReport;
  const canShowReportEditor = canShowReportForm || isReportEditing;
  const vendorBalances: VendorBalance[] = vendorData?.length
    ? vendorData.map((vendor) => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        balance: vendor.balance,
      }))
    : (purchase?.vendorBalances ?? []);
  const vendorNames = vendorBalances.length
    ? vendorBalances
        .map((vendor) => vendor.vendorName)
        .filter((name): name is string => Boolean(name))
    : [...fallbackVendorNames];
  const vendorOptions = vendorBalances
    .filter((vendor) => typeof vendor.vendorId === "number" && Boolean(vendor.vendorName))
    .map((vendor) => ({ id: vendor.vendorId as number, name: vendor.vendorName as string }));
  const canSubmitReport =
    canShowReportEditor &&
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

  function updateReportItem(
    itemId: number,
    patch: Partial<{
      vendorName: string;
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

  function updateEditItem(itemId: number, patch: Partial<EditableItem>) {
    setEditItems((current) =>
      (current.length ? current : initialEditItems).map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    );
  }

  function addEditItem() {
    setEditItems((current) => {
      const source = current.length ? current : initialEditItems;
      const nextId = source.length ? Math.max(...source.map((item) => item.id)) + 1 : 1;

      return [
        ...source,
        {
          id: nextId,
          name: "",
          quantity: "1",
          reason: "",
        },
      ];
    });
  }

  function removeEditItem(itemId: number) {
    setEditItems((current) => {
      const source = current.length ? current : initialEditItems;

      if (source.length <= 1) {
        return [
          {
            id: source[0]?.id ?? 1,
            name: "",
            quantity: "1",
            reason: "",
          },
        ];
      }

      return source.filter((item) => item.id !== itemId);
    });
  }

  function startEditing() {
    if (!request) {
      return;
    }

    setEditTitle(request.title ?? "");
    setEditAffiliationValue(requestAffiliationValue);
    setEditItems(initialEditItems);
    setIsEditing(true);
  }

  function startReportEditing() {
    setReportItems(initialReportItems);
    setIsReportEditing(true);
  }

  function cancelReportEditing() {
    setReportItems([]);
    setIsReportEditing(false);
  }

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitReport) {
      return;
    }
    reportMutation.mutate();
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request) {
      return;
    }

    const nextRequest = {
      ...request,
      title: editTitle.trim() || request.title,
      classroomId:
        selectedAffiliation?.type === "classroom" ? selectedAffiliation.id : request.classroomId,
      classroomName:
        selectedAffiliation?.type === "classroom"
          ? selectedAffiliation.label
          : request.classroomName,
      departmentId:
        selectedAffiliation?.type === "department" ? selectedAffiliation.id : request.departmentId,
      departmentName:
        selectedAffiliation?.type === "department"
          ? selectedAffiliation.label
          : request.departmentName,
      items: (editItems.length ? editItems : initialEditItems).map((item) => ({
        id: item.id,
        name: item.name.trim(),
        reason: item.reason.trim() || undefined,
        quantity: Number(item.quantity),
        paymentType: getRequestPaymentType(request.items),
      })),
    };

    queryClient.setQueryData(queryKeys.requests.purchaseDetail(requestId), nextRequest);
    queryClient.setQueryData<PurchaseRequestListResponseDto | undefined>(
      queryKeys.requests.purchaseList(),
      (current) =>
        current
          ? {
              ...current,
              content: current.content.map((item) =>
                item.id === requestId ? { ...item, ...nextRequest } : item,
              ),
            }
          : current,
    );
    setIsEditing(false);
  }

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <Actions>
            {isEditing ? (
              <>
                <ActionButton type="submit" form="finance-request-edit-form" $variant="edit">
                  수정 완료
                </ActionButton>
                <CancelTopButton type="button" onClick={() => setIsEditing(false)}>
                  취소
                </CancelTopButton>
              </>
            ) : (
              <>
                {canManageRequest ? (
                  <>
                    <ActionButton
                      type="button"
                      $variant="danger"
                      disabled={!canDeleteRequest || deleteMutation.isPending || isLoading}
                      title={
                        canDeleteRequest
                          ? undefined
                          : "관리자이거나 대기 중인 본인 작성 글만 삭제할 수 있습니다."
                      }
                      onClick={() => deleteMutation.mutate()}
                    >
                      {deleteMutation.isPending ? "삭제 중" : "삭제"}
                    </ActionButton>
                    <ActionButton
                      type="button"
                      $variant="edit"
                      disabled={!canEditRequest}
                      title={
                        canEditRequest
                          ? undefined
                          : "관리자이거나 대기 중인 본인 작성 글만 수정할 수 있습니다."
                      }
                      onClick={startEditing}
                    >
                      수정
                    </ActionButton>
                  </>
                ) : null}
                <ListButton href="/staff/finance-management">목록</ListButton>
              </>
            )}
          </Actions>

          {isLoading ? <StateMessage>결제 신청 정보를 불러오는 중입니다.</StateMessage> : null}
          {isError ? (
            <StateMessage role="alert">결제 신청 정보를 불러오지 못했습니다.</StateMessage>
          ) : null}
          {deleteMutation.isError ? (
            <StateMessage role="alert">결제 신청 삭제에 실패했습니다.</StateMessage>
          ) : null}

          {request ? (
            <ContentColumn
              as={isEditing ? "form" : "article"}
              id={isEditing ? "finance-request-edit-form" : undefined}
              onSubmit={handleEditSubmit}
            >
              <DateBar>{formatUtcToKstShortDate(request.createdAt)}</DateBar>

              <Section>
                <Label>제목</Label>
                {isEditing ? (
                  <EditInput
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                ) : (
                  <Field>{request.title ?? "-"}</Field>
                )}
              </Section>

              <Section>
                <SectionTitle>신청자 정보</SectionTitle>
                <InfoRow>
                  <InlineLabel htmlFor="edit-affiliation" as="label">
                    소속
                  </InlineLabel>
                  {isEditing ? (
                    <EditSelect
                      id="edit-affiliation"
                      name="affiliation"
                      value={editAffiliationValue}
                      onChange={(event) => setEditAffiliationValue(event.target.value)}
                      required
                    >
                      <option value="">소속 선택</option>
                      {affiliationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </EditSelect>
                  ) : (
                    <InlineField>{getAffiliationLabel(request)}</InlineField>
                  )}
                  <InlineLabel>신청자</InlineLabel>
                  <InlineField>{request.requestedByName ?? "-"}</InlineField>
                </InfoRow>
              </Section>

              {isEditing ? (
                <Section>
                  <SectionTitle>결제 유형</SectionTitle>
                  <PaymentTypeGroup aria-disabled="true">
                    <PaymentTypeOption>
                      <input
                        type="checkbox"
                        name="edit-paymentType"
                        value="PREPAID"
                        checked={getRequestPaymentType(request.items) === "PREPAID"}
                        disabled
                        readOnly
                      />
                      <span>선금 결제</span>
                    </PaymentTypeOption>
                    <PaymentTypeOption>
                      <input
                        type="checkbox"
                        name="edit-paymentType"
                        value="ACTUAL"
                        checked={getRequestPaymentType(request.items) === "ACTUAL"}
                        disabled
                        readOnly
                      />
                      <span>실 결제</span>
                    </PaymentTypeOption>
                  </PaymentTypeGroup>
                </Section>
              ) : null}

              <Section>
                <DetailSectionHeader>
                  <SectionTitle>상세 품목</SectionTitle>
                  {canEditPurchaseReport && !isReportEditing ? (
                    <ReportEditTextButton type="button" onClick={startReportEditing}>
                      수정
                    </ReportEditTextButton>
                  ) : null}
                </DetailSectionHeader>
                {isEditing ? (
                  <>
                    <EditItemList>
                      {(editItems.length ? editItems : initialEditItems).map((item, index) => (
                        <EditItemBlock key={item.id}>
                          <ItemFieldRow>
                            <ItemLabel htmlFor={`editItemName-${item.id}`}>
                              품목 {index + 1}
                            </ItemLabel>
                            <EditInput
                              id={`editItemName-${item.id}`}
                              value={item.name}
                              onChange={(event) =>
                                updateEditItem(item.id, { name: event.target.value })
                              }
                            />
                          </ItemFieldRow>
                          <ItemFieldRow>
                            <ItemLabel htmlFor={`editQuantity-${item.id}`}>개수</ItemLabel>
                            <EditInput
                              id={`editQuantity-${item.id}`}
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(event) =>
                                updateEditItem(item.id, { quantity: event.target.value })
                              }
                            />
                          </ItemFieldRow>
                          <ItemFieldRow>
                            <ItemLabel htmlFor={`editReason-${item.id}`}>결제 사유</ItemLabel>
                            <EditInput
                              id={`editReason-${item.id}`}
                              value={item.reason}
                              onChange={(event) =>
                                updateEditItem(item.id, { reason: event.target.value })
                              }
                            />
                          </ItemFieldRow>
                          {(editItems.length ? editItems : initialEditItems).length > 1 ? (
                            <EditItemActionRow>
                              <DeleteItemButton
                                type="button"
                                onClick={() => removeEditItem(item.id)}
                              >
                                품목 삭제
                              </DeleteItemButton>
                            </EditItemActionRow>
                          ) : null}
                        </EditItemBlock>
                      ))}
                    </EditItemList>
                    <AddItemButton type="button" onClick={addEditItem}>
                      품목 추가하기
                    </AddItemButton>
                  </>
                ) : (
                  <DetailTable>
                    <thead>
                      <tr>
                        <th>거래처</th>
                        <th>품목</th>
                        <th>개수</th>
                        <th>결제 사유</th>
                        <th>결제 유형</th>
                        <th>결제 금액</th>
                        <th>영수증</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailItems.map((item, index) => (
                        <tr key={`${item.id}-${index}`}>
                          <td>{item.vendorName ?? "-"}</td>
                          <td>{item.name}</td>
                          <td>{typeof item.quantity === "number" ? item.quantity : "-"}</td>
                          <td>{item.reason}</td>
                          <td>{getPaymentTypeLabel(item.paymentType)}</td>
                          <td>{formatAmount(item.price)}</td>
                          <td>
                            {item.receipt ? (
                              <InlineReceiptLink
                                href={item.receipt.fileUrl ?? "#"}
                                download={getReceiptName(item.receipt)}
                              >
                                파일
                                <ReceiptIcon aria-hidden="true">
                                  <IconDownload size={12} stroke={2.25} />
                                </ReceiptIcon>
                              </InlineReceiptLink>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </DetailTable>
                )}
              </Section>

              <Section>
                <SectionTitle>현재 거래처별 잔액</SectionTitle>
                <VendorBalanceTable>
                  <tbody>
                    {vendorNames.map((vendorName) => {
                      const balance = vendorBalances.find((item) => item.vendorName === vendorName);

                      return (
                        <tr key={vendorName}>
                          <th scope="row">{vendorName}</th>
                          <td>{formatAmount(balance?.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </VendorBalanceTable>
              </Section>

              <Section>
                <SectionTitle>신청 현황</SectionTitle>
                <StatusField $status={request.status}>{getStatusLabel(request.status)}</StatusField>
                {request.status === "REJECTED" ? (
                  <RejectReason>거절 사유: {request.note?.trim() || "-"}</RejectReason>
                ) : null}
              </Section>

              {canShowReportEditor ? (
                <ReportForm onSubmit={handleReportSubmit}>
                  <SectionTitle>
                    {isReportEditing ? "구매 완료 보고 수정" : "구매 완료 보고"}
                  </SectionTitle>
                  {activeReportItems.map((item, index) => (
                    <ReportGrid key={item.itemId}>
                      <ReportLabel htmlFor={`reportName-${item.itemId}`}>
                        품목 {index + 1}
                      </ReportLabel>
                      <ReadOnlyReportField id={`reportName-${item.itemId}`}>
                        {item.name || "-"}
                      </ReadOnlyReportField>
                      <ReportLabel htmlFor={`vendor-${item.itemId}`}>거래처</ReportLabel>
                      <ReportSelect
                        id={`vendor-${item.itemId}`}
                        value={item.vendorId}
                        onChange={(event) => {
                          const vendor = vendorOptions.find(
                            (option) => String(option.id) === event.target.value,
                          );

                          updateReportItem(item.itemId, {
                            vendorId: event.target.value,
                            vendorName: vendor?.name ?? "",
                          });
                        }}
                      >
                        <option value="">거래처 선택</option>
                        {vendorOptions.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </ReportSelect>
                      <ReportLabel htmlFor={`price-${item.itemId}`}>결제 금액</ReportLabel>
                      <ReportInput
                        id={`price-${item.itemId}`}
                        type="number"
                        min="1"
                        inputMode="numeric"
                        placeholder="0"
                        value={item.price}
                        onChange={(event) =>
                          updateReportItem(item.itemId, { price: event.target.value })
                        }
                      />
                      <ReportLabel htmlFor={`receipt-${item.itemId}`}>영수증</ReportLabel>
                      <UploadControl>
                        <UploadInput
                          id={`receipt-${item.itemId}`}
                          type="file"
                          onChange={(event) => handleReceiptChange(item.itemId, event)}
                        />
                        <UploadBox htmlFor={`receipt-${item.itemId}`}>
                          <IconFilePlus size={20} stroke={1.8} aria-hidden="true" />
                          <span>{item.receiptFileName || "파일 추가하기"}</span>
                        </UploadBox>
                      </UploadControl>
                    </ReportGrid>
                  ))}
                  <ReportActionRow>
                    <ReportSubmitButton type="submit" disabled={!canSubmitReport}>
                      {reportMutation.isPending
                        ? isReportEditing
                          ? "수정 중"
                          : "보고 중"
                        : isReportEditing
                          ? "수정 완료"
                          : "구매 완료 보고하기"}
                    </ReportSubmitButton>
                    {isReportEditing ? (
                      <CancelEditButton
                        type="button"
                        disabled={reportMutation.isPending}
                        onClick={cancelReportEditing}
                      >
                        취소
                      </CancelEditButton>
                    ) : null}
                  </ReportActionRow>
                  {reportMutation.isError ? (
                    <StateMessage role="alert">
                      {isReportEditing
                        ? "구매 완료 보고 수정에 실패했습니다."
                        : "구매 완료 보고에 실패했습니다."}
                    </StateMessage>
                  ) : null}
                </ReportForm>
              ) : null}
            </ContentColumn>
          ) : null}
        </Content>
      </Stage>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const Stage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
  padding: 1.8125rem 3.125rem 4rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding-inline: ${spacing.space16};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #a9a9a9;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const BaseAction = styled.button<{ $variant?: "default" | "danger" | "edit" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "danger" ? colors.notice : $variant === "edit" ? colors.point : "transparent"};
  border-radius: ${radii.radius15};
  background-color: ${({ $variant }) =>
    $variant === "danger" || $variant === "edit" ? colors.white : colors.point};
  padding: 0.8125rem ${spacing.space20};
  color: ${({ $variant }) =>
    $variant === "danger" ? colors.notice : $variant === "edit" ? colors.point : colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  cursor: pointer;

  &:disabled {
    background-color: #d4d4d4;
    border-color: #d4d4d4;
    color: #7b7b7b;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: ${({ $variant }) =>
      $variant === "danger"
        ? colors.noticeSoft
        : $variant === "edit"
          ? colors.pointSoft
          : "#76bd49"};
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ActionButton = styled(BaseAction)``;

const ListButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const CancelTopButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const Label = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const DetailSectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space20};
`;

const ReportEditTextButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: #b3b3b3;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: ${colors.point};
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  min-width: 0;
  background-color: #f7f7f7;
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const InlineLabel = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineField = styled(Field)``;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${colors.muted};
  color: #000000;
  table-layout: fixed;

  th,
  td {
    padding: ${spacing.space12};
    border: 1px solid ${colors.muted};
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight150};
    overflow-wrap: anywhere;
    vertical-align: middle;
  }

  th {
    background-color: ${colors.background};
    font-weight: 600;
    text-align: center;
  }

  td {
    font-weight: 400;
  }

  th:nth-child(1),
  th:nth-child(2),
  th:nth-child(6) {
    width: 8.25rem;
  }

  th:nth-child(3),
  th:nth-child(5),
  th:nth-child(7) {
    width: 6rem;
  }

  @media (min-width: 120rem) {
    th,
    td {
      padding: ${spacing.space20};
      font-size: ${typography.fontSize20};
    }

    th:nth-child(1),
    th:nth-child(2),
    th:nth-child(6) {
      width: 12rem;
    }

    th:nth-child(3),
    th:nth-child(5),
    th:nth-child(7) {
      width: 8.25rem;
    }
  }
`;

const EditInput = styled.input`
  min-width: 0;
  min-height: 2.6875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const EditSelect = styled.select`
  min-width: 0;
  min-height: 2.6875rem;
  border: 1px solid #c0c0c0;
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;
  appearance: none;
  padding: 0.8125rem ${spacing.space32} 0.8125rem ${spacing.space12};
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000000' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right ${spacing.space12} center;
  background-repeat: no-repeat;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 3rem ${spacing.space20} ${spacing.space20};
    font-size: ${typography.fontSize20};
    background-position: right ${spacing.space20} center;
  }
`;

const EditItemList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -${spacing.space8};
`;

const EditItemBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding: ${spacing.space20} 0;
  border-bottom: 1px solid #bcbcbc;

  &:first-child {
    padding-top: ${spacing.space8};
  }

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: ${spacing.space20};
    padding-bottom: 1.875rem;

    &:first-child {
      padding-top: ${spacing.space12};
    }
  }
`;

const ItemFieldRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ItemLabel = styled.label`
  min-width: 4rem;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    min-width: 6.125rem;
    font-size: ${typography.fontSize20};
  }
`;

const PaymentTypeGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

const PaymentTypeOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 1rem;
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  margin-right: 1rem;

  input {
    accent-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 2rem;
    font-size: ${typography.fontSize20};
    margin-right: 2rem;
  }
`;

const EditItemActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.125rem;
  border: 0;
  background-color: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 3.125rem;
    font-size: ${typography.fontSize20};
  }
`;

const DeleteItemButton = styled(AddItemButton)`
  width: 9rem;
  border-color: #e45a52;
  background-color: #fde4e2;
  color: #da3a30;

  @media (min-width: 120rem) {
    width: 12rem;
  }
`;

const VendorBalanceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${colors.muted};
  table-layout: fixed;

  th,
  td {
    width: 50%;
    padding: ${spacing.space12};
    border: 1px solid ${colors.muted};
    color: #000000;
    font-size: ${typography.fontSize14};
    line-height: ${typography.lineHeight130};
  }

  th {
    background-color: ${colors.background};
    font-weight: 600;
    text-align: left;
  }

  td {
    font-weight: 600;
    text-align: right;
  }

  @media (min-width: 120rem) {
    th,
    td {
      padding: ${spacing.space20};
      font-size: ${typography.fontSize20};
    }
  }
`;

const StateMessage = styled.p`
  margin: 0 0 ${spacing.space20};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
`;

const ReceiptIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2em;
  height: 1.2rem;
  border-radius: 50%;
  background-color: ${colors.point};
  color: ${colors.white};

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
`;

const StatusField = styled(Field)<{ $status?: PurchaseRequestStatus }>`
  width: fit-content;
  justify-content: center;
  border-radius: ${radii.radius15};
  background-color: #fbf4d7;
  padding-inline: ${spacing.space20};
  color: ${({ $status }) => getStatusTone($status)};
  font-weight: 600;

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;

const RejectReason = styled.p`
  margin: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineReceiptLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  color: #000000;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
`;

const ReportForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding-top: ${spacing.space20};
  border-top: 1px solid ${colors.borderStrong};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: 1.875rem;
  }
`;

const ReportActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
  flex-wrap: wrap;
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 0.8fr)
    auto minmax(8rem, auto);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: auto minmax(0, 1fr);
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ReportLabel = styled.label`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ReportInput = styled.input`
  min-width: 8rem;
  min-height: 2.6875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ReadOnlyReportField = styled.div`
  min-width: 0;
  min-height: 2.6875rem;
  display: flex;
  align-items: center;
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ReportSelect = styled.select`
  min-width: 0;
  min-height: 2.6875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  appearance: none;
  padding: 0.8125rem ${spacing.space32} 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000000' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right ${spacing.space12} center;
  background-repeat: no-repeat;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 3rem ${spacing.space20} ${spacing.space20};
    font-size: ${typography.fontSize20};
    background-position: right ${spacing.space20} center;
  }
`;

const UploadControl = styled.div`
  display: flex;
  align-items: flex-start;
`;

const UploadInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const UploadBox = styled.label`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-width: 5.5rem;
  min-height: 4.125rem;
  padding: ${spacing.space20};
  background-color: ${colors.background};
  color: #969696;
  font-size: 0.5rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  span {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 120rem) {
    min-width: 8.375rem;
    min-height: 6.25rem;
    gap: 0.9375rem;
    padding: 1.875rem;
    font-size: 0.75rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const ReportSubmitButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:disabled {
    border-color: #d4d4d4;
    background-color: #d4d4d4;
    color: #7b7b7b;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const CancelEditButton = styled(ReportSubmitButton)`
  border: 1px solid ${colors.border};
  background-color: ${colors.background};
  color: ${colors.text};

  &:not(:disabled):hover {
    background-color: ${colors.border};
  }
`;
