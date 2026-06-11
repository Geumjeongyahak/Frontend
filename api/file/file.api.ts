import authClient from "../client/authClient";
import type {
  FileDownloadUrlResponseDto,
  FilePathParamsDto,
  FileUploadResponseDto,
  RegisterDriveFileRequestDto,
} from "./file.dto";

function createMultipartFormData(file: Blob, filename?: string) {
  const formData = new FormData();

  if (filename) {
    formData.append("file", file, filename);
  } else {
    formData.append("file", file);
  }

  return formData;
}

async function uploadImage(endpoint: string, file: Blob, filename?: string) {
  const response = await authClient.post<FileUploadResponseDto>(
    endpoint,
    createMultipartFormData(file, filename),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

// 구매 요청 품목 증빙 이미지를 업로드하는 요청
export async function uploadPurchaseItemImage(file: Blob, filename?: string) {
  return uploadImage("/api/v1/files/images/purchase-items", file, filename);
}

// 사용자 프로필 이미지를 업로드하는 요청
export async function uploadProfileImage(file: Blob, filename?: string) {
  return uploadImage("/api/v1/files/images/profile", file, filename);
}

// 게시글 본문용 이미지를 업로드하는 요청
export async function uploadPostImage(file: Blob, filename?: string) {
  return uploadImage("/api/v1/files/images/posts", file, filename);
}

// 사이트 콘텐츠 이미지를 업로드하는 요청
export async function uploadSiteContentImage(file: Blob, filename?: string) {
  return uploadImage("/api/v1/files/images/site-contents", file, filename);
}

// 기존 관리자 구매처 영수증 이미지 업로드 경로를 호출하는 요청
export async function uploadAdminVendorReceiptImage(file: Blob, filename?: string) {
  return uploadImage("/admin/request/purchase/vendors/receipt-images", file, filename);
}

// 기존 관리자 구매 요청 영수증 이미지 업로드 경로를 호출하는 요청
export async function uploadAdminPurchaseRequestReceiptImage(file: Blob, filename?: string) {
  return uploadImage("/admin/request/purchase/purchase-requests/receipt-images", file, filename);
}

// 프론트에서 Google Drive에 업로드한 파일 메타데이터를 등록하는 요청
export async function registerDriveFile(body: RegisterDriveFileRequestDto) {
  const response = await authClient.post<FileUploadResponseDto>("/api/v1/files/drive", body);
  return response.data;
}

// 일반 첨부파일을 업로드하는 요청
export async function uploadAttachment(file: Blob, filename?: string) {
  const response = await authClient.post<FileUploadResponseDto>(
    "/api/v1/files/attachments",
    createMultipartFormData(file, filename),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

// 첨부파일 다운로드 URL을 조회하는 요청
export async function getAttachmentDownloadUrl(pathParams: FilePathParamsDto) {
  const response = await authClient.get<FileDownloadUrlResponseDto>(
    `/api/v1/files/attachments/${pathParams.fileId}/download-url`,
  );

  return response.data;
}

// 첨부파일을 삭제하는 요청
export async function deleteAttachment(pathParams: FilePathParamsDto) {
  await authClient.delete(`/api/v1/files/attachments/${pathParams.fileId}`);
}
