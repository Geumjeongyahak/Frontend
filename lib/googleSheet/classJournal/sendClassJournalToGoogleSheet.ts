export type SendClassJournalToGoogleSheetPayload = {
  name: string;
  birth: string;
  phone: string;
  volunteerNote: string;
  agree: string;
  date: string;
  time: string;
  day: string;
  period1: string;
  period2: string;
  period3: string;
};

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxAQTwUuRT6X7Hysjhxnx1rp_Env0P-0xPIVuoUXjJtP-EZruBJOEEqDxXbRVpJkxpxFg/exec";

export async function sendClassJournalToGoogleSheet(payload: SendClassJournalToGoogleSheetPayload) {
  const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`);
  }

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("응답이 JSON이 아닙니다");
  }

  if (!data.success) {
    throw new Error(data.message ?? "구글 시트 저장 실패");
  }

  return data;
}
