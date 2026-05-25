import type { ClassAttendanceSheetPayload } from "@/lib/googleSheet/classAttendance/classAttendanceSheetPayload";
import {
  isGoogleAppsScriptSuccess,
  postToGoogleAppsScript,
  requireGoogleAppsScriptUrl,
} from "@/lib/googleSheet/postToGoogleAppsScript";

export async function sendClassAttendanceToGoogleSheet(payload: ClassAttendanceSheetPayload) {
  const url = requireGoogleAppsScriptUrl(
    process.env.NEXT_PUBLIC_APPS_SCRIPT_CLASS_ATTENDANCE_SHEET_URL,
    "출석",
  );
  const data = await postToGoogleAppsScript(url, payload);

  if (!isGoogleAppsScriptSuccess(data)) {
    throw new Error(data.message ?? "출석 시트 저장 실패");
  }

  return data;
}
