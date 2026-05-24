import type { ClassAttendanceSheetPayload } from "@/lib/googleSheet/classAttendance/classAttendanceSheetPayload";
import {
  isGoogleAppsScriptSuccess,
  postToGoogleAppsScript,
} from "@/lib/googleSheet/postToGoogleAppsScript";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxZ9VY6A9rXkNInZnXt_cSO6SVgkd196DV7_mfqeXJViUmFSVgSRfvM9tX9oOy63P-n7Q/exec";

export async function sendClassAttendanceToGoogleSheet(payload: ClassAttendanceSheetPayload) {
  const data = await postToGoogleAppsScript(GOOGLE_APPS_SCRIPT_URL, payload);

  if (!isGoogleAppsScriptSuccess(data)) {
    throw new Error(data.message ?? "출석 시트 저장 실패");
  }

  return data;
}
