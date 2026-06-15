export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AbsenceRequestStatus = RequestStatus | "CANCELLED" | "EXPIRED";
export type PurchaseRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "PURCHASED"
  | "CONFIRMED"
  | "REJECTED";
export type PaymentType = "PREPAID" | "ACTUAL";

export interface RequestStatusQueryParamsDto {
  status?: RequestStatus;
  mine?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PurchaseRequestStatusQueryParamsDto {
  status?: PurchaseRequestStatus;
  keyword?: string;
}

export interface RequestPathParamsDto {
  requestId: number;
}

export interface CreateAbsenceRequestDto {
  lessonDate: string;
  title: string;
  reason: string;
}

export interface UpdateAbsenceRequestDto {
  title: string;
  reason: string;
}

export interface AbsenceRequestResponseDto {
  id?: number;
  dailyScheduleId?: number;
  lessonDate?: string;
  classroomId?: number;
  classroomName?: string;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  reason?: string;
  expiresAt?: string;
  status?: AbsenceRequestStatus;
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
  items: PurchaseRequestItemDto[];
}

export interface PurchaseRequestItemDto {
  name: string;
  quantity: number;
  reason?: string;
  paymentType: PaymentType;
}

export interface PurchaseTransactionReportDto {
  vendorId: number;
  itemNames: string[];
  amount: number;
  receiptFileId?: string;
}

export interface ReportPurchaseRequestDto {
  transactions: PurchaseTransactionReportDto[];
}

export interface ReviewPurchaseRequestDto {
  note: string;
}

export interface RequestReconfirmationResponseDto {
  message?: string;
}

export interface PurchaseRequestItemResponseDto {
  id?: number;
  name?: string;
  quantity?: number;
  reason?: string;
  paymentType?: PaymentType;
}

export interface PurchaseTransactionResponseDto {
  id?: number;
  vendorId?: number;
  vendorName?: string;
  itemNames?: string[];
  amount?: number;
  receiptFileId?: string;
  receiptFileUrl?: string;
}

export interface PurchaseRequestSummaryResponseDto {
  id?: number;
  classroomName?: string;
  requestedByName?: string;
  title?: string;
  totalPrice?: number;
  status?: PurchaseRequestStatus;
  createdAt?: string;
}

export interface PurchaseRequestResponseDto extends PurchaseRequestSummaryResponseDto {
  classroomId?: number;
  requestedById?: number;
  content?: string;
  vendorName?: string;
  vendorBalances?: {
    vendorId?: number;
    vendorName?: string;
    balance?: number;
  }[];
  approvalAt?: string;
  approvalByName?: string;
  purchasedAt?: string;
  note?: string;
  items?: PurchaseRequestItemResponseDto[];
  transactions?: PurchaseTransactionResponseDto[];
}

export type PurchaseRequestListItemDto = PurchaseRequestResponseDto;

export interface CreateLessonExchangeRequestDto {
  lessonDate: string;
  title: string;
  content: string;
  expiresAt: string;
}

export interface LessonExchangeRequestResponseDto {
  id?: number;
  dailyScheduleId?: number;
  classroomName?: string;
  lessonDate?: string;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  content?: string;
  status?: RequestStatus;
  approvalAt?: string;
  approvalByName?: string;
  note?: string;
  expiresAt?: string;
  processedAt?: string;
  processedByName?: string;
  rejectionNote?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
}

export type LessonExchangeRequestListItemDto = LessonExchangeRequestResponseDto;

export interface ApproveLessonExchangeRequestDto {
  exchangeWithUserId: number;
}

export interface RejectRequestDto {
  note: string;
}
