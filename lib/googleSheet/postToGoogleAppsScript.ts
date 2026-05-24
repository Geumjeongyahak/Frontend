type GoogleAppsScriptResponse = {
  ok?: boolean;
  success?: boolean;
  message?: string;
};

/**
 * GAS 웹앱은 application/json 시 CORS preflight(OPTIONS)에서 405가 날 수 있어
 * text/plain으로 JSON 문자열을 보낸다. doPost의 JSON.parse(e.postData.contents)는 동일하게 동작한다.
 */
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
