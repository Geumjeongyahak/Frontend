import { boardFileToGoogleDrive } from "@/lib/googleDrive/boardFileToGoogleDrive";
import { uploadArchiveDriveDocument } from "@/lib/googleDrive/uploadArchiveDriveDocument";

export function uploadBoardDocument(file: File) {
  return uploadArchiveDriveDocument(file, boardFileToGoogleDrive, "게시판 자료");
}
