"use client";

import styled from "styled-components";
import type { LessonExchangeRequestStatus } from "@/api/lessonExchange/lessonExchange.dto";
import { formatLessonExchangeStatus } from "@/components/admin/lesson-exchange/lessonExchangeRequestConstants";
import { typography } from "@/styles/tokens";

export function LessonExchangeStatusBadge({ status }: { status?: LessonExchangeRequestStatus }) {
  if (!status) return <>-</>;

  return <Badge $status={status}>{formatLessonExchangeStatus(status)}</Badge>;
}

const Badge = styled.span<{ $status: LessonExchangeRequestStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  color: ${({ $status }) => {
    switch ($status) {
      case "APPROVED":
      case "COMPLETED":
        return "#3DA75C";
      case "REJECTED":
        return "#DA3A30";
      case "CANCELLED":
        return "#64706C";
      case "EXPIRED":
        return "#B45F06";
      case "PENDING":
      default:
        return "#E5AD34";
    }
  }};

  background: ${({ $status }) => {
    switch ($status) {
      case "APPROVED":
      case "COMPLETED":
        return "#DCF4EA";
      case "REJECTED":
        return "#FDEBE9";
      case "CANCELLED":
        return "#EEF0EF";
      case "EXPIRED":
        return "#FFF3E0";
      case "PENDING":
      default:
        return "#FFF6DB";
    }
  }};
`;
