import { registerDriveFile } from "@/api/file/file.api";
import type {
  AppsScriptFileUploadRequestDto,
  AppsScriptFileUploadResponseDto,
  RegisterAppsScriptFileParams,
  RegisteredAppsScriptFileDto,
  UploadedAppsScriptFileDto,
} from "@/lib/googleDrive/appsScriptFile.dto";
import { fileToBase64 } from "@/lib/googleDrive/fileBase64";
import { UPLOAD_TARGETS } from "@/lib/googleDrive/uploadTargets";
import type { UploadTargetConfig } from "@/lib/googleDrive/uploadTargets";

function getAppsScriptUrl() {
  const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_FILE_API_URL?.trim();

  if (!appsScriptUrl) {
    throw new Error("Apps Script 파일 API URL이 설정되지 않았습니다.");
  }

  return appsScriptUrl;
}

function resolveUploadTarget(target: RegisterAppsScriptFileParams["target"]): UploadTargetConfig {
  return typeof target === "string" ? UPLOAD_TARGETS[target] : target;
}

function validateUploadedFile(data: AppsScriptFileUploadResponseDto): UploadedAppsScriptFileDto {
  if (
    !data.success ||
    !data.driveFileId ||
    !data.fileName ||
    !data.mimeType ||
    typeof data.size !== "number" ||
    !data.downloadUrl ||
    !data.folderId ||
    !data.folderName ||
    !data.targetType
  ) {
    throw new Error(data.message ?? "Apps Script 파일 업로드에 실패했습니다.");
  }

  return {
    driveFileId: data.driveFileId,
    fileName: data.fileName,
    mimeType: data.mimeType,
    size: data.size,
    viewUrl: data.viewUrl,
    downloadUrl: data.downloadUrl,
    folderId: data.folderId,
    folderName: data.folderName,
    targetType: data.targetType,
    targetName: data.targetName,
  };
}

export async function uploadAppsScriptFile({
  file,
  target,
}: RegisterAppsScriptFileParams): Promise<UploadedAppsScriptFileDto> {
  const appsScriptUrl = getAppsScriptUrl();
  const resolvedTarget = resolveUploadTarget(target);
  const base64Data = await fileToBase64(file);

  const body: AppsScriptFileUploadRequestDto = {
    action: "uploadFile",
    targetType: resolvedTarget.targetType,
    ...(resolvedTarget.targetName ? { targetName: resolvedTarget.targetName } : {}),
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    base64Data,
  };

  const response = await fetch(appsScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Apps Script 파일 업로드 요청에 실패했습니다. (${response.status})`);
  }

  const data = (await response.json()) as AppsScriptFileUploadResponseDto;
  return validateUploadedFile(data);
}

export async function registerAppsScriptFile(
  uploaded: UploadedAppsScriptFileDto,
): Promise<RegisteredAppsScriptFileDto> {
  const registered = await registerDriveFile({
    driveUrl: uploaded.viewUrl || uploaded.downloadUrl,
    originalName: uploaded.fileName,
    mimeType: uploaded.mimeType,
    fileSize: uploaded.size,
  });

  if (!registered.fileId) {
    throw new Error("백엔드 파일 메타데이터 등록에 실패했습니다.");
  }

  return {
    fileId: registered.fileId,
    originalName: registered.originalName ?? uploaded.fileName,
    downloadUrl: uploaded.downloadUrl,
    viewUrl: uploaded.viewUrl,
  };
}

export async function registerAppsScriptFileWithMetadata(params: RegisterAppsScriptFileParams) {
  const uploaded = await uploadAppsScriptFile(params);
  const registered = await registerAppsScriptFile(uploaded);

  return {
    ...registered,
    driveFileId: uploaded.driveFileId,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    folderId: uploaded.folderId,
    folderName: uploaded.folderName,
    targetType: uploaded.targetType,
    targetName: uploaded.targetName,
  };
}
