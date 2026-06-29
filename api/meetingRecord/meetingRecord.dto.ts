export type MeetingRecordStatus = "BEFORE_MEETING" | "AFTER_MEETING";

export interface MeetingRecordListQueryParamsDto {
  page?: number;
  size?: number;
  keyword?: string;
  mineOnly?: boolean;
  status?: MeetingRecordStatus;
}

export interface MeetingRecordPathParamsDto {
  recordId: number;
}

export interface MeetingAbsenceReportPathParamsDto extends MeetingRecordPathParamsDto {
  absenceReportId: number;
}

export interface MeetingRecordSummaryResponseDto {
  id?: number;
  title?: string;
  authorId?: number;
  author?: string;
  createdAt?: string;
  status?: MeetingRecordStatus;
  viewCount?: number;
}

export interface MeetingAbsenceReportResponseDto {
  id?: number;
  authorId?: number;
  author?: string;
  reason?: string;
  opinion?: string;
  createdAt?: string;
}

export interface MeetingRecordAttachmentDto {
  fileId?: string;
  originalName?: string;
  downloadUrl?: string;
  viewUrl?: string;
  contentType?: string;
  fileSize?: number;
  ext?: string;
  isGoogleDrive?: boolean;
  sortOrder?: number;
}

export interface MeetingRecordAttachmentPathParamsDto {
  recordId: number;
  fileId: string;
}

export interface LinkMeetingRecordAttachmentRequestDto {
  fileId: string;
  sortOrder?: number;
}

export interface MeetingRecordDetailResponseDto extends MeetingRecordSummaryResponseDto {
  agenda?: string;
  discussion?: string;
  suggestion?: string;
  attachments?: MeetingRecordAttachmentDto[];
  absenceReports?: MeetingAbsenceReportResponseDto[];
}

export interface MeetingRecordListResponseDto {
  content?: MeetingRecordSummaryResponseDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface CreateMeetingRecordRequestDto {
  title: string;
  agenda: string;
}

export interface UpdateMeetingRecordRequestDto {
  title?: string;
  agenda?: string;
  discussion?: string;
  suggestion?: string;
  status?: MeetingRecordStatus;
}

export interface UpsertMeetingAbsenceReportRequestDto {
  reason: string;
  opinion?: string;
}
