import {
  isGoogleAppsScriptSuccess,
  postToGoogleAppsScript,
} from "@/lib/googleSheet/postToGoogleAppsScript";

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
  const data = await postToGoogleAppsScript(GOOGLE_APPS_SCRIPT_URL, payload);

  if (!isGoogleAppsScriptSuccess(data)) {
    throw new Error(data.message ?? "구글 시트 저장 실패");
  }

  return data;
}
