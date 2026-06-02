import { registerDriveFile } from "@/api/file/file.api";
import type { FileUploadResponseDto } from "@/api/file/file.dto";
import { handoverDocumentToGoogleDrive } from "@/lib/googleDrive/handoverDocumentToGoogleDrive";

export async function uploadHandoverDocument(file: File): Promise<FileUploadResponseDto> {
  const driveResponse = await handoverDocumentToGoogleDrive(file);
  const driveFile = driveResponse.file;

  if (!driveFile?.downloadUrl) {
    throw new Error("인수인계서 Drive 업로드 응답에 downloadUrl이 없습니다.");
  }

  const registered = await registerDriveFile({
    driveUrl: driveFile.downloadUrl,
    originalName: file.name,
    mimeType: driveFile.mimeType || file.type || undefined,
    fileSize: file.size > 0 ? file.size : undefined,
  });

  if (!registered.fileId) {
    throw new Error("인수인계서 파일 메타데이터 등록에 실패했습니다.");
  }

  return registered;
}
