import type { RequestStatus } from "@/api/request/request.dto";

export function formatRequestStatus(status?: RequestStatus | string) {
  if (status === "APPROVED") return "승인 완료";
  if (status === "REJECTED") return "반려";
  return "대기 중";
}
