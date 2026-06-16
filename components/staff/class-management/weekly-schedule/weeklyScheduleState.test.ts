import { describe, expect, it } from "vitest";
import type { DailyScheduleSummaryResponseDto } from "@/api/dailySchedule/dailySchedule.dto";
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
  it("marks a period as exchanged when the actual teacher changes", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 100,
        classroomId: 10,
        date: "2026-06-15",
        period: 1,
        teacherName: "이교사",
        subjectName: "국어",
        exchangeWithDate: "2026-06-17",
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, [], 10, "2026-06-15");

    expect(overrides.get(1)).toEqual({
      status: "EXCHANGED",
      teacherName: "이교사",
      subjectName: "국어",
      relatedDate: "2026-06-17",
    });
  });

  it("marks all registered periods as cancelled when the daily schedule is cancelled", () => {
    const dailySchedules: DailyScheduleSummaryResponseDto[] = [
      {
        dailyScheduleId: 1,
        lessonDate: "2026-06-15",
        classroomId: 10,
        classroomName: "장미반",
        teacherId: 20,
        teacherName: "김교사",
        activityStartTime: "19:00:00",
        activityEndTime: "21:00:00",
        status: "CANCELLED",
        lessonCount: 1,
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, [], dailySchedules, 10, "2026-06-15");

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
