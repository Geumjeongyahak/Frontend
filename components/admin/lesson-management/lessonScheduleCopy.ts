import { isAxiosError } from "axios";
import dayjs from "dayjs";
import { getSubjectsForCell } from "../../staff/class-management/weekly-schedule/weeklyScheduleState";
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

export const COPY_SUBJECT_LIMIT = 200;

// 화면에 보이는 칸(분반×요일)마다 교시별로 칸에 표시된 과목 하나만 고른다.
// 달 중간에 교체된 교시는 늦게 시작한 과목이 표시되므로 그 과목만 복사해 새 기간에서 서로 겹치지 않게 한다.
export function getCopySourceSubjectIds(
  subjects: SubjectDetailResponseDto[],
  range: { from: string; to: string },
  cells: { classroomId: number | null; dayOfWeek: SubjectDayOfWeek }[],
) {
  const ids: number[] = [];
  for (const cell of cells) {
    const seenPeriods = new Set<number | undefined>();
    for (const subject of getSubjectsForCell(
      subjects,
      cell.classroomId,
      cell.dayOfWeek,
      range.from,
      range.to,
    )) {
      if (seenPeriods.has(subject.period)) continue;
      seenPeriods.add(subject.period);
      if (typeof subject.id === "number") ids.push(subject.id);
    }
  }
  return ids;
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
