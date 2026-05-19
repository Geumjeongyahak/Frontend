export type LessonExchangeRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | string;

export type LessonExchangeProposalStatus = "ACTIVE" | "ACCEPTED" | "WITHDRAWN" | "CLOSED" | string;

export interface LessonExchangePathParamsDto {
  requestId: number;
}

export interface LessonExchangeProposalPathParamsDto extends LessonExchangePathParamsDto {
  proposalId: number;
}

export interface LessonExchangeListQueryParamsDto {
  status?: LessonExchangeRequestStatus;
  mine?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CreateLessonExchangeRequestDto {
  lessonDate: string;
  title: string;
  content: string;
  expiresAt: string;
}

export interface UpdateLessonExchangeRequestDto {
  lessonDate?: string;
  title?: string;
  content?: string;
  expiresAt?: string;
}

export interface RejectLessonExchangeRequestDto {
  note: string;
}

export interface ApproveLessonExchangeRequestDto {
  proposalId?: number;
  exchangeWithUserId?: number;
}

export interface LessonExchangeRequestDetailDto {
  id?: number;
  classroomName?: string;
  lessonDate?: string;
  requestedById?: number;
  requestedByName?: string;
  title?: string;
  content?: string;
  status?: LessonExchangeRequestStatus;
  scope?: string;
  expiresAt?: string;
  processedAt?: string;
  processedByName?: string;
  rejectionNote?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
}

export interface LessonExchangeRequestListItemDto {
  id: number;
  dailyScheduleId: number;
  classroomName: string;
  requestedByName: string;
  title: string;
  status: LessonExchangeRequestStatus;
  createdAt: string;
}

export interface LessonExchangeRequestListResponseDto {
  content: LessonExchangeRequestListItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LessonExchangeProposalRequestDto {
  lessonDate?: string;
  content: string;
}

export interface UpdateLessonExchangeProposalRequestDto {
  lessonDate?: string;
  content?: string;
}

export interface LessonExchangeProposalDto {
  id?: number;
  requestId?: number;
  classroomName?: string;
  proposedById?: number;
  proposedByName?: string;
  proposalType?: string;
  proposalScope?: string;
  lessonDate?: string;
  content?: string;
  status?: LessonExchangeProposalStatus;
  acceptedAt?: string;
  withdrawnAt?: string;
  closedAt?: string;
  createdAt?: string;
}

export type LessonExchangeProposalListResponseDto = LessonExchangeProposalDto[];
