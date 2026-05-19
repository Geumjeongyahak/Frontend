import type { RequestStatus } from "@/api/request/request.dto";

export type RequestStatusTone = "PENDING" | "APPROVED" | "REJECTED";

export function formatRequestStatus(status?: RequestStatus | string) {
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "거절됨";
  if (status === "COMPLETED") return "완료";
  if (status === "EXPIRED") return "만료";
  if (status === "CANCELLED") return "취소됨";
  if (status === "PENDING") return "대기 중";
  return "대기 중";
}

/** 목록 배지 색상용: COMPLETED·EXPIRED·CANCELLED 등을 3-tone으로 묶음 */
export function normalizeRequestStatusTone(status?: string): RequestStatusTone {
  if (status === "APPROVED" || status === "COMPLETED") return "APPROVED";
  if (status === "REJECTED" || status === "EXPIRED" || status === "CANCELLED") return "REJECTED";
  return "PENDING";
}
