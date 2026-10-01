import { isAxiosError } from "axios";
import dayjs from "dayjs";
import type {
  CopySubjectFailureDto,
  SubjectDayOfWeek,
  SubjectDetailResponseDto,
} from "@/api/subject/subject.dto";

const DAY_LABELS: Record<SubjectDayOfWeek, string> = {
  MONDAY: "월요일",
  TUESDAY: "화요일",
  WEDNESDAY: "수요일",
  THURSDAY: "목요일",
  FRIDAY: "금요일",
  SATURDAY: "토요일",
  SUNDAY: "일요일",
};

export function getNextMonthRange(monthFrom: string) {
  const next = dayjs(monthFrom).add(1, "month").startOf("month");
  return { from: next.format("YYYY-MM-DD"), to: next.endOf("month").format("YYYY-MM-DD") };
}

// 선택한 달과 기간이 겹치는 과목. 시간표 칸에 보이는 기준과 같다.
export function getCopySourceSubjectIds(
  subjects: SubjectDetailResponseDto[],
  range: { from: string; to: string },
) {
  const ids = subjects
    .filter(
      (subject) => (subject.startAt ?? "") <= range.to && (subject.endAt ?? "9999") >= range.from,
    )
    .map((subject) => subject.id)
    .filter((id): id is number => typeof id === "number");
  return [...new Set(ids)];
}

export function extractCopyFailures(error: unknown): CopySubjectFailureDto[] {
  if (!isAxiosError(error) || error.response?.status !== 409) return [];
  const failures = (error.response.data as { failures?: unknown })?.failures;
  return Array.isArray(failures) ? (failures as CopySubjectFailureDto[]) : [];
}

export function formatCopyFailure(failure: CopySubjectFailureDto) {
  const where = [
    failure.classroomName,
    failure.dayOfWeek ? DAY_LABELS[failure.dayOfWeek] : undefined,
    failure.period ? `${failure.period}교시` : undefined,
    failure.subjectName,
  ]
    .filter(Boolean)
    .join(" ");
  return `${where} — ${failure.reason}`;
}
