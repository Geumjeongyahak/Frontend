import type { SendClassJournalToGoogleSheetPayload } from "@/lib/googleSheet/classJournal/sendClassJournalToGoogleSheet";
import { parseKoreanShortDateToIsoDate } from "@/utils/kstShortDate";

export function getDayLabel(dateValue: string) {
  if (!dateValue) return "";

  const isoDate = parseKoreanShortDateToIsoDate(dateValue) ?? dateValue;
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
}

export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length < 4) return numbers;
  if (numbers.length < 8) {
    return numbers.replace(/(\d{3})(\d+)/, "$1-$2");
  }

  return numbers.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
}

export function buildSendClassNotePayloadFromFormData(
  formData: FormData,
): SendClassJournalToGoogleSheetPayload {
  return buildClassJournalSheetPayloadFromFormData(formData);
}

export function buildClassJournalSheetPayloadFromFormData(
  formData: FormData,
): SendClassJournalToGoogleSheetPayload {
  const activityDate = String(formData.get("lessonDate") ?? "").trim();

  return {
    name: String(formData.get("writer") ?? "").trim(),
    birth: String(formData.get("birthPrefix") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    volunteerNote: String(formData.get("classroomName") ?? "").trim(),
    agree: formData.get("privacyConsent") === "on" ? "동의" : "미동의",
    date: activityDate,
    time: String(formData.get("activityTime") ?? "").trim(),
    day: getDayLabel(activityDate),
    period1: String(formData.get("lesson1") ?? "").trim(),
    period2: String(formData.get("lesson2") ?? "").trim(),
    period3: String(formData.get("lesson3") ?? "").trim(),
  };
}
