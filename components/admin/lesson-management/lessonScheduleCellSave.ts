import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";

export type PeriodSaveStep = "create" | "name" | "schedule" | "teacher";

type PeriodSaveInput = {
  name: string;
  teacherId: number | null;
  startAt: string;
  endAt: string;
  startTime: string;
  endTime: string;
};

const toMinutePrecision = (time?: string) => (time ?? "").slice(0, 5);

// 교시마다 바뀐 항목만 호출해 불필요한 요청(특히 교사 재배정 검증)과 부분 반영을 줄인다
export function getPeriodSaveSteps(
  original: SubjectDetailResponseDto | undefined,
  next: PeriodSaveInput,
): PeriodSaveStep[] {
  const name = next.name.trim();
  if (!original) return name ? ["create"] : [];

  const steps: PeriodSaveStep[] = [];
  if (name !== (original.name ?? "")) steps.push("name");
  if (
    next.startAt !== original.startAt ||
    next.endAt !== original.endAt ||
    next.startTime !== toMinutePrecision(original.startTime) ||
    next.endTime !== toMinutePrecision(original.endTime)
  ) {
    steps.push("schedule");
  }
  if (next.teacherId !== (original.teacherId ?? null)) steps.push("teacher");
  return steps;
}

export function formatCellSaveError(savedPeriods: number[], failedPeriod: number, reason: string) {
  const saved = savedPeriods.length > 0 ? `${savedPeriods.join(", ")}교시는 저장됐고 ` : "";
  return `${saved}${failedPeriod}교시에서 멈췄습니다. ${reason}`;
}
