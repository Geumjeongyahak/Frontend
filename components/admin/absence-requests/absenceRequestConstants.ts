import type { AbsenceRequestStatus } from "@/api/request/request.dto";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

export const ABSENCE_ITEMS_PER_PAGE = 11;

export const ABSENCE_STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "승인 대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
  { value: "CANCELLED", label: "취소" },
  { value: "EXPIRED", label: "만료" },
] as const;

export type AbsenceStatusFilter = (typeof ABSENCE_STATUS_OPTIONS)[number]["value"];

export function formatAbsenceStatus(status?: AbsenceRequestStatus) {
  return ABSENCE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "-";
}

export function formatAbsenceDate(value?: string) {
  return value ? formatUtcToKstShortDate(value) : "-";
}
