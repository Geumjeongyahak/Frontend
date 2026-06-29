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

beforeEach(async () => {
  ({ toAllScheduleItems } = await import("./utils"));
});

describe("mobile-home utils", () => {
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
});
