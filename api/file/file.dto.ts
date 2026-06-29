export interface FileUploadResponseDto {
  fileId?: string;
  originalName?: string;
  contentType?: string;
  fileSize?: number;
  ext?: string;
  isGoogleDrive?: boolean;
  url?: string;
}

export interface FileDownloadUrlResponseDto {
  downloadUrl?: string;
}

export interface FilePathParamsDto {
  fileId: string;
}

export type DriveUploadTarget =
  | "handover"
  | "examMaterials"
  | "documentForms"
  | "meetingRecords"
  | "board";

export interface DriveFileUploadPathParamsDto {
  target: DriveUploadTarget;
}

export interface DriveFileUploadQueryParamsDto {
  scopeType?: string;
  scopeId?: number;
}

export interface RegisterDriveFileRequestDto {
  driveUrl: string;
  originalName: string;
  mimeType?: string;
  fileSize?: number;
}
