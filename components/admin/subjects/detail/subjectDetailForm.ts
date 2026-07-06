import { isAxiosError } from "axios";
import type {
  SubjectDayOfWeek,
  SubjectDetailResponseDto,
  UpdateSubjectRequestDto,
  UpdateSubjectScheduleRequestDto,
} from "@/api/subject/subject.dto";
import {
  formatLessonTimeForDisplay,
  normalizeLessonTimeForApi,
} from "@/components/admin/lesson-management/lessonCreateError";
import { compareIsoDates } from "@/components/admin/subjects/shared/subjectCreateForm";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";

export type SubjectInfoFormValues = {
  name: string;
  description: string;
};

export type SubjectScheduleFormValues = {
  startAt: string;
  endAt: string;
  dayOfWeek: SubjectDayOfWeek | null;
  startTime: string;
  endTime: string;
  period: string;
};

export function mapSubjectToInfoForm(subject: SubjectDetailResponseDto): SubjectInfoFormValues {
  return {
    name: subject.name ?? "",
    description: subject.description ?? "",
  };
}

export function mapSubjectToScheduleForm(
  subject: SubjectDetailResponseDto,
): SubjectScheduleFormValues {
  return {
    startAt: subject.startAt ?? "",
    endAt: subject.endAt ?? "",
    dayOfWeek: subject.dayOfWeek ?? null,
    startTime: formatLessonTimeForDisplay(subject.startTime ?? ""),
    endTime: formatLessonTimeForDisplay(subject.endTime ?? ""),
    period: subject.period != null ? String(subject.period) : "1",
  };
}

export function validateSubjectInfoForm(values: SubjectInfoFormValues) {
  if (!values.name.trim()) return "과목명을 입력해 주세요.";
  return null;
}

function compareTimes(startTime: string, endTime: string) {
  const start = normalizeLessonTimeForApi(startTime.trim());
  const end = normalizeLessonTimeForApi(endTime.trim());
  if (!start || !end) return 0;
  return start.localeCompare(end);
}

export function validateSubjectScheduleForm(values: SubjectScheduleFormValues) {
  if (!values.startAt) return "시작일을 선택해 주세요.";
  if (!values.endAt) return "종료일을 선택해 주세요.";
  if (compareIsoDates(values.startAt, values.endAt) >= 0) {
    return "시작일은 종료일보다 앞서야 합니다.";
  }
  if (!values.dayOfWeek) return "요일을 선택해 주세요.";
  if (!values.startTime.trim()) return "시작 시간을 선택해 주세요.";
  if (!values.endTime.trim()) return "종료 시간을 선택해 주세요.";
  if (compareTimes(values.startTime, values.endTime) >= 0) {
    return "시작 시간은 종료 시간보다 앞서야 합니다.";
  }

  const parsedPeriod = Number(values.period);
  if (!Number.isInteger(parsedPeriod) || parsedPeriod < 1) {
    return "교시는 1 이상의 숫자로 입력해 주세요.";
  }

  return null;
}

export function mapSubjectInfoFormToPayload(values: SubjectInfoFormValues): UpdateSubjectRequestDto {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
  };
}

export function mapSubjectScheduleFormToPayload(
  values: SubjectScheduleFormValues,
): UpdateSubjectScheduleRequestDto {
  return {
    startAt: values.startAt,
    endAt: values.endAt,
    dayOfWeek: values.dayOfWeek as SubjectDayOfWeek,
    startTime: normalizeLessonTimeForApi(values.startTime),
    endTime: normalizeLessonTimeForApi(values.endTime),
    period: Number(values.period),
  };
}

export function resolveSubjectMutationError(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    if (error.response?.status === 409) {
      return "같은 분반에서 운영 기간·요일·교시가 겹치는 다른 과목이 있습니다.";
    }
  }
  return extractApiErrorMessage(error, fallback);
}
