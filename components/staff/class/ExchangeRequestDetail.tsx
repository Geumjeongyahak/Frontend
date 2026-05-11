"use client";

import styled from "styled-components";
import type { LessonExchangeRequestStatus } from "@/api/lessonExchange/lessonExchange.dto";
import { layout, spacing, typography } from "@/styles/tokens";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import { useExchangePostPage } from "@/app/staff/class/exchange/[postId]/useExchangePostPage";

type ExchangeStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ExchangeRequestDetailProps {
  page: ReturnType<typeof useExchangePostPage>;
}

function normalizeRequestStatusTone(
  status: LessonExchangeRequestStatus | undefined,
): ExchangeStatus {
  if (status === "APPROVED" || status === "COMPLETED") return "APPROVED";

  if (status === "REJECTED" || status === "EXPIRED" || status === "CANCELLED") return "REJECTED";

  return "PENDING";
}

export function ExchangePostDetail({ page }: ExchangeRequestDetailProps) {
  const request = page.request;

  const detailStatusTone = normalizeRequestStatusTone(request?.status);
  const detailStatus = page.requestError ? "확인 불가" : formatRequestStatus(request?.status);

  return (
    <>
      <DateBar>{formatUtcToKstShortDate(request?.createdAt)}</DateBar>

      <PostSection>
        <Label>제목</Label>

        {page.isEditing ? (
          <EditInput value={page.editTitle} onChange={(e) => page.setEditTitle(e.target.value)} />
        ) : (
          <ApplicantFieldValue>{request?.title || "—"}</ApplicantFieldValue>
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
            <ApplicantField>
              <ApplicantBoxLabel>수업 일자</ApplicantBoxLabel>
              <ApplicantFieldValue>
                {formatUtcToKstShortDate(request?.lessonDate) || "—"}
              </ApplicantFieldValue>
            </ApplicantField>
          </ApplicantBoxRow>

          <ApplicantFullWidthField></ApplicantFullWidthField>

          <ApplicantNextRowField>
            <ApplicantBoxLabel>교환 신청 사유</ApplicantBoxLabel>
            {page.isEditing ? (
              <EditTextarea
                value={page.editContent}
                onChange={(e) => page.setEditContent(e.target.value)}
              />
            ) : (
              <ApplicantFieldValue>{request?.content || "—"}</ApplicantFieldValue>
            )}
          </ApplicantNextRowField>

          <ApplicantNextRowField>
            <ApplicantBoxLabel>만료일</ApplicantBoxLabel>

            {page.isEditing ? (
              <EditInput
                type="date"
                value={page.editExpiresAt}
                onChange={(e) => page.setEditExpiresAt(e.target.value)}
              />
            ) : (
              <ExpiresDateBox>{formatUtcToKstShortDate(request?.expiresAt)}</ExpiresDateBox>
            )}
          </ApplicantNextRowField>
        </ApplicantSection>

        <Label>신청 현황</Label>

        <StatusBadge $tone={detailStatusTone}>{detailStatus}</StatusBadge>
      </PostSection>
    </>
  );
}

const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #a9a9a9;
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
  background: #f8f8f8;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

const ApplicantNextRowField = styled.div`
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

const StatusBadge = styled.span<{ $tone: ExchangeStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.5rem;
  padding: ${({ $tone }) => ($tone === "PENDING" ? "0.75rem 1.125rem" : "0.375rem 0.875rem")};
  border-radius: 8px;
  font-size: ${typography.fontSize13};
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

const ExpiresDateBox = styled(ValueBox)`
  display: inline-flex;
  width: fit-content;
  padding: 0 1.5rem 0 1rem;
`;

const EditInput = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};

  border: 1px solid #c0c0c0;
  background: #ffffff;
  outline: none;

  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const EditTextarea = styled.textarea`
  width: 100%;
  min-height: 10rem;
  padding: 0.8125rem ${spacing.space12};

  border: 1px solid #c0c0c0;
  background: #ffffff;
  outline: none;
  resize: vertical;

  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 14rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
