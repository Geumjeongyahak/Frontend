export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AbsenceRequestStatus = RequestStatus | "CANCELLED" | "EXPIRED";
export type LessonExchangeRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";
export type PurchaseRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "PURCHASED"
  | "CONFIRMED"
  | "REJECTED";
export type PaymentType = "PREPAID" | "ACTUAL";
export type ExpenseDocumentPaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER"
  | "AUTO_TRANSFER"
  | "OTHER";

export type PurchasePaymentMethod = ExpenseDocumentPaymentMethod;

export type ProposalPaymentAccount =
  | "NATIONAL_SUBSIDY_04"
  | "DISTRICT_BUDGET_01"
  | "DISTRICT_BUDGET_08";

export type ProposalBudgetItemCategory =
  | "TRANSPORTATION"
  | "TEXTBOOK"
  | "PROGRAM_OPERATION"
  | "RENTAL"
  | "PUBLIC_RELATIONS"
  | "OTHER_OPERATING"
  | "DIRECT_INPUT";

export type ProposalCalculationDetail =
  | "UNPAID_INSTRUCTOR_TRANSPORTATION"
  | "UNPAID_ADMIN_TRANSPORTATION"
  | "COMMERCIAL_TEXTBOOK"
  | "BOUND_TEXTBOOK"
  | "PICNIC_MEAL"
  | "EVENT_SUPPLIES"
  | "BANNER"
  | "REFRESHMENTS"
  | "POSTER"
  | "NEWSLETTER"
  | "SIGN_BANNER_STICKER_PRODUCTION"
  | "TRANSFER_FEE"
  | "OFFICE_SUPPLIES"
  | "COMMUNICATION"
  | "ELECTRICITY"
  | "WATER"
  | "WATER_PURIFIER_FILTER_REPLACEMENT"
  | "CLEANING_SUPPLIES"
  | "PRINTER_TONER"
  | "DIRECT_INPUT";

export interface RequestStatusQueryParamsDto {
  status?: RequestStatus;
  mine?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PurchaseRequestStatusQueryParamsDto {
  status?: PurchaseRequestStatus;
  paymentType?: PaymentType;
  mine?: boolean;
  keyword?: string;
  classroomName?: string;
  departmentName?: string;
  requestedByName?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface LessonExchangeRequestStatusQueryParamsDto {
  status?: LessonExchangeRequestStatus;
  mine?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface RequestPathParamsDto {
  requestId: number;
}

export interface ProposalReceiptPathParamsDto extends RequestPathParamsDto {
  receiptId: number;
}

export interface ProposalApprovalLineDto {
  position?: string;
  name?: string;
}

export interface ProposalBudgetDto {
  itemCategory?: ProposalBudgetItemCategory;
  customItemCategory?: string;
  calculationDetail?: ProposalCalculationDetail;
  customCalculationDetail?: string;
}

export interface ProposalItemDto {
  content?: string;
  specification?: string;
  quantity?: number;
  estimatedUnitPrice?: number;
  expectedAmountWithinRange?: boolean;
}

export interface SavePurchaseRequestProposalRequestDto {
  proposalTitle?: string;
  resolutionTitle?: string;
  completionDate?: string;
  draftApprovals?: ProposalApprovalLineDto[];
  draftCooperations?: ProposalApprovalLineDto[];
  resolutionApprovals?: ProposalApprovalLineDto[];
  overview?: string;
  policyProject?: string;
  unitProject?: string;
  detailProject?: string;
  requestDepartmentId?: number;
  proposalDate?: string;
  proposalAmount?: number;
  paymentAccount?: ProposalPaymentAccount;
  budget?: ProposalBudgetDto | null;
  items?: ProposalItemDto[] | null;
}

export interface AttachPurchaseRequestProposalReceiptRequestDto {
  fileId: string;
}

export interface PurchaseRequestProposalBudgetResponseDto extends ProposalBudgetDto {
  id?: number;
}

export interface PurchaseRequestProposalItemResponseDto extends ProposalItemDto {
  id?: number;
  expectedAmount?: number;
  sortOrder?: number;
}

export interface PurchaseRequestProposalReceiptResponseDto {
  id?: number;
  fileId?: string;
  originalName?: string;
  contentType?: string;
  fileUrl?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface PurchaseRequestProposalResponseDto {
  id?: number;
  proposalNumber?: string | null;
  proposalTitle?: string | null;
  resolutionTitle?: string | null;
  completionDate?: string | null;
  draftApprovals?: (ProposalApprovalLineDto & { sortOrder?: number })[];
  draftCooperations?: (ProposalApprovalLineDto & { sortOrder?: number })[];
  resolutionApprovals?: (ProposalApprovalLineDto & { sortOrder?: number })[];
  overview?: string | null;
  policyProject?: string | null;
  unitProject?: string | null;
  detailProject?: string | null;
  requestDepartmentId?: number | null;
  requestDepartmentName?: string | null;
  proposalDate?: string | null;
  proposalAmount?: number | null;
  paymentAccount?: ProposalPaymentAccount | null;
  budget?: PurchaseRequestProposalBudgetResponseDto | null;
  items?: PurchaseRequestProposalItemResponseDto[];
  receipts?: PurchaseRequestProposalReceiptResponseDto[];
  createdAt?: string;
  updatedAt?: string;
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
  paymentType: PaymentType;
  classroomId?: number | null;
  departmentId?: number | null;
  items: PurchaseRequestItemDto[];
}

export interface CreateAdminPurchaseRequestDto extends CreatePurchaseRequestDto {
  requestedById: number;
}

export interface PurchaseRequestItemDto {
  name: string;
  quantity: number;
  reason?: string;
  /** @deprecated 결제 유형은 요청 단위의 paymentType으로 전달합니다. */
  paymentType?: PaymentType;
}

export interface PurchaseTransactionReportDto {
  vendorId: number;
  itemNames: string[];
  amount: number;
  paymentMethod?: PurchasePaymentMethod;
  receiptFileId?: string;
}

export interface ReportPurchaseRequestDto {
  classroomId?: number | null;
  departmentId?: number | null;
  transactions: PurchaseTransactionReportDto[];
}

export interface ReviewPurchaseRequestDto {
  note: string;
}

export interface UpdatePurchaseRequestDto {
  title: string;
  content: string;
  classroomId?: number | null;
  departmentId?: number | null;
  items: PurchaseRequestItemDto[];
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
  paymentMethod?: PurchasePaymentMethod;
  receiptFileId?: string;
  receiptFileUrl?: string;
}

export interface PurchaseRequestSummaryResponseDto {
  id?: number;
  paymentType?: PaymentType;
  classroomId?: number | null;
  classroomName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  totalPrice?: number;
  status?: PurchaseRequestStatus;
  createdAt?: string;
}

export interface PurchaseRequestResponseDto extends PurchaseRequestSummaryResponseDto {
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
  proposal?: PurchaseRequestProposalResponseDto | null;
}

export type UpdateAdminPurchaseRequestDto = UpdatePurchaseRequestDto;

export type PurchaseRequestListItemDto = PurchaseRequestResponseDto;

export interface PurchaseRequestListResponseDto {
  content: PurchaseRequestSummaryResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

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
  status?: LessonExchangeRequestStatus;
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

export interface LessonExchangeRequestListResponseDto {
  content: LessonExchangeRequestListItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApproveLessonExchangeRequestDto {
  exchangeWithUserId: number;
}

export interface RejectRequestDto {
  note: string;
}

export interface ApprovalLineDto {
  position?: string;
  name?: string;
}

export interface ExpenseDocumentItemDto {
  spec?: string;
  unitPrice?: number;
}

export interface GenerateExpenseDocumentRequestDto {
  fiscalYear?: string;
  draftDocumentNumber?: string;
  resolutionDocumentNumber?: string;
  policyProject?: string;
  unitProject?: string;
  detailProject?: string;
  budgetDetail?: string;
  budgetBalance?: number;
  projectBalance?: number;
  requestDepartment?: string;
  draftDate?: string;
  completionDate?: string;
  receiver?: string;
  paymentMethod?: ExpenseDocumentPaymentMethod;
  initiationDate?: string;
  resolutionDate?: string;
  paymentDate?: string;
  bankAccount?: string;
  businessNumber?: string;
  accountHolder?: string;
  note?: string;
  items?: ExpenseDocumentItemDto[];
  draftApprovals?: ApprovalLineDto[];
  draftCooperations?: ApprovalLineDto[];
  resolutionApprovals?: ApprovalLineDto[];
}
