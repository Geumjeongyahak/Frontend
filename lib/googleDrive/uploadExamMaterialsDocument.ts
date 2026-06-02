import { examMaterialsToGoogleDrive } from "@/lib/googleDrive/examMaterialsToGoogleDrive";
import { uploadArchiveDriveDocument } from "@/lib/googleDrive/uploadArchiveDriveDocument";

export function uploadExamMaterialsDocument(file: File) {
  return uploadArchiveDriveDocument(file, examMaterialsToGoogleDrive, "시험 문제 자료");
}
