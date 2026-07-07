import { isAxiosError } from "axios";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";

const LESSON_TIME_OVERLAP_MESSAGE = "시간대가 겹치는 수업이 존재합니다";

export function formatLessonTimeForDisplay(value: string) {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

export function snapLessonTimeToFiveMinutes(value: string) {
  const normalized = formatLessonTimeForDisplay(value);
  if (!/^\d{2}:\d{2}$/.test(normalized)) return normalized;

  const [hourText, minuteText] = normalized.split(":");
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return normalized;

  let snappedMinute = Math.round(minute / 5) * 5;
  if (snappedMinute === 60) {
    hour = Math.min(hour + 1, 23);
    snappedMinute = 0;
  }

  return `${String(hour).padStart(2, "0")}:${String(snappedMinute).padStart(2, "0")}`;
}

export function normalizeLessonTimeForApi(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

export function resolveLessonCreateErrorMessage(error: unknown) {
  if (isAxiosError(error) && error.response?.status === 409) {
    return LESSON_TIME_OVERLAP_MESSAGE;
  }

  return extractApiErrorMessage(error, "수업 생성에 실패했습니다.");
}

export function formatLessonTimeRange(startTime?: string, endTime?: string) {
  const start = startTime ? startTime.slice(0, 5) : "—";
  const end = endTime ? endTime.slice(0, 5) : "—";
  return `${start} - ${end}`;
}

export function formatLessonStatusLabel(status?: string) {
  switch (status) {
    case "SCHEDULED":
      return "예정";
    case "COMPLETED":
      return "완료";
    case "CANCELED":
      return "취소";
    default:
      return status ?? "—";
  }
}

export function resolveLessonDeleteErrorMessage(error: unknown) {
  return extractApiErrorMessage(error, "수업 삭제에 실패했습니다.");
}
