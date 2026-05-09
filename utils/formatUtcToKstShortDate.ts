const EMPTY_DATE = "00.00.00";

export function formatUtcToKstShortDate(value?: string) {
  if (!value) return EMPTY_DATE;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return EMPTY_DATE;

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(parsedDate);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return EMPTY_DATE;
  return `${year}.${month}.${day}`;
}

/** 상세·목록 등: KST 기준 짧은 날짜 + 시각 (예: 26.06.07 22:00) */
export function formatUtcToKstShortDateTime(value?: string): string {
  if (!value) return "";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateParts = dateFormatter.formatToParts(parsedDate);
  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;
  const timeParts = timeFormatter.formatToParts(parsedDate);
  const hour = timeParts.find((part) => part.type === "hour")?.value;
  const minute = timeParts.find((part) => part.type === "minute")?.value;

  if (!year || !month || !day || hour === undefined || minute === undefined) return "";
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

/** 수정 폼 datetime-local 값: API/ISO 시각을 KST 달력·시각으로 맞춘다. */
export function formatUtcToKstDatetimeLocalInput(value?: string): string {
  if (!value) return "";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(parsedDate);
  const y = parts.find((p) => p.type === "year")?.value;
  const mo = parts.find((p) => p.type === "month")?.value;
  const da = parts.find((p) => p.type === "day")?.value;
  const h = parts.find((p) => p.type === "hour")?.value;
  const mi = parts.find((p) => p.type === "minute")?.value;

  if (!y || !mo || !da || !h || !mi) return "";
  return `${y}-${mo}-${da}T${h}:${mi}`;
}
