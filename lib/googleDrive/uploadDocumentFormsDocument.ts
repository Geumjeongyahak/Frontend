import { documentFormsToGoogleDrive } from "@/lib/googleDrive/documentFormsToGoogleDrive";
import { uploadArchiveDriveDocument } from "@/lib/googleDrive/uploadArchiveDriveDocument";

export function uploadDocumentFormsDocument(file: File) {
  return uploadArchiveDriveDocument(file, documentFormsToGoogleDrive, "서류 양식");
}
