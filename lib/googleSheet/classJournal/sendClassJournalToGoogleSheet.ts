import {
  isGoogleAppsScriptSuccess,
  postToGoogleAppsScript,
  requireGoogleAppsScriptUrl,
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

export async function sendClassJournalToGoogleSheet(payload: SendClassJournalToGoogleSheetPayload) {
  const url = requireGoogleAppsScriptUrl(
    process.env.NEXT_PUBLIC_APPS_SCRIPT_CLASS_JOURNAL_SHEET_URL,
    "수업 일지",
  );
  const data = await postToGoogleAppsScript(url, payload);

  if (!isGoogleAppsScriptSuccess(data)) {
    throw new Error(data.message ?? "구글 시트 저장 실패");
  }

  return data;
}
