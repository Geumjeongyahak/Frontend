import dayjs from "dayjs";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

export function getLessonMonthRange(year: number, month: number) {
  const start = dayjs().year(year).month(month - 1).startOf("month");
  const end = start.endOf("month");

  return {
    from: start.format("YYYY-MM-DD"),
    to: end.format("YYYY-MM-DD"),
  };
}

export function parseLessonMonthFilter(searchParams: SearchParamsLike) {
  const now = dayjs();
  const yearParam = Number(searchParams.get("year"));
  const monthParam = Number(searchParams.get("month"));

  const year =
    Number.isInteger(yearParam) && yearParam >= 2000 && yearParam <= 2100
      ? yearParam
      : now.year();
  const month =
    Number.isInteger(monthParam) && monthParam >= 1 && monthParam <= 12
      ? monthParam
      : now.month() + 1;

  return { year, month };
}

export function getLessonYearOptions() {
  const currentYear = dayjs().year();
  const years: number[] = [];

  for (let year = currentYear - 2; year <= currentYear + 1; year += 1) {
    years.push(year);
  }

  return years;
}

export const LESSON_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
