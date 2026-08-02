import { formatUtcToKstShortDate } from "./formatUtcToKstShortDate";

export function getKstTodayShortDate(): string {
  return formatUtcToKstShortDate(new Date().toISOString());
}

export function getKstTodayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseKoreanShortDateToIsoDate(text: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const yy = Number(m[1]);
  const [, , mm, dd] = m;
  const fullYear = 2000 + yy;
  return `${fullYear}-${mm}-${dd}`;
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * 교환 신청 만료일은 수업일 이전일 때만 전송한다.
 * 미선택 또는 수업일 당일은 서버가 수업 시작 시각으로 만료 처리한다.
 */
export function getLessonExchangeExpiresDateForApi(
  expiresDate: string,
  lessonDate: string,
): string | undefined {
  const normalizedExpiresDate = expiresDate.trim();
  if (!normalizedExpiresDate) return undefined;

  if (!isValidIsoDate(normalizedExpiresDate) || !isValidIsoDate(lessonDate)) return undefined;
  if (normalizedExpiresDate >= lessonDate) return undefined;

  return normalizedExpiresDate;
}
