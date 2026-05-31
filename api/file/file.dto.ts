export interface FileUploadResponseDto {
  fileId?: string;
  originalName?: string;
  contentType?: string;
  fileSize?: number;
  ext?: string;
  url?: string;
}

export interface FileDownloadUrlResponseDto {
  downloadUrl?: string;
}

export interface FilePathParamsDto {
  fileId: string;
}

export interface RegisterDriveFileRequestDto {
  driveUrl: string;
  originalName: string;
  mimeType?: string;
  fileSize?: number;
}
