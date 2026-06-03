import type { LessonExchangeRequestStatus } from "@/api/lessonExchange/lessonExchange.dto";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

export const LESSON_EXCHANGE_ITEMS_PER_PAGE = 8;

export const LESSON_EXCHANGE_STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "승인 대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
  { value: "CANCELLED", label: "취소" },
  { value: "EXPIRED", label: "만료" },
] as const;

export type LessonExchangeStatusFilter = (typeof LESSON_EXCHANGE_STATUS_OPTIONS)[number]["value"];

const LESSON_EXCHANGE_STATUS_LABELS: Record<string, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
  EXPIRED: "만료",
  COMPLETED: "완료",
};

export function formatLessonExchangeStatus(status?: LessonExchangeRequestStatus) {
  if (!status) return "-";
  return LESSON_EXCHANGE_STATUS_LABELS[status] ?? "-";
}

export function formatLessonExchangeDate(value?: string) {
  return value ? formatUtcToKstShortDate(value) : "-";
}
