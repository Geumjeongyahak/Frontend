import type { AppsScriptFileTarget, UploadTargetConfig } from "@/lib/googleDrive/uploadTargets";

export type AppsScriptFileUploadRequestDto = {
  action: "uploadFile";
  fileName: string;
  mimeType: string;
  size: number;
  base64Data: string;
  targetType: string;
  targetName?: string;
};

export type UploadedAppsScriptFileDto = {
  driveFileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  viewUrl?: string;
  downloadUrl: string;
  folderId: string;
  folderName: string;
  targetType: string;
  targetName?: string;
};

export type AppsScriptFileUploadResponseDto = {
  success: boolean;
  message?: string;
  driveFileId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  viewUrl?: string;
  downloadUrl?: string;
  folderId?: string;
  folderName?: string;
  targetType?: string;
  targetName?: string;
};

export type RegisteredAppsScriptFileDto = {
  fileId: string;
  originalName: string;
  downloadUrl: string;
  viewUrl?: string;
};

export type RegisterAppsScriptFileParams = {
  file: File;
  target: AppsScriptFileTarget | UploadTargetConfig;
};
