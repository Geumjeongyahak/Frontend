import { isAxiosError } from "axios";

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
  let minute = Number(minuteText);

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

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "수업 생성에 실패했습니다.";
}
