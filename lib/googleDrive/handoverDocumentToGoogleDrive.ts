import { googleDriveUpload, type GoogleDriveUploadResponse } from "./googleDriveUpload";

export type { GoogleDriveUploadResponse };

export function handoverDocumentToGoogleDrive(file: File): Promise<GoogleDriveUploadResponse> {
  return googleDriveUpload(
    file,
    process.env.NEXT_PUBLIC_APPS_SCRIPT_HANDOVER_DOCUMENT_UPLOAD_URL,
    "인수인계서",
  );
}
