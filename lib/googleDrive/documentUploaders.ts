import type { FileUploadResponseDto } from "@/api/file/file.dto";
import { uploadToDrive } from "@/lib/googleDrive/driveUpload";
import type { DriveUploadTarget } from "@/lib/googleDrive/driveUploadTargets";
import { DRIVE_UPLOAD_TARGETS } from "@/lib/googleDrive/driveUploadTargets";
import { registerDriveDocument } from "@/lib/googleDrive/registerDriveDocument";

function createDocumentUploader(target: DriveUploadTarget): (file: File) => Promise<FileUploadResponseDto> {
  const { label } = DRIVE_UPLOAD_TARGETS[target];

  return (file) => registerDriveDocument(file, (f) => uploadToDrive(target, f), label);
}

export const uploadHandoverDocument = createDocumentUploader("handover");
export const uploadExamMaterialsDocument = createDocumentUploader("examMaterials");
export const uploadDocumentFormsDocument = createDocumentUploader("documentForms");
export const uploadBoardDocument = createDocumentUploader("board");
