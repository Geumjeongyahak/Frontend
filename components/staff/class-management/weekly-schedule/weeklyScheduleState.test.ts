import { describe, expect, it } from "vitest";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { buildScheduleOverrides, getWeekRange } from "./weeklyScheduleState";

const BASE_SUBJECTS: SubjectDetailResponseDto[] = [
  {
    id: 1,
    classroomId: 10,
    dayOfWeek: "MONDAY",
    period: 1,
    name: "국어",
    teacherName: "김교사",
  },
];

describe("weeklyScheduleState", () => {
  it("marks a period as exchanged when the lesson response says it was exchanged", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 100,
        classroomId: 10,
        date: "2026-06-15",
        period: 1,
        teacherName: "이교사",
        subjectName: "국어",
        isExchanged: true,
        exchangedLessonDate: "2026-06-17",
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, "2026-06-15");

    expect(overrides.get(1)).toEqual({
      status: "EXCHANGED",
      teacherName: "이교사",
      subjectName: "국어",
      relatedDate: "2026-06-17",
    });
  });

  it("marks a period as cancelled when the lesson response says it is absent", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 200,
        date: "2026-06-15",
        classroomId: 10,
        period: 1,
        teacherName: "김교사",
        subjectName: "국어",
        isAbsent: true,
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, "2026-06-15");

    expect(overrides.get(1)).toMatchObject({
      status: "CANCELLED",
      teacherName: "김교사",
    });
  });

  it("returns the iso week range for the given anchor date", () => {
    expect(getWeekRange(new Date("2026-06-18T09:00:00+09:00"))).toEqual({
      from: "2026-06-15",
      to: "2026-06-21",
    });
  });
});
