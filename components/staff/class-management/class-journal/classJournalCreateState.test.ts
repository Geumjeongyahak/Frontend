import { describe, expect, it } from "vitest";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import {
  buildTodayLessonOptions,
  buildTodayLessonOptionsFromSubjects,
  formatLessonRange,
} from "./classJournalCreateState";

describe("classJournalCreateState", () => {
  it("builds grouped today lesson options by classroom", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 1,
        date: "2026-06-16",
        period: 2,
        startTime: "20:00:00",
        endTime: "21:00:00",
        subjectName: "생활 문해",
        classroomId: 3,
        classroomName: "장미반",
      },
      {
        lessonId: 2,
        date: "2026-06-16",
        period: 1,
        startTime: "19:00:00",
        endTime: "20:00:00",
        subjectName: "한글 기초",
        classroomId: 3,
        classroomName: "장미반",
      },
    ];

    expect(buildTodayLessonOptions(lessons)).toEqual([
      {
        classroomId: 3,
        classroomName: "장미반",
        subjectName: "생활 문해",
        activityTime: "19:00 - 21:00",
        lessonDate: "2026-06-16",
        source: "lesson",
      },
    ]);
  });

  it("skips cancelled lessons when building today lesson options", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 1,
        date: "2026-06-16",
        period: 1,
        startTime: "19:00:00",
        endTime: "20:00:00",
        subjectName: "한글 기초",
        classroomId: 3,
        classroomName: "장미반",
        status: "CANCELED",
      },
    ];

    expect(buildTodayLessonOptions(lessons)).toEqual([]);
  });

  it("formats lesson range from first start to last end", () => {
    expect(
      formatLessonRange([
        { period: 3, startTime: "21:00:00", endTime: "22:00:00" },
        { period: 1, startTime: "19:00:00", endTime: "20:00:00" },
      ]),
    ).toBe("19:00 - 22:00");
  });

  it("builds fallback today lesson options from assigned subjects", () => {
    const subjects: SubjectDetailResponseDto[] = [
      {
        classroomId: 5,
        classroomName: "벚꽃반",
        name: "한글 읽기",
        dayOfWeek: "MONDAY",
        period: 1,
        startAt: "2026-06-01",
        endAt: "2026-06-30",
        startTime: "19:00:00",
        endTime: "20:00:00",
        isActive: true,
      },
      {
        classroomId: 5,
        classroomName: "벚꽃반",
        name: "생활 문해",
        dayOfWeek: "MONDAY",
        period: 2,
        startAt: "2026-06-01",
        endAt: "2026-06-30",
        startTime: "20:00:00",
        endTime: "21:00:00",
        isActive: true,
      },
    ];

    expect(buildTodayLessonOptionsFromSubjects(subjects, "2026-06-22")).toEqual([
      {
        classroomId: 5,
        classroomName: "벚꽃반",
        subjectName: "한글 읽기",
        activityTime: "19:00 - 21:00",
        lessonDate: "2026-06-22",
        source: "subject",
      },
    ]);
  });

  it("treats subjects without isActive as active by default", () => {
    const subjects: SubjectDetailResponseDto[] = [
      {
        classroomId: 7,
        classroomName: "목련반",
        name: "기초 수학",
        dayOfWeek: "MONDAY",
        period: 1,
        startAt: "2026-06-01",
        endAt: "2026-06-30",
        startTime: "18:00:00",
        endTime: "19:00:00",
      },
    ];

    expect(buildTodayLessonOptionsFromSubjects(subjects, "2026-06-22")).toEqual([
      {
        classroomId: 7,
        classroomName: "목련반",
        subjectName: "기초 수학",
        activityTime: "18:00 - 19:00",
        lessonDate: "2026-06-22",
        source: "subject",
      },
    ]);
  });
});
