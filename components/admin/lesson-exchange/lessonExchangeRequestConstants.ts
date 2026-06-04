import type {
  LessonExchangeRequestDetailDto,
  LessonExchangeRequestStatus,
} from "@/api/lessonExchange/lessonExchange.dto";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const TERMINAL_LESSON_EXCHANGE_STATUSES: LessonExchangeRequestStatus[] = [
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

export type LessonExchangeDetailActionState = "empty" | "actionable" | "processed" | "expired";

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

export function isLessonExchangeTerminalStatus(status?: LessonExchangeRequestStatus) {
  if (!status) return false;
  return TERMINAL_LESSON_EXCHANGE_STATUSES.includes(status);
}

export function isLessonExchangeExpired(detail?: LessonExchangeRequestDetailDto) {
  return detail?.status === "EXPIRED";
}

/** 처리 완료·종료 상태(승인/반려/완료/취소) 또는 processedAt 존재 */
export function isLessonExchangeProcessed(detail?: LessonExchangeRequestDetailDto) {
  if (!detail) return false;
  return Boolean(detail.processedAt) || isLessonExchangeTerminalStatus(detail.status);
}

export function shouldShowLessonExchangeProcessingMeta(detail?: LessonExchangeRequestDetailDto) {
  return isLessonExchangeProcessed(detail);
}

export function canProcessLessonExchangeRequest(detail?: LessonExchangeRequestDetailDto) {
  if (!detail || isLessonExchangeExpired(detail)) return false;
  return detail.status === "PENDING" && !isLessonExchangeProcessed(detail);
}

export function getLessonExchangeRejectionNote(detail?: LessonExchangeRequestDetailDto) {
  return detail?.rejectionNote?.trim() ?? "";
}

export function hasLessonExchangeSupplementalContent(detail?: LessonExchangeRequestDetailDto) {
  return Boolean(
    getLessonExchangeRejectionNote(detail) || shouldShowLessonExchangeProcessingMeta(detail),
  );
}

export function getLessonExchangeDetailActionState(
  detail?: LessonExchangeRequestDetailDto,
): LessonExchangeDetailActionState {
  if (!detail) return "empty";
  if (isLessonExchangeExpired(detail)) return "expired";
  if (canProcessLessonExchangeRequest(detail)) return "actionable";
  if (isLessonExchangeProcessed(detail)) return "processed";
  return "empty";
}
