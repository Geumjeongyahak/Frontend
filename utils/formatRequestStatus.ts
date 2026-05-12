import type { RequestStatus } from "@/api/request/request.dto";

export function formatRequestStatus(status?: RequestStatus | string) {
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "거절됨";
  return "대기 중";
}
