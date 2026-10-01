import { describe, expect, it } from "vitest";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  formatCellSaveError,
  getPeriodSaveSteps,
  resolveCommonFields,
} from "./lessonScheduleCellSave";

const ORIGINAL: SubjectDetailResponseDto = {
  id: 59,
  name: "국어",
  teacherId: 7,
  startAt: "2026-10-01",
  endAt: "2026-10-31",
  startTime: "19:00:00",
  endTime: "19:40:00",
};

const UNCHANGED = {
  name: "국어",
  teacherId: 7,
  startAt: "2026-10-01",
  endAt: "2026-10-31",
  startTime: "19:00",
  endTime: "19:40",
};

describe("getPeriodSaveSteps", () => {
  it("creates a subject only when a new period has a name", () => {
    expect(getPeriodSaveSteps(undefined, UNCHANGED)).toEqual(["create"]);
    expect(getPeriodSaveSteps(undefined, { ...UNCHANGED, name: " " })).toEqual([]);
  });

  it("skips every call when nothing changed", () => {
    expect(getPeriodSaveSteps(ORIGINAL, UNCHANGED)).toEqual([]);
  });

  it("calls only the steps whose fields changed", () => {
    expect(getPeriodSaveSteps(ORIGINAL, { ...UNCHANGED, name: "수학" })).toEqual(["name"]);
    expect(getPeriodSaveSteps(ORIGINAL, { ...UNCHANGED, endTime: "19:45" })).toEqual(["schedule"]);
    expect(getPeriodSaveSteps(ORIGINAL, { ...UNCHANGED, teacherId: null })).toEqual(["teacher"]);
  });
});

describe("formatCellSaveError", () => {
  it("names the saved periods and the failed one", () => {
    expect(formatCellSaveError([1], 2, "교사 수업 시간이 겹칩니다.")).toBe(
      "1교시는 저장됐고 2교시에서 멈췄습니다. 교사 수업 시간이 겹칩니다.",
    );
    expect(formatCellSaveError([], 1, "실패")).toBe("1교시에서 멈췄습니다. 실패");
  });
});

describe("resolveCommonFields", () => {
  const initial = { startAt: "2026-10-01", endAt: "2026-10-31", teacherId: 7 };
  const secondPeriod = { startAt: "2026-10-15", endAt: "2026-11-30", teacherId: 8 };

  it("keeps each period's own period and teacher when the shared fields were not edited", () => {
    expect(resolveCommonFields(secondPeriod, initial, initial)).toEqual(secondPeriod);
    expect(
      getPeriodSaveSteps(
        { ...ORIGINAL, ...secondPeriod },
        { ...UNCHANGED, ...resolveCommonFields(secondPeriod, initial, initial) },
      ),
    ).toEqual([]);
  });

  it("applies only the shared field the user edited", () => {
    const form = { ...initial, endAt: "2026-11-15" };
    expect(resolveCommonFields(secondPeriod, form, initial)).toEqual({
      startAt: "2026-10-01",
      endAt: "2026-11-15",
      teacherId: 8,
    });
  });

  it("uses the form values for a new period", () => {
    expect(resolveCommonFields(undefined, initial, initial)).toEqual(initial);
  });
});
