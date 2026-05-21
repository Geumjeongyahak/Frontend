import { googleDriveUpload, type GoogleDriveUploadResponse } from "./googleDriveUpload";

export type { GoogleDriveUploadResponse };

export function examMaterialsToGoogleDrive(file: File): Promise<GoogleDriveUploadResponse> {
  return googleDriveUpload(
    file,
    process.env.NEXT_PUBLIC_APPS_SCRIPT_EXAM_MATERIALS_UPLOAD_URL,
    "시험 문제 자료",
  );
}
