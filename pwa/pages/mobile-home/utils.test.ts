import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventResponseDto } from "@/api/event/event.dto";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";

vi.mock("@/api/event/eventDisplay", () => ({
  getEventDisplayDate: (event: EventResponseDto & Record<string, unknown>) =>
    typeof event.eventDate === "string" ? event.eventDate : undefined,
  getEventDisplayId: (event: EventResponseDto & Record<string, unknown>, fallbackIndex = 0) =>
    typeof event.id === "number" ? String(event.id) : `event-${fallbackIndex}`,
  getEventDisplayTitle: (event: EventResponseDto & Record<string, unknown>) =>
    typeof event.title === "string" ? event.title : "기관 일정",
}));

let toAllScheduleItems: typeof import("./utils").toAllScheduleItems;
let hasWrittenClassJournal: typeof import("./utils").hasWrittenClassJournal;
let getClassIconSrc: typeof import("./utils").getClassIconSrc;

beforeEach(async () => {
  ({ toAllScheduleItems, hasWrittenClassJournal, getClassIconSrc } = await import("./utils"));
});

describe("mobile-home utils", () => {
  it("matches each classroom keyword to its icon", () => {
    expect(getClassIconSrc("주말 스마트폰반")).toBe("/class/smart_phone.svg");
    expect(getClassIconSrc("나무 1반")).toBe("/class/tree_1.svg");
    expect(getClassIconSrc("나무 2반")).toBe("/class/tree_2.svg");
    expect(getClassIconSrc("새싹 1반")).toBe("/class/sprout_1.svg");
    expect(getClassIconSrc("새싹 2반")).toBe("/class/sprout_2.svg");
    expect(getClassIconSrc("열매 1반")).toBe("/class/fruit_1.svg");
    expect(getClassIconSrc("열매 2반")).toBe("/class/fruit_2.svg");
    expect(getClassIconSrc("상현달반")).toBe("/class/first_quarter_moon.svg");
    expect(getClassIconSrc("하현달반")).toBe("/class/last_quarter_moon.svg");
    expect(getClassIconSrc("초승달반")).toBe("/class/crescent_moon.svg");
    expect(getClassIconSrc("씨앗반")).toBe("/class/seed.svg");
  });

  it("groups weekly lesson items by classroom and date for the all schedule view", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 1,
        date: "2026-06-29",
        classroomName: "벚꽃반",
        subjectName: "한글 기초",
        period: 1,
        startTime: "19:20:00",
        endTime: "20:00:00",
      },
      {
        lessonId: 2,
        date: "2026-06-29",
        classroomName: "벚꽃반",
        subjectName: "생활 문해",
        period: 3,
        startTime: "21:00:00",
        endTime: "21:40:00",
      },
    ];

    const items = toAllScheduleItems(lessons, []);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "벚꽃반",
      timeLabel: "19:20 ~ 21:40",
      kind: "lesson",
      classroomName: "벚꽃반",
    });
    expect(items[0].periods).toHaveLength(2);
  });

  it("includes academic events alongside grouped lesson items", () => {
    const lessons: LessonSummaryResponseDto[] = [
      {
        lessonId: 1,
        date: "2026-06-29",
        classroomName: "벚꽃반",
        period: 1,
        startTime: "19:20:00",
        endTime: "20:00:00",
      },
    ];
    const events: EventResponseDto[] = [
      {
        id: 10,
        title: "🎉 개교기념일",
        eventDate: "2026-06-29",
        startTime: "09:00:00",
        endTime: "10:00:00",
      },
    ];

    const items = toAllScheduleItems(lessons, events);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      kind: "event",
      title: "개교기념일",
      timeLabel: "09:00 ~ 10:00",
    });
    expect(items[1]).toMatchObject({
      kind: "lesson",
      title: "벚꽃반",
    });
  });

  it("treats a daily schedule with a non-empty lesson note as a written journal", () => {
    expect(
      hasWrittenClassJournal({
        dailyScheduleId: 1,
        lessonDate: "2026-06-30",
        classroomId: 1,
        classroomName: "벚꽃반",
        teacherId: 1,
        teacherName: "홍길동",
        activityStartTime: "19:20:00",
        activityEndTime: "21:40:00",
        status: "SCHEDULED",
        lessonCount: 1,
        lessons: [{ lessonId: 1, period: 1, note: "받아쓰기 복습 진행" }],
      }),
    ).toBe(true);
  });

  it("treats a daily schedule without lesson notes as an unwritten journal", () => {
    expect(
      hasWrittenClassJournal({
        dailyScheduleId: 1,
        lessonDate: "2026-06-30",
        classroomId: 1,
        classroomName: "벚꽃반",
        teacherId: 1,
        teacherName: "홍길동",
        activityStartTime: "19:20:00",
        activityEndTime: "21:40:00",
        status: "SCHEDULED",
        lessonCount: 2,
        lessons: [
          { lessonId: 1, period: 1, note: "   " },
          { lessonId: 2, period: 2, note: null },
        ],
      }),
    ).toBe(false);
  });
});
