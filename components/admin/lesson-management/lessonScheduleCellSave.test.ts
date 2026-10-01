import { describe, expect, it } from "vitest";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { formatCellSaveError, getPeriodSaveSteps } from "./lessonScheduleCellSave";

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
