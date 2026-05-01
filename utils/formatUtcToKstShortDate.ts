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
