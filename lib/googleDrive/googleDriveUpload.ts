export type GoogleDriveUploadResponse = {
  success: boolean;
  message?: string;
  file?: {
    id: string;
    name: string;
    mimeType: string;
    viewUrl: string;
    downloadUrl: string;
  };
};

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("파일을 base64로 변환하지 못했습니다."));
        return;
      }

      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("base64 데이터가 비어 있습니다."));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
    };

    reader.readAsDataURL(file);
  });
}

export async function googleDriveUpload(
  file: File,
  uploadUrl: string | undefined,
  contextLabel = "Google Drive",
): Promise<GoogleDriveUploadResponse> {
  if (!uploadUrl) {
    throw new Error(`${contextLabel} 업로드 URL이 설정되지 않았습니다.`);
  }

  const base64 = await convertFileToBase64(file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64,
    }),
  });

  if (!response.ok) {
    throw new Error(`${contextLabel} 파일 업로드에 실패했습니다.`);
  }

  const data = (await response.json()) as GoogleDriveUploadResponse;

  if (!data.success) {
    throw new Error(data.message || `${contextLabel} 파일 업로드에 실패했습니다.`);
  }

  return data;
}
