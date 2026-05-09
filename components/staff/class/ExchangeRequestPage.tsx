"use client";

import Link from "next/link";
import styled from "styled-components";
import type { LessonExchangeRequestStatus } from "@/api/lessonExchange/lessonExchange.dto";
import { FieldInput, FieldTextarea } from "@/components/common/FormField";
import { Button } from "@/components/common/VariantButton";
import { ExchangeProposalList } from "./ExchangeProposalList";
import { ExchangeRequestActionBar } from "./ExchangeRequestActionBar";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import {
  formatUtcToKstShortDate,
  formatUtcToKstShortDateTime,
} from "@/utils/formatUtcToKstShortDate";

import { useExchangePostPage } from "../../../app/staff/class/exchange/[postId]/useExchangePostPage";

type ExchangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ExchangeRequestPageProps {
  page: ReturnType<typeof useExchangePostPage>;
}

function normalizeRequestStatusTone(
  status: LessonExchangeRequestStatus | undefined,
): ExchangeRequestStatus {
  if (status === "APPROVED" || status === "COMPLETED") return "APPROVED";

  if (status === "REJECTED" || status === "EXPIRED" || status === "CANCELLED") return "REJECTED";

  return "PENDING";
}

export function ExchangeRequestPage({ page }: ExchangeRequestPageProps) {
  const request = page.request;

  const canDelete = page.isAuthenticated && page.isValidPostId;
  const canEdit = page.isAuthenticated && page.isValidPostId && !page.requestError;

  const acceptedHref = `/staff/class/exchange/${page.postId}/accepted`;

  const detailTitle = page.requestError
    ? "수업 교환 신청을 불러오지 못했습니다."
    : (request?.title ?? "");

  const detailContent = page.requestError
    ? "교환 신청 사유를 불러오지 못했습니다."
    : (request?.content ?? "");

  const detailStatusTone = normalizeRequestStatusTone(request?.status);

  const detailStatus = page.requestError ? "확인 불가" : formatRequestStatus(request?.status);

  return (
    <PageWrapper>
      <ExchangeRequestActionBar
        canDelete={canDelete}
        canEdit={canEdit}
        isEditing={page.isEditing}
        isUpdating={page.isUpdating}
        onDelete={page.deleteRequest}
        onCancelEdit={page.cancelEdit}
        onSaveEdit={page.saveEdit}
        onStartEdit={page.startEdit}
      />

      <ContentColumn>
        <DateBar>{formatUtcToKstShortDate(request?.createdAt)}</DateBar>

        <PostSection>
          <Label>제목</Label>

          {page.isEditing ? (
            <FieldInput
              aria-label="제목"
              value={page.editTitle}
              onChange={(e) => page.setEditTitle(e.target.value)}
            />
          ) : (
            <ValueBox $weight="semibold">{detailTitle}</ValueBox>
          )}

          <ApplicantSection>
            <Label>신청자 정보</Label>

            <ApplicantBoxRow>
              <ApplicantField>
                <ApplicantBoxLabel>작성자</ApplicantBoxLabel>

                <ApplicantFieldValue>{request?.requestedByName || "—"}</ApplicantFieldValue>
              </ApplicantField>

              <ApplicantField>
                <ApplicantBoxLabel>반 이름</ApplicantBoxLabel>

                <ApplicantFieldValue>{request?.classroomName || "—"}</ApplicantFieldValue>
              </ApplicantField>
            </ApplicantBoxRow>

            <ApplicantFullWidthField>
              <ApplicantBoxLabel>수업 일자</ApplicantBoxLabel>

              {page.isEditing ? (
                <FieldInput
                  aria-label="수업 일자"
                  type="date"
                  value={page.editLessonDate}
                  onChange={(e) => page.setEditLessonDate(e.target.value)}
                />
              ) : (
                <ApplicantFieldValueWide>
                  {formatUtcToKstShortDate(request?.lessonDate) || "—"}
                </ApplicantFieldValueWide>
              )}
            </ApplicantFullWidthField>

            <ApplicantReasonField>
              <ApplicantBoxLabel>교환 신청 사유</ApplicantBoxLabel>

              {page.isEditing ? (
                <FieldTextarea
                  aria-label="교환 신청 사유"
                  rows={6}
                  value={page.editContent}
                  onChange={(e) => page.setEditContent(e.target.value)}
                />
              ) : (
                <ApplicantReasonText>{detailContent || "—"}</ApplicantReasonText>
              )}
            </ApplicantReasonField>
          </ApplicantSection>

          <Label>만료일</Label>

          <ExpiresRow>
            {page.isEditing ? (
              <FieldInput
                aria-label="만료일 시각"
                type="datetime-local"
                value={page.editExpiresAt}
                onChange={(e) => page.setEditExpiresAt(e.target.value)}
              />
            ) : (
              <DateBox>{formatUtcToKstShortDateTime(request?.expiresAt) || "—"}</DateBox>
            )}
          </ExpiresRow>

          <Label>신청 현황</Label>

          <StatusBadge $tone={detailStatusTone}>{detailStatus}</StatusBadge>
        </PostSection>

        <Divider />

        <ProposalHeader>
          <ProposalTitle>교환 제안서</ProposalTitle>

          <Button type="submit" form="exchange-proposal-form" disabled={page.isCreatingProposal}>
            작성 완료
          </Button>
        </ProposalHeader>

        <ProposalForm id="exchange-proposal-form" onSubmit={page.submitProposal}>
          <FieldInput
            $tone="proposal"
            aria-label="수업 일자"
            placeholder="수업 일자"
            type="date"
            value={page.proposalLessonDate}
            onChange={(e) => page.setProposalLessonDate(e.target.value)}
          />

          <ProposalFormTextarea
            $tone="proposal"
            placeholder="내용"
            rows={6}
            value={page.proposalContent}
            onChange={(e) => page.setProposalContent(e.target.value)}
          />
        </ProposalForm>

        <ExchangeProposalList
          acceptedHref={acceptedHref}
          proposals={page.proposals}
          proposalsLoading={page.proposalsLoading}
          proposalsError={page.proposalsError}
        />
      </ContentColumn>
    </PageWrapper>
  );
}

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 1.8125rem 3.125rem 4rem;
  background: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const ProposalFormTextarea = styled(FieldTextarea)`
  grid-column: 1 / -1;
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1.3125rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space32};
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

const PostSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space24};

  @media (min-width: 120rem) {
    gap: ${spacing.space32};
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

const ValueBox = styled.div<{ $weight?: "regular" | "semibold" }>`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: ${({ $weight }) => ($weight === "semibold" ? 600 : 400)};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ApplicantSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
  }
`;

const ApplicantBoxRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const LABEL_FIELD_GAP_MOBILE = spacing.space12;
const LABEL_FIELD_GAP_DESKTOP = spacing.space20;

const ApplicantFullWidthField = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 120rem) {
    gap: ${LABEL_FIELD_GAP_DESKTOP};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ApplicantField = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 120rem) {
    gap: ${LABEL_FIELD_GAP_DESKTOP};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ApplicantReasonField = styled.div`
  display: grid;
  gap: ${LABEL_FIELD_GAP_MOBILE};

  @media (min-width: 120rem) {
    gap: ${LABEL_FIELD_GAP_DESKTOP};
  }
`;

const ApplicantBoxLabel = styled.span`
  flex-shrink: 0;
  min-width: 4.75rem;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ApplicantFieldValue = styled(ValueBox)`
  min-width: 0;
  flex: 1;
`;

const ApplicantFieldValueWide = styled(ValueBox)`
  width: 100%;
  min-width: 0;
  flex: 1;
`;

const ApplicantReasonText = styled(ValueBox)`
  align-items: flex-start;
  min-height: 6.875rem;
  padding-top: 0.75rem;
  word-break: break-word;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding-top: 1.125rem;
  }
`;

const ExpiresRow = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const StatusBadge = styled.span<{ $tone: ExchangeRequestStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.5rem;
  padding: ${({ $tone }) => ($tone === "PENDING" ? "0.5rem 1.125rem" : "0.375rem 0.875rem")};
  border-radius: 999px;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  color: ${({ $tone }) => {
    switch ($tone) {
      case "APPROVED":
        return "#3DA75C";
      case "REJECTED":
        return "#DA3A30";
      case "PENDING":
      default:
        return "#E5AD34";
    }
  }};

  background: ${({ $tone }) => {
    switch ($tone) {
      case "APPROVED":
        return "#DCF4EA";
      case "REJECTED":
        return "#FDEBE9";
      case "PENDING":
      default:
        return "#FFF6DB";
    }
  }};

  @media (min-width: 120rem) {
    min-width: 4.5rem;
    padding: ${({ $tone }) => ($tone === "PENDING" ? "0.625rem 1.375rem" : "0.5rem 1.125rem")};
    font-size: ${typography.fontSize20};
  }
`;

const DateBox = styled(ValueBox)`
  width: 7.75rem;
  flex-shrink: 0;
  justify-content: center;
  text-align: center;

  @media (min-width: 120rem) {
    width: 11.625rem;
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid #a9a9a9;
  margin: 0;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space24};
`;

const ProposalTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const ProposalForm = styled.form`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;
