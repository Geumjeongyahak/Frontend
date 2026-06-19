import { describe, expect, it } from "vitest";
import { mapLessonsToWeeklySchedule } from "./mapLessonsToWeeklySchedule";

describe("mapLessonsToWeeklySchedule", () => {
  it("groups institution events and teacher assignments into the same week", () => {
    const schedule = mapLessonsToWeeklySchedule(
      [
        {
          subjectId: 10,
          subjectName: "영어",
          classroomId: 3,
          classroomName: "해바라기반",
          dayOfWeek: "WEDNESDAY",
          startTime: "19:00:00",
          endTime: "19:50:00",
          period: 1,
          startAt: "2026-06-01",
          endAt: "2026-06-30",
        },
        {
          subjectId: 11,
          subjectName: "수학",
          classroomId: 3,
          classroomName: "해바라기반",
          dayOfWeek: "WEDNESDAY",
          startTime: "20:00:00",
          endTime: "20:50:00",
          period: 2,
          startAt: "2026-06-01",
          endAt: "2026-06-30",
        },
      ],
      [
        {
          id: 20,
          title: "교원 회의",
          eventDate: "2026-06-17",
          startTime: "18:00",
          endTime: "18:30",
        },
      ],
      "2026-06-15",
    );

    expect(schedule[2]).toEqual({
      day: "수",
      items: [
        {
          id: 20,
          type: "event",
          time: "18:00-18:30",
          title: "교원 회의",
        },
        {
          id: 10,
          type: "lesson",
          time: "19:00-20:50",
          date: "2026-06-17",
          classroomName: "해바라기반",
          title: "해바라기반 수업",
          periods: [
            { period: 1, subjectName: "영어", status: "SCHEDULED" },
            { period: 2, subjectName: "수학", status: "SCHEDULED" },
          ],
        },
      ],
    });
  });

  it("keeps all days empty when there are no events or assignments", () => {
    const schedule = mapLessonsToWeeklySchedule([], [], "2026-06-15");

    expect(schedule).toHaveLength(7);
    expect(schedule.every((day) => day.items.length === 0)).toBe(true);
  });

  it("shows multiple classrooms from users/me teacher assignments", () => {
    const schedule = mapLessonsToWeeklySchedule(
      [
        {
          subjectId: 17,
          subjectName: "과학",
          classroomId: 3,
          classroomName: "민들레반",
          dayOfWeek: "WEDNESDAY",
          startTime: "21:00:00",
          endTime: "21:50:00",
          period: 3,
          startAt: "2026-06-17",
          endAt: "2026-06-30",
        },
        {
          subjectId: 18,
          subjectName: "영어",
          classroomId: 3,
          classroomName: "민들레반",
          dayOfWeek: "WEDNESDAY",
          startTime: "20:00:00",
          endTime: "20:50:00",
          period: 2,
          startAt: "2026-06-17",
          endAt: "2026-06-30",
        },
        {
          subjectId: 19,
          subjectName: "국어",
          classroomId: 3,
          classroomName: "민들레반",
          dayOfWeek: "WEDNESDAY",
          startTime: "19:00:00",
          endTime: "19:50:00",
          period: 1,
          startAt: "2026-06-17",
          endAt: "2026-06-30",
        },
        {
          subjectId: 20,
          subjectName: "한문",
          classroomId: 4,
          classroomName: "동백반",
          dayOfWeek: "WEDNESDAY",
          startTime: "19:00:00",
          endTime: "19:50:00",
          period: 1,
          startAt: "2026-06-18",
          endAt: "2026-06-30",
        },
        {
          subjectId: 21,
          subjectName: "러시아어",
          classroomId: 4,
          classroomName: "동백반",
          dayOfWeek: "WEDNESDAY",
          startTime: "20:00:00",
          endTime: "20:50:00",
          period: 2,
          startAt: "2026-06-18",
          endAt: "2026-06-30",
        },
        {
          subjectId: 22,
          subjectName: "이탈리아어",
          classroomId: 4,
          classroomName: "동백반",
          dayOfWeek: "WEDNESDAY",
          startTime: "21:00:00",
          endTime: "21:50:00",
          period: 3,
          startAt: "2026-06-18",
          endAt: "2026-06-30",
        },
      ],
      [],
      "2026-06-15",
    );

    expect(schedule[2]?.items).toHaveLength(2);
    expect(schedule[2]?.items.map((item) => item.title)).toEqual([
      "민들레반 수업",
      "동백반 수업",
    ]);
  });
});

