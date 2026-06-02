import { handoverDocumentToGoogleDrive } from "@/lib/googleDrive/handoverDocumentToGoogleDrive";
import { uploadArchiveDriveDocument } from "@/lib/googleDrive/uploadArchiveDriveDocument";

export function uploadHandoverDocument(file: File) {
  return uploadArchiveDriveDocument(file, handoverDocumentToGoogleDrive, "인수인계서");
}
