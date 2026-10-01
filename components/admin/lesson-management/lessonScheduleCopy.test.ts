import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  extractCopyFailures,
  formatCopyFailure,
  getCopySourceSubjectIds,
  getNextMonthRange,
} from "./lessonScheduleCopy";

describe("getNextMonthRange", () => {
  it("returns the first and last day of the following month", () => {
    expect(getNextMonthRange("2026-10-01")).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(getNextMonthRange("2026-12-01")).toEqual({ from: "2027-01-01", to: "2027-01-31" });
  });
});

describe("getCopySourceSubjectIds", () => {
  const cells = [
    { classroomId: 1, dayOfWeek: "MONDAY" as const },
    { classroomId: 8, dayOfWeek: "SATURDAY" as const },
  ];
  const range = { from: "2026-10-01", to: "2026-10-31" };

  it("copies only the subject shown in each displayed cell and period", () => {
    const subjects: SubjectDetailResponseDto[] = [
      {
        id: 1,
        classroomId: 1,
        dayOfWeek: "MONDAY",
        period: 1,
        startAt: "2026-06-29",
        endAt: "2026-09-30",
      },
      {
        id: 2,
        classroomId: 1,
        dayOfWeek: "MONDAY",
        period: 1,
        startAt: "2026-10-01",
        endAt: "2026-10-15",
      },
      {
        id: 3,
        classroomId: 1,
        dayOfWeek: "MONDAY",
        period: 1,
        startAt: "2026-10-16",
        endAt: "2026-10-31",
      },
      {
        id: 4,
        classroomId: 1,
        dayOfWeek: "MONDAY",
        period: 2,
        startAt: "2026-10-01",
        endAt: "2026-10-31",
      },
      {
        id: 5,
        classroomId: 8,
        dayOfWeek: "SATURDAY",
        period: 1,
        startAt: "2026-10-01",
        endAt: "2026-10-31",
      },
      {
        id: 6,
        classroomId: 8,
        dayOfWeek: "SUNDAY",
        period: 1,
        startAt: "2026-10-01",
        endAt: "2026-10-31",
      },
      {
        id: 7,
        classroomId: 99,
        dayOfWeek: "MONDAY",
        period: 1,
        startAt: "2026-10-01",
        endAt: "2026-10-31",
      },
    ];
    expect(getCopySourceSubjectIds(subjects, range, cells)).toEqual([3, 4, 5]);
  });
});

describe("copy failures", () => {
  const failure = {
    sourceSubjectId: 57,
    classroomName: "씨앗반",
    dayOfWeek: "SATURDAY" as const,
    period: 1,
    subjectName: "영어",
    reason: "같은 분반에 실제 수업 날짜와 시간이 겹치는 과목이 존재합니다.",
  };

  it("reads failures from a 409 response", () => {
    const config = { headers: new AxiosHeaders() };
    const error = new AxiosError("Conflict", "ERR_BAD_REQUEST", config, null, {
      status: 409,
      statusText: "",
      headers: {},
      config,
      data: { code: "BIZ-05-003", failures: [failure] },
    });
    expect(extractCopyFailures(error)).toEqual([failure]);
    expect(extractCopyFailures(new Error("x"))).toEqual([]);
  });

  it("formats a failure as a readable line", () => {
    expect(formatCopyFailure(failure)).toBe(
      "씨앗반 토요일 1교시 영어 — 같은 분반에 실제 수업 날짜와 시간이 겹치는 과목이 존재합니다.",
    );
  });
});
