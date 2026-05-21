import { googleDriveUpload, type GoogleDriveUploadResponse } from "./googleDriveUpload";

export type { GoogleDriveUploadResponse };

export function documentFormsToGoogleDrive(file: File): Promise<GoogleDriveUploadResponse> {
  return googleDriveUpload(
    file,
    process.env.NEXT_PUBLIC_APPS_SCRIPT_DOCUMENT_FORMS_UPLOAD_URL,
    "서류 양식",
  );
}
