import { googleDriveUpload, type GoogleDriveUploadResponse } from "./googleDriveUpload";

export type { GoogleDriveUploadResponse };

export function boardFileToGoogleDrive(file: File): Promise<GoogleDriveUploadResponse> {
  return googleDriveUpload(
    file,
    process.env.NEXT_PUBLIC_APPS_SCRIPT_BOARD_FILE_UPLOAD_URL,
    "게시판 자료",
  );
}
