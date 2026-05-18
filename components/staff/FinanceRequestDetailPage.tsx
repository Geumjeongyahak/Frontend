"use client";

import Link from "next/link";
import { IconDownload } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  deletePurchaseRequest,
  getPurchaseRequestDetail,
} from "@/api/request/request.api";
import type { PurchaseRequestStatus } from "@/api/request/request.dto";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestDetailPageProps = {
  requestId: number;
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  PENDING: "대기 중",
  APPROVED: "승인 완료",
  PURCHASED: "구매 완료",
  CONFIRMED: "결재 확인",
  REJECTED: "반려",
};

function getStatusLabel(status?: PurchaseRequestStatus) {
  return status ? (statusLabels[status] ?? status) : "-";
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
  const { data: request, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.purchaseDetail(requestId),
    queryFn: () => getPurchaseRequestDetail({ requestId }),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePurchaseRequest({ requestId }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseDetail(requestId) });
      queryClient.removeQueries({ queryKey: queryKeys.requests.purchaseList() });
      router.replace("/staff/finance");
    },
  });

  const detailItems =
    request?.items?.length
      ? request.items.map((item, index) => ({
          id: item.id ?? index,
          name: item.name ?? "-",
          reason: item.reason ?? request.content ?? "-",
          price: item.actualPrice ?? item.expectedPrice,
        }))
      : [
          {
            id: request?.id ?? 0,
            name: request?.title ?? "-",
            reason: request?.content ?? "-",
            price: request?.totalPrice,
          },
        ];

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
            <ActionButton type="button" disabled title="백엔드 수정 API가 아직 없습니다.">
              수정
            </ActionButton>
            <ListButton href="/staff/finance">목록</ListButton>
          </Actions>

          {isLoading ? <StateMessage>결제 신청 정보를 불러오는 중입니다.</StateMessage> : null}
          {isError ? (
            <StateMessage role="alert">결제 신청 정보를 불러오지 못했습니다.</StateMessage>
          ) : null}
          {deleteMutation.isError ? (
            <StateMessage role="alert">결제 신청 삭제에 실패했습니다.</StateMessage>
          ) : null}

          {request ? (
            <ContentColumn>
              <DateBar>{formatUtcToKstShortDate(request.createdAt)}</DateBar>

              <Section>
                <Label>제목</Label>
                <Field>{request.title ?? "-"}</Field>
              </Section>

              <Section>
                <SectionTitle>신청자 정보</SectionTitle>
                <InfoRow>
                  <InlineLabel>반 이름</InlineLabel>
                  <InlineField>{request.classroomName ?? "-"}</InlineField>
                  <InlineLabel>결제 일자</InlineLabel>
                  <InlineField>{formatUtcToKstShortDate(request.createdAt)}</InlineField>
                  <InlineLabel>신청자</InlineLabel>
                  <InlineField>{request.requestedByName ?? "-"}</InlineField>
                </InfoRow>
              </Section>

              <Section>
                <SectionTitle>상세 품목</SectionTitle>
                <DetailItemList>
                  {detailItems.map((item, index) => (
                    <DetailItemRow key={`${item.id}-${index}`}>
                      <DetailLabel>품목 {index + 1}</DetailLabel>
                      <DetailField>{item.name}</DetailField>
                      <DetailLabel>결제 사유</DetailLabel>
                      <ReasonField>{item.reason}</ReasonField>
                      <DetailLabel>금액</DetailLabel>
                      <DetailField>
                        {typeof item.price === "number" ? `${item.price.toLocaleString()}원` : "-"}
                      </DetailField>
                    </DetailItemRow>
                  ))}
                </DetailItemList>
              </Section>

              <Section>
                <SectionTitle>영수증</SectionTitle>
                <ReceiptList>
                  {request.receipts?.length ? (
                    request.receipts.map((receipt) => {
                      const receiptName = getReceiptName(receipt);
                      const receiptUrl = receipt.fileUrl ?? receipt.url ?? "#";

                      return (
                        <ReceiptRow key={receipt.id ?? receipt.fileId ?? receiptName}>
                          <ReceiptName>{receiptName}</ReceiptName>
                          <ReceiptDownloadButton
                            href={receiptUrl}
                            download={receiptName}
                            aria-label={`${receiptName} 다운로드`}
                          >
                            <span>다운로드</span>
                            <ReceiptIcon aria-hidden="true">
                              <IconDownload size={16} stroke={2.25} />
                            </ReceiptIcon>
                          </ReceiptDownloadButton>
                        </ReceiptRow>
                      );
                    })
                  ) : (
                    <EmptyText>등록된 영수증이 없습니다.</EmptyText>
                  )}
                </ReceiptList>
              </Section>

              <Section>
                <SectionTitle>신청 현황</SectionTitle>
                <StatusField>{getStatusLabel(request.status)}</StatusField>
              </Section>
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
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
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

const DetailItemList = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailItemRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(9.25rem, 13.75rem) auto minmax(0, 1fr) auto minmax(
      5.875rem,
      6.25rem
    );
  align-items: flex-start;
  gap: ${spacing.space12};
  padding-bottom: ${spacing.space20};
  border-bottom: 1px solid #d4d4d4;

  & + & {
    padding-top: ${spacing.space20};
  }

  @media (min-width: 120rem) {
    grid-template-columns: auto 17.25rem auto minmax(0, 1fr) auto 7.875rem;
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: auto minmax(0, 1fr);
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const DetailLabel = styled(InlineLabel)`
  min-height: 2.6875rem;
  display: inline-flex;
  align-items: center;

  @media (min-width: 120rem) {
    min-height: 4rem;
  }
`;

const DetailField = styled(Field)`
  color: #7b7b7b;
`;

const ReasonField = styled(DetailField)`
  align-items: flex-start;
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

const StatusField = styled(Field)`
  width: fit-content;
  justify-content: center;
  border-radius: ${radii.radius15};
  background-color: #fbf4d7;
  padding-inline: ${spacing.space20};
  color: #e5ad34;
  font-weight: 600;

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;
