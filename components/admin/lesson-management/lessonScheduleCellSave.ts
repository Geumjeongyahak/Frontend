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

type CommonFields = { startAt: string; endAt: string; teacherId: number | null };

// 모달의 기간·교사는 칸 전체에 하나로 보이지만 교시마다 다를 수 있다.
// 사용자가 바꾼 필드만 모든 교시에 적용하고, 손대지 않은 필드는 교시의 원래 값을 유지한다.
export function resolveCommonFields(
  original: { startAt?: string; endAt?: string; teacherId?: number | null } | undefined,
  form: CommonFields,
  initial: CommonFields,
): CommonFields {
  if (!original) return form;
  const datesEdited = form.startAt !== initial.startAt || form.endAt !== initial.endAt;
  return {
    startAt: datesEdited ? form.startAt : (original.startAt ?? form.startAt),
    endAt: datesEdited ? form.endAt : (original.endAt ?? form.endAt),
    teacherId: form.teacherId !== initial.teacherId ? form.teacherId : (original.teacherId ?? null),
  };
}

export function formatCellSaveError(savedPeriods: number[], failedPeriod: number, reason: string) {
  const saved = savedPeriods.length > 0 ? `${savedPeriods.join(", ")}교시는 저장됐고 ` : "";
  return `${saved}${failedPeriod}교시에서 멈췄습니다. ${reason}`;
}
