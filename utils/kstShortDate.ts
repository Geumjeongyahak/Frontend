import { formatUtcToKstShortDate } from "./formatUtcToKstShortDate";

export function getKstTodayShortDate(): string {
  return formatUtcToKstShortDate(new Date().toISOString());
}

export function parseKoreanShortDateToIsoDate(text: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const yy = Number(m[1]);
  const [, , mm, dd] = m;
  const fullYear = 2000 + yy;
  return `${fullYear}-${mm}-${dd}`;
}

export function koreanShortDateToLocalDateTime(
  text: string,
  time: string = "22:00:00",
): string | null {
  const datePart = parseKoreanShortDateToIsoDate(text);
  if (!datePart) return null;
  return `${datePart}T${time}`;
}

/** 교환 신청 만료 시각을 API 문자열(YMDTHMS, 타임존 접미 없음)로 맞춘다. */
export function normalizeLessonExchangeExpiresAtForApi(value: string): string | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const withMinutes = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(t);
  if (withMinutes) return `${withMinutes[1]}T${withMinutes[2]}:${withMinutes[3]}:00`;
  const withSeconds = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/.exec(t);
  if (withSeconds) return withSeconds[1];
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}T22:00:00`;
  return undefined;
}
