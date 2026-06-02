import { registerDriveFile } from "@/api/file/file.api";
import type { FileUploadResponseDto } from "@/api/file/file.dto";
import type { GoogleDriveUploadResponse } from "@/lib/googleDrive/googleDriveUpload";

export async function uploadArchiveDriveDocument(
  file: File,
  uploadToDrive: (file: File) => Promise<GoogleDriveUploadResponse>,
  label: string,
): Promise<FileUploadResponseDto> {
  const driveResponse = await uploadToDrive(file);
  const driveFile = driveResponse.file;

  if (!driveFile?.downloadUrl) {
    throw new Error(`${label} Drive 업로드 응답에 downloadUrl이 없습니다.`);
  }

  const registered = await registerDriveFile({
    driveUrl: driveFile.downloadUrl,
    originalName: file.name,
    mimeType: driveFile.mimeType || file.type || undefined,
    fileSize: file.size > 0 ? file.size : undefined,
  });

  if (!registered.fileId) {
    throw new Error(`${label} 파일 메타데이터 등록에 실패했습니다.`);
  }

  return registered;
}
