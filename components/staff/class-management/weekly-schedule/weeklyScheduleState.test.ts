import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  buildScheduleOverrides,
  formatTeacherAttendanceTime,
  getSubjectsForCell,
  getWeekRange,
} from "./weeklyScheduleState";

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
      lessonStatus: "EXCHANGED",
      attendanceStatus: undefined,
      teacherName: "이교사",
      subjectName: "국어",
      relatedDate: "2026-06-17",
      attendedAt: undefined,
      checkedOutAt: undefined,
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

  it("uses actual lesson subject and teacher info even without exchange status", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 300,
        classroomId: 10,
        date: "2026-06-15",
        period: 1,
        teacherName: "박교사",
        subjectName: "수학",
        status: "SCHEDULED",
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, "2026-06-15");

    expect(overrides.get(1)).toEqual({
      teacherName: "박교사",
      subjectName: "수학",
    });
  });

  it("marks a period as substituted when the lesson is exchanged without a related date", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 400,
        classroomId: 10,
        date: "2026-06-15",
        period: 1,
        teacherName: "최교사",
        subjectName: "과학",
        isExchanged: true,
        exchangedLessonDate: null,
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, "2026-06-15");

    expect(overrides.get(1)).toEqual({
      status: "SUBSTITUTED",
      lessonStatus: "SUBSTITUTED",
      attendanceStatus: undefined,
      teacherName: "최교사",
      subjectName: "과학",
      relatedDate: undefined,
      attendedAt: undefined,
      checkedOutAt: undefined,
    });
  });

  it("marks a period as absent when the assigned teacher has neither attended nor checked out", () => {
    const now = dayjs();
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 500,
        classroomId: 10,
        date: now.format("YYYY-MM-DD"),
        period: 1,
        startTime: now.subtract(1, "hour").format("HH:mm"),
        teacherName: "김교사",
        subjectName: "국어",
        teacherAttendance: {
          isAttended: false,
          isCheckedOut: false,
        },
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, now.format("YYYY-MM-DD"));

    expect(overrides.get(1)).toEqual({
      status: "ABSENT",
      attendanceStatus: "ABSENT",
      teacherName: "김교사",
      subjectName: "국어",
      attendedAt: undefined,
      checkedOutAt: undefined,
    });
  });

  it("marks a period as attended when the assigned teacher has attended", () => {
    const now = dayjs();
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 600,
        classroomId: 10,
        date: now.format("YYYY-MM-DD"),
        period: 1,
        startTime: now.subtract(1, "hour").format("HH:mm"),
        teacherName: "김교사",
        subjectName: "국어",
        teacherAttendance: {
          isAttended: true,
          isCheckedOut: false,
        },
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, now.format("YYYY-MM-DD"));

    expect(overrides.get(1)).toEqual({
      status: "ATTENDED",
      attendanceStatus: "ATTENDED",
      teacherName: "김교사",
      subjectName: "국어",
      attendedAt: undefined,
      checkedOutAt: undefined,
    });
  });

  it("marks a period as checked out when the assigned teacher has checked out", () => {
    const now = dayjs();
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 700,
        classroomId: 10,
        date: now.format("YYYY-MM-DD"),
        period: 1,
        startTime: now.subtract(1, "hour").format("HH:mm"),
        teacherName: "김교사",
        subjectName: "국어",
        teacherAttendance: {
          isAttended: true,
          isCheckedOut: true,
        },
      },
    ];

    const overrides = buildScheduleOverrides(BASE_SUBJECTS, lessons, 10, now.format("YYYY-MM-DD"));

    expect(overrides.get(1)).toEqual({
      status: "CHECKED_OUT",
      attendanceStatus: "CHECKED_OUT",
      teacherName: "김교사",
      subjectName: "국어",
      attendedAt: undefined,
      checkedOutAt: undefined,
    });
  });

  it("does not mark attendance status when no teacher is assigned", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 800,
        classroomId: 10,
        date: "2026-06-15",
        period: 1,
        subjectName: "국어",
        teacherAttendance: {
          isAttended: false,
          isCheckedOut: false,
        },
      },
    ];

    const overrides = buildScheduleOverrides(
      [{ ...BASE_SUBJECTS[0], teacherName: undefined }],
      lessons,
      10,
      "2026-06-15",
    );

    expect(overrides.get(1)).toEqual({
      subjectName: "국어",
      teacherName: undefined,
    });
  });

  it("filters subjects by assignment date range for the selected week date", () => {
    const subjects: SubjectDetailResponseDto[] = [
      {
        id: 1,
        classroomId: 10,
        dayOfWeek: "MONDAY",
        period: 1,
        name: "국어",
        startAt: "2026-06-01",
        endAt: "2026-06-30",
      },
      {
        id: 2,
        classroomId: 10,
        dayOfWeek: "MONDAY",
        period: 2,
        name: "영어",
        startAt: "2026-07-01",
        endAt: "2026-07-31",
      },
    ];

    expect(getSubjectsForCell(subjects, 10, "MONDAY", "2026-06-15")).toEqual([subjects[0]]);
  });

  it("does not show attendance status before the lesson start time", () => {
    const now = dayjs();
    const date = now.add(1, "day").format("YYYY-MM-DD");
    const futureTime = "09:00";

    const overrides = buildScheduleOverrides(
      BASE_SUBJECTS,
      [
        {
          lessonId: 900,
          classroomId: 10,
          date,
          period: 1,
          startTime: futureTime,
          teacherName: "김교사",
          subjectName: "국어",
          teacherAttendance: {
            isAttended: false,
            isCheckedOut: false,
          },
        },
      ],
      10,
      date,
    );

    expect(overrides.get(1)).toEqual({
      teacherName: "김교사",
      subjectName: "국어",
      attendedAt: undefined,
      checkedOutAt: undefined,
    });
  });

  it("prioritizes attendance status over exchanged status after the lesson start time", () => {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const startedHour = String(today.getHours()).padStart(2, "0");

    const overrides = buildScheduleOverrides(
      BASE_SUBJECTS,
      [
        {
          lessonId: 1000,
          classroomId: 10,
          date,
          period: 1,
          startTime: `${startedHour}:00`,
          teacherName: "김교사",
          subjectName: "국어",
          isExchanged: true,
          exchangedLessonDate: "2026-06-17",
          teacherAttendance: {
            isAttended: true,
            isCheckedOut: false,
            attendedAt: "2026-06-15T18:55:00",
          },
        },
      ],
      10,
      date,
    );

    expect(overrides.get(1)).toEqual({
      status: "ATTENDED",
      lessonStatus: "EXCHANGED",
      attendanceStatus: "ATTENDED",
      teacherName: "김교사",
      subjectName: "국어",
      relatedDate: "2026-06-17",
      attendedAt: "2026-06-15T18:55:00",
      checkedOutAt: undefined,
    });
  });

  it("formats teacher attendance time to hours and minutes", () => {
    expect(formatTeacherAttendanceTime("2026-06-15T18:55:00")).toBe("18:55");
    expect(formatTeacherAttendanceTime(undefined)).toBe("");
  });
});
