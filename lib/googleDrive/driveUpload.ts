import { DRIVE_UPLOAD_TARGETS, type DriveUploadTarget } from "@/lib/googleDrive/driveUploadTargets";
import { googleDriveUpload, type GoogleDriveUploadResponse } from "@/lib/googleDrive/googleDriveUpload";

export type { GoogleDriveUploadResponse };

export function uploadToDrive(
  target: DriveUploadTarget,
  file: File,
): Promise<GoogleDriveUploadResponse> {
  const { label, resolveUploadUrl } = DRIVE_UPLOAD_TARGETS[target];
  return googleDriveUpload(file, resolveUploadUrl(), label);
}

export const handoverDocumentToGoogleDrive = (file: File) => uploadToDrive("handover", file);
export const examMaterialsToGoogleDrive = (file: File) => uploadToDrive("examMaterials", file);
export const documentFormsToGoogleDrive = (file: File) => uploadToDrive("documentForms", file);
export const boardFileToGoogleDrive = (file: File) => uploadToDrive("board", file);
export const financeReceiptToGoogleDrive = (file: File) => uploadToDrive("financeReceipt", file);
