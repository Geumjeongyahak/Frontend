type GoogleAppsScriptResponse = {
  ok?: boolean;
  success?: boolean;
  message?: string;
};

export function requireGoogleAppsScriptUrl(url: string | undefined, label: string) {
  const trimmed = url?.trim();
  if (!trimmed) {
    throw new Error(`${label} Apps Script URL이 설정되지 않았습니다.`);
  }
  return trimmed;
}

export async function postToGoogleAppsScript(
  url: string,
  payload: Record<string, unknown>,
): Promise<GoogleAppsScriptResponse> {
  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Apps Script 요청 실패: ${response.status}`);
  }

  try {
    return JSON.parse(text) as GoogleAppsScriptResponse;
  } catch {
    throw new Error("Apps Script 응답이 JSON이 아닙니다");
  }
}

export function isGoogleAppsScriptSuccess(data: GoogleAppsScriptResponse) {
  return Boolean(data.ok ?? data.success);
}
