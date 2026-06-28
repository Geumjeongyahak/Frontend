import type { PurchaseRequestItemDto } from "@/api/request/request.dto";
import type { UserTeacherAssignmentResponseDto } from "@/api/user/user.dto";

export function buildPurchaseRequestContent(params: {
  classroomName: string;
  applicantName: string;
  items: PurchaseRequestItemDto[];
}) {
  const itemContent = params.items
    .map((item, index) => {
      const reason = item.reason?.trim() ? ` - ${item.reason.trim()}` : "";
      const quantity = Number.isFinite(item.quantity) ? ` ${item.quantity}개` : "";
      const paymentType = item.paymentType === "PREPAID" ? "선금 결제" : "실 결제";

      return `${index + 1}. ${item.name}${quantity} / ${paymentType}${reason}`;
    })
    .join("\n");

  return `소속: ${params.classroomName}\n신청자: ${params.applicantName}\n\n${itemContent}`;
}

export function getAssignmentClassNames(assignments?: UserTeacherAssignmentResponseDto[]) {
  return Array.from(
    new Set(
      (assignments ?? [])
        .map((assignment) => assignment.classroomName?.trim() ?? "")
        .filter((name) => name.length > 0),
    ),
  );
}

export function toExchangeExpiryAt(value: string) {
  return value ? `${value}T23:59:59` : "";
}

export function formatCompactDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const normalized = value.trim();
  const localDateTimeMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);

  if (localDateTimeMatch) {
    return `${localDateTimeMatch[1]} ${localDateTimeMatch[2]}`;
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    const year = String(parsed.getFullYear());
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const hour = String(parsed.getHours()).padStart(2, "0");
    const minute = String(parsed.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  return normalized.replace("T", " ");
}
