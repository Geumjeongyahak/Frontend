export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RequestStatusQueryParamsDto {
  status?: RequestStatus;
}

export interface RequestPathParamsDto {
  requestId: number;
}

export interface CreateAbsenceRequestDto {
  lessonId: number;
  reason: string;
}

export interface AbsenceRequestResponseDto {
  id?: number;
  lessonId?: number;
  lessonDate?: string;
  requestedById?: number;
  requestedByName?: string;
  reason?: string;
  status?: RequestStatus;
  approvalAt?: string;
  approvalByName?: string;
  note?: string;
  createdAt?: string;
}

export type AbsenceRequestListItemDto = AbsenceRequestResponseDto;

export interface CreatePurchaseRequestDto {
  subjectId: number;
  title: string;
  content: string;
  price: number;
}

export interface PurchaseRequestResponseDto {
  id?: number;
  subjectId?: number;
  subjectName?: string;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  content?: string;
  price?: number;
  status?: RequestStatus;
  approvalAt?: string;
  approvalByName?: string;
  note?: string;
  createdAt?: string;
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

export interface CreateSubjectExchangeRequestDto {
  subjectId: number;
  title: string;
  content: string;
}

export interface SubjectExchangeRequestResponseDto {
  id?: number;
  subjectId?: number;
  subjectName?: string;
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

export type SubjectExchangeRequestListItemDto = SubjectExchangeRequestResponseDto;

export interface ApproveLessonExchangeRequestDto {
  exchangeWithUserId: number;
}

export interface ApproveSubjectExchangeRequestDto {
  exchangeWithUserId: number;
}

export interface RejectRequestDto {
  note: string;
}
