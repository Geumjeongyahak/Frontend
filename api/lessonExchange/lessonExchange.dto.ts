export type LessonExchangeRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | string;

export type LessonExchangeProposalStatus =
  | "ACTIVE"
  | "ACCEPTED"
  | "WITHDRAWN"
  | "CLOSED"
  | string;

export interface LessonExchangePathParamsDto {
  requestId: number;
}

export interface LessonExchangeProposalPathParamsDto extends LessonExchangePathParamsDto {
  proposalId: number;
}

export interface LessonExchangeListQueryParamsDto {
  status?: LessonExchangeRequestStatus;
}

export interface CreateLessonExchangeRequestDto {
  lessonDate: string;
  title: string;
  content: string;
  startPeriod?: number;
  endPeriod?: number;
  expiresAt: string;
}

export interface UpdateLessonExchangeRequestDto {
  lessonDate?: string;
  title?: string;
  content?: string;
  startPeriod?: number;
  endPeriod?: number;
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
  startPeriod?: number;
  endPeriod?: number;
  expiresAt?: string;
  processedAt?: string;
  processedByName?: string;
  rejectionNote?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LessonExchangeRequestListResponseDto = LessonExchangeRequestDetailDto[];

export interface LessonExchangeProposalRequestDto {
  lessonDate?: string;
  startPeriod?: number;
  endPeriod?: number;
  content: string;
}

export interface UpdateLessonExchangeProposalRequestDto {
  lessonDate?: string;
  startPeriod?: number;
  endPeriod?: number;
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
  startPeriod?: number;
  endPeriod?: number;
  content?: string;
  status?: LessonExchangeProposalStatus;
  acceptedAt?: string;
  withdrawnAt?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LessonExchangeProposalListResponseDto = LessonExchangeProposalDto[];
