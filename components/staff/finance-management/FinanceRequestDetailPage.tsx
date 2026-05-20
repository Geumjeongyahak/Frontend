"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { IconDownload, IconFilePlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { uploadPurchaseItemImage } from "@/api/file/file.api";
import {
  deletePurchaseRequest,
  getPurchaseRequestDetail,
  reportPurchase,
} from "@/api/request/request.api";
import type {
  PurchaseRequestItemResponseDto,
  PurchaseRequestResponseDto,
  PurchaseRequestStatus,
} from "@/api/request/request.dto";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { financeReceiptToGoogleDrive } from "@/lib/googleDrive/financeReceiptToGoogleDrive";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestDetailPageProps = {
  requestId: number;
};

type PaymentType = "PREPAID" | "ACTUAL";

type VendorBalance = {
  vendorName?: string;
  balance?: number;
  totalAmount?: number;
};

type ExtendedPurchaseItem = PurchaseRequestItemResponseDto & {
  quantity?: number;
  paymentType?: PaymentType;
  vendorName?: string;
  purchaseDate?: string;
};

type ExtendedPurchaseRequest = PurchaseRequestResponseDto & {
  vendorName?: string;
  vendorBalances?: VendorBalance[];
};

const vendorNames = ["예소디자인", "목민서관", "지성문구", "마트임"] as const;

type EditableItem = {
  id: number;
  name: string;
  quantity: string;
  reason: string;
  paymentType: PaymentType;
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
  if (paymentType === "PREPAID") return "선 결제";
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
}) {
  if (receipt.fileName) {
    return receipt.fileName;
  }

  if (!receipt.originalName) {
    return receipt.fileId ?? "영수증";
  }

  return receipt.ext && !receipt.originalName.endsWith(`.${receipt.ext}`)
    ? `${receipt.originalName}.${receipt.ext}`
    : receipt.originalName;
}

export default function FinanceRequestDetailPage({ requestId }: FinanceRequestDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editClassroomName, setEditClassroomName] = useState("");
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [reportItems, setReportItems] = useState<
    {
      itemId: number;
      vendorName: string;
      name: string;
      price: string;
      purchaseDate: string;
      receiptFile: File | null;
      receiptFileName: string;
    }[]
  >([]);
  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.requests.purchaseDetail(requestId),
    queryFn: () => getPurchaseRequestDetail({ requestId }),
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

  useEffect(() => {
    if (!request) {
      return;
    }

    setEditTitle(request.title ?? "");
    setEditClassroomName(request.classroomName ?? "");
    setEditItems(
      (request.items ?? []).map((item, index) => {
        const extendedItem = item as ExtendedPurchaseItem;

        return {
          id: item.id ?? index + 1,
          name: item.name ?? "",
          quantity: typeof extendedItem.quantity === "number" ? String(extendedItem.quantity) : "1",
          reason: item.reason ?? "",
          paymentType: extendedItem.paymentType ?? "ACTUAL",
        };
      }),
    );
  }, [request]);

  useEffect(() => {
    if (!request?.items?.length) {
      setReportItems([]);
      return;
    }

    const purchase = request as ExtendedPurchaseRequest;
    setReportItems(
      (purchase.items ?? [])
        .filter((item) => typeof item.id === "number")
        .map((item) => ({
          itemId: item.id ?? 0,
          vendorName: (item as ExtendedPurchaseItem).vendorName ?? purchase.vendorName ?? "",
          name: item.name ?? "",
          price: typeof item.actualPrice === "number" ? String(item.actualPrice) : "",
          purchaseDate: (item as ExtendedPurchaseItem).purchaseDate ?? "",
          receiptFile: null,
          receiptFileName: "",
        })),
    );
  }, [request]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      const receiptFileIds: string[] = [];

      const uploadedReceiptIds = await Promise.all(
        reportItems.map(async (item) => {
          if (!item.receiptFile) {
            return null;
          }

          const [, apiUploaded] = await Promise.all([
            financeReceiptToGoogleDrive(item.receiptFile),
            uploadPurchaseItemImage(item.receiptFile, item.receiptFile.name),
          ]);

          return apiUploaded.fileId ?? null;
        }),
      );
      receiptFileIds.push(
        ...uploadedReceiptIds.filter((fileId): fileId is string => Boolean(fileId)),
      );

      return reportPurchase(
        { requestId },
        {
          items: reportItems.map((item) => ({
            itemId: item.itemId,
            price: Number(item.price),
          })),
          ...(receiptFileIds.length ? { receiptFileIds } : {}),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.purchaseDetail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.purchaseList() });
    },
  });

  const purchase = request as ExtendedPurchaseRequest | undefined;
  const detailItems = purchase?.items?.length
    ? purchase.items.map((item, index) => {
        const extendedItem = item as ExtendedPurchaseItem;
        const receipt = purchase.receipts?.[index];
        return {
          id: item.id ?? index,
          name: item.name ?? "-",
          reason: item.reason ?? purchase.content ?? "-",
          quantity: extendedItem.quantity,
          paymentType: extendedItem.paymentType,
          vendorName: extendedItem.vendorName ?? purchase.vendorName,
          price: item.actualPrice,
          purchaseDate: extendedItem.purchaseDate,
          receipt,
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
          purchaseDate: undefined,
          receipt: purchase?.receipts?.[0],
        },
      ];
  const isRequester =
    authStatus === "authenticated" &&
    typeof user?.id === "number" &&
    typeof request?.requestedById === "number" &&
    user.id === request.requestedById;
  const canEditRequest = request?.status === "PENDING" && isRequester;
  const canShowReportForm = request?.status === "APPROVED" && isRequester;
  const canSubmitReport =
    canShowReportForm &&
    reportItems.length > 0 &&
    reportItems.every(
      (item) =>
        item.vendorName.trim().length > 0 &&
        item.name.trim().length > 0 &&
        item.price.trim().length > 0 &&
        item.purchaseDate.trim().length > 0 &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0,
    ) &&
    !reportMutation.isPending;

  function updateReportItem(
    itemId: number,
    patch: Partial<{
      vendorName: string;
      name: string;
      price: string;
      purchaseDate: string;
      receiptFile: File | null;
      receiptFileName: string;
    }>,
  ) {
    setReportItems((current) =>
      current.map((item) => (item.itemId === itemId ? { ...item, ...patch } : item)),
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
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
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
      classroomName: editClassroomName.trim() || request.classroomName,
      items: editItems.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        reason: item.reason.trim() || undefined,
        quantity: Number(item.quantity),
        paymentType: item.paymentType,
      })),
    };

    queryClient.setQueryData(queryKeys.requests.purchaseDetail(requestId), nextRequest);
    queryClient.setQueryData<PurchaseRequestResponseDto[] | undefined>(
      queryKeys.requests.purchaseList(),
      (current) =>
        current?.map((item) => (item.id === requestId ? { ...item, ...nextRequest } : item)),
    );
    setIsEditing(false);
  }

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <Actions>
            <ActionButton
              type="button"
              $variant="danger"
              disabled={deleteMutation.isPending || isLoading || !request}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "삭제 중" : "삭제"}
            </ActionButton>
            <ActionButton
              type="button"
              disabled={!canEditRequest}
              title={canEditRequest ? undefined : "대기 중인 본인 작성 글만 수정할 수 있습니다."}
              onClick={() => setIsEditing(true)}
            >
              {isEditing ? "수정 중" : "수정"}
            </ActionButton>
            <ListButton href="/staff/finance-management">목록</ListButton>
          </Actions>

          {isLoading ? <StateMessage>결제 신청 정보를 불러오는 중입니다.</StateMessage> : null}
          {isError ? (
            <StateMessage role="alert">결제 신청 정보를 불러오지 못했습니다.</StateMessage>
          ) : null}
          {deleteMutation.isError ? (
            <StateMessage role="alert">결제 신청 삭제에 실패했습니다.</StateMessage>
          ) : null}

          {request ? (
            <ContentColumn as={isEditing ? "form" : "article"} onSubmit={handleEditSubmit}>
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
                  <InlineLabel>반 이름</InlineLabel>
                  {isEditing ? (
                    <EditInput
                      value={editClassroomName}
                      onChange={(event) => setEditClassroomName(event.target.value)}
                    />
                  ) : (
                    <InlineField>{request.classroomName ?? "-"}</InlineField>
                  )}
                  <InlineLabel>신청자</InlineLabel>
                  <InlineField>{request.requestedByName ?? "-"}</InlineField>
                </InfoRow>
              </Section>

              <Section>
                <SectionTitle>상세 품목</SectionTitle>
                {isEditing ? (
                  <EditItemList>
                    {editItems.map((item, index) => (
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
                        <ItemFieldRow>
                          <ItemLabel>결제 유형</ItemLabel>
                          <PaymentTypeGroup>
                            <PaymentTypeOption>
                              <input
                                type="checkbox"
                                checked={item.paymentType === "PREPAID"}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    updateEditItem(item.id, { paymentType: "PREPAID" });
                                  }
                                }}
                              />
                              <span>선 결제</span>
                            </PaymentTypeOption>
                            <PaymentTypeOption>
                              <input
                                type="checkbox"
                                checked={item.paymentType === "ACTUAL"}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    updateEditItem(item.id, { paymentType: "ACTUAL" });
                                  }
                                }}
                              />
                              <span>실 결제</span>
                            </PaymentTypeOption>
                          </PaymentTypeGroup>
                        </ItemFieldRow>
                      </EditItemBlock>
                    ))}
                  </EditItemList>
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
                        <th>구매 일자</th>
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
                            {item.purchaseDate ? formatUtcToKstShortDate(item.purchaseDate) : "-"}
                          </td>
                          <td>
                            {item.receipt ? (
                              <InlineReceiptLink
                                href={item.receipt.fileUrl ?? item.receipt.url ?? "#"}
                                download={getReceiptName(item.receipt)}
                              >
                                {getReceiptName(item.receipt)}
                                <ReceiptIcon aria-hidden="true">
                                  <IconDownload size={16} stroke={2.25} />
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
                      const balance = purchase?.vendorBalances?.find(
                        (item) => item.vendorName === vendorName,
                      );

                      return (
                        <tr key={vendorName}>
                          <th scope="row">{vendorName}</th>
                          <td>{formatAmount(balance?.balance ?? balance?.totalAmount)}</td>
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

              {canShowReportForm ? (
                <ReportForm onSubmit={handleReportSubmit}>
                  <SectionTitle>구매 완료 보고</SectionTitle>
                  {reportItems.map((item, index) => (
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
                        value={item.vendorName}
                        onChange={(event) =>
                          updateReportItem(item.itemId, { vendorName: event.target.value })
                        }
                      >
                        <option value="">거래처 선택</option>
                        {vendorNames.map((vendorName) => (
                          <option key={vendorName} value={vendorName}>
                            {vendorName}
                          </option>
                        ))}
                      </ReportSelect>
                      <ReportLabel htmlFor={`price-${item.itemId}`}>결제 금액</ReportLabel>
                      <ReportInput
                        id={`price-${item.itemId}`}
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        value={item.price}
                        onChange={(event) =>
                          updateReportItem(item.itemId, { price: event.target.value })
                        }
                      />
                      <ReportLabel htmlFor={`purchaseDate-${item.itemId}`}>구매 일자</ReportLabel>
                      <ReportInput
                        id={`purchaseDate-${item.itemId}`}
                        type="date"
                        value={item.purchaseDate}
                        onChange={(event) =>
                          updateReportItem(item.itemId, { purchaseDate: event.target.value })
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
                  <ReportSubmitButton type="submit" disabled={!canSubmitReport}>
                    {reportMutation.isPending ? "보고 중" : "구매 완료 보고하기"}
                  </ReportSubmitButton>
                  {reportMutation.isError ? (
                    <StateMessage role="alert">구매 완료 보고에 실패했습니다.</StateMessage>
                  ) : null}
                </ReportForm>
              ) : null}
              {isEditing ? (
                <EditActionRow>
                  <ReportSubmitButton type="submit">수정 완료</ReportSubmitButton>
                  <CancelEditButton type="button" onClick={() => setIsEditing(false)}>
                    취소
                  </CancelEditButton>
                </EditActionRow>
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

const EditActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
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

const BaseAction = styled.button<{ $variant?: "default" | "danger" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 0;
  border-radius: ${radii.radius15};
  background-color: ${({ $variant }) => ($variant === "danger" ? "#fde4e2" : colors.point)};
  padding: 0.8125rem ${spacing.space20};
  color: ${({ $variant }) => ($variant === "danger" ? "#da3a30" : colors.white)};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  cursor: pointer;

  &:disabled {
    background-color: #d4d4d4;
    color: #7b7b7b;
    cursor: not-allowed;
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
  border-radius: ${radii.radius15};
  background-color: ${colors.point};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

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

const EditItemList = styled.div`
  display: flex;
  flex-direction: column;
`;

const EditItemBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding: ${spacing.space20} 0;
  border-bottom: 1px solid #bcbcbc;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-bottom: 1.875rem;
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
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space16};
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  input {
    accent-color: ${colors.point};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const BalanceList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: ${spacing.space8};
  padding: ${spacing.space12};
  background-color: ${colors.background};

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    padding: ${spacing.space20};
  }
`;

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
  min-height: 2.5rem;
  padding: ${spacing.space8} ${spacing.space12};
  background-color: ${colors.white};
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  strong {
    font-weight: 700;
    white-space: nowrap;
  }

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    padding: ${spacing.space12} ${spacing.space20};
    font-size: ${typography.fontSize20};
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

const ReceiptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  min-width: 0;
  background-color: ${colors.background};
  padding: ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

const StateMessage = styled.p`
  margin: 0 0 ${spacing.space20};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
`;

const EmptyText = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
`;

const ReceiptRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: ${spacing.space8};
  min-width: 0;
`;

const ReceiptName = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ReceiptDownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ReceiptIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
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

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 0.8fr) auto minmax(0, 0.8fr)
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
  border: 0;
  border-radius: ${radii.radius15};
  background-color: ${colors.point};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:disabled {
    background-color: #d4d4d4;
    color: #7b7b7b;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const CancelEditButton = styled(ReportSubmitButton)`
  border: 1px solid ${colors.border};
  background-color: ${colors.white};
  color: #000000;
`;
