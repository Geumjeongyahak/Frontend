export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PurchaseRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "PURCHASED"
  | "CONFIRMED"
  | "REJECTED";

export interface RequestStatusQueryParamsDto {
  status?: RequestStatus;
  mine?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PurchaseRequestStatusQueryParamsDto {
  status?: PurchaseRequestStatus;
}

export interface RequestPathParamsDto {
  requestId: number;
}

export interface CreateAbsenceRequestDto {
  lessonId: number;
  reason: string;
}

export interface UpdateAbsenceRequestDto {
  title: string;
  reason: string;
}

export interface AbsenceRequestResponseDto {
  id?: number;
  lessonId?: number;
  dailyScheduleId?: number;
  lessonDate?: string;
  classroomId?: number;
  classroomName?: string;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  reason?: string;
  expiresAt?: string;
  status?: RequestStatus;
  approvalAt?: string;
  approvalByName?: string;
  note?: string;
  createdAt?: string;
}

export interface AbsenceRequestListResponseDto {
  content: AbsenceRequestResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type AbsenceRequestListItemDto = AbsenceRequestResponseDto;

export interface CreatePurchaseRequestDto {
  title: string;
  content: string;
  classroomId: number;
  advancePaymentRequestedAmount?: number;
  receiptFileIds?: string[];
  items: PurchaseRequestItemDto[];
}

export interface PurchaseRequestItemDto {
  name: string;
  reason?: string;
  expectedPrice?: number;
}

export interface PurchaseRequestItemReportDto {
  itemId: number;
  price: number;
}

export interface ReportPurchaseRequestDto {
  items: PurchaseRequestItemReportDto[];
  receiptFileIds?: string[];
}

export interface ReviewPurchaseRequestDto {
  note: string;
  advancePaymentApprovedAmount?: number;
}

export interface RequestReconfirmationResponseDto {
  message?: string;
}

export interface PurchaseRequestItemResponseDto {
  id?: number;
  name?: string;
  reason?: string;
  expectedPrice?: number;
  actualPrice?: number;
}

export interface PurchaseRequestReceiptResponseDto {
  id?: number;
  fileId?: string;
  fileName?: string;
  originalName?: string;
  ext?: string;
  fileUrl?: string;
  url?: string;
}

export interface PurchaseRequestSummaryResponseDto {
  id?: number;
  classroomName?: string;
  requestedByName?: string;
  title?: string;
  totalPrice?: number;
  advancePaymentRequestedAmount?: number;
  advancePaymentApprovedAmount?: number;
  status?: PurchaseRequestStatus;
  createdAt?: string;
}

export interface PurchaseRequestResponseDto extends PurchaseRequestSummaryResponseDto {
  classroomId?: number;
  requestedById?: number;
  content?: string;
  approvalAt?: string;
  approvalByName?: string;
  purchasedAt?: string;
  note?: string;
  items?: PurchaseRequestItemResponseDto[];
  receipts?: PurchaseRequestReceiptResponseDto[];
}

export type PurchaseRequestListItemDto = PurchaseRequestResponseDto;

export interface CreateLessonExchangeRequestDto {
  lessonId: number;
  title: string;
  content: string;
}

export interface LessonExchangeRequestResponseDto {
  id?: number;
  lessonId?: number;
  lessonDate?: string;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  content?: string;
  status?: RequestStatus;
  approvalAt?: string;
  approvalByName?: string;
  note?: string;
  createdAt?: string;
}

export type LessonExchangeRequestListItemDto = LessonExchangeRequestResponseDto;

export interface ApproveLessonExchangeRequestDto {
  exchangeWithUserId: number;
}

export interface RejectRequestDto {
  note: string;
}
