import dayjs from "dayjs";
import type { EventResponseDto } from "@/api/event/event.dto";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import type {
  MobileHomeDayValue,
  MyLessonCardItem,
  WeeklyScheduleListItem,
} from "@/pwa/pages/mobile-home/types";

const DEFAULT_EVENT_EMOJI = "•";

const CLASS_ICON_PATHS: Array<{ keyword: string; src: string }> = [
  { keyword: "벚꽃", src: "/class/cherry-blossoms.svg" },
  { keyword: "국화", src: "/class/chrysanthemum.svg" },
  { keyword: "민들레", src: "/class/dandelion.svg" },
  { keyword: "개나리", src: "/class/forsythia.svg" },
  { keyword: "장미", src: "/class/rose.svg" },
  { keyword: "해바라기", src: "/class/sunflower.svg" },
];

const CLASS_TONES: Array<{ keyword: string; background: string; accent: string }> = [
  { keyword: "벚꽃", background: "rgba(234, 170, 185, 0.1)", accent: "#D8879D" },
  { keyword: "국화", background: "rgba(228, 158, 92, 0.1)", accent: "#D3873D" },
  { keyword: "민들레", background: "rgba(221, 218, 194, 0.18)", accent: "#9E995B" },
  { keyword: "개나리", background: "rgba(243, 221, 133, 0.16)", accent: "#C9A51B" },
  { keyword: "장미", background: "rgba(218, 124, 124, 0.1)", accent: "#C35C5C" },
  { keyword: "해바라기", background: "rgba(145, 121, 108, 0.12)", accent: "#8E6A4F" },
];

export function getCurrentDayValue(): MobileHomeDayValue {
  return dayjs().day() as MobileHomeDayValue;
}

export function getJsDayValue(date?: string): MobileHomeDayValue {
  const parsedDay = date ? dayjs(date).day() : dayjs().day();
  return parsedDay as MobileHomeDayValue;
}

export function formatTimeLabel(startTime?: string, endTime?: string) {
  const start = startTime?.slice(0, 5) ?? "";
  const end = endTime?.slice(0, 5) ?? "";

  if (start && end) {
    return `${start} ~ ${end}`;
  }

  return start || end || "-";
}

export function sortByStartTime<T extends { timeLabel?: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    (left.timeLabel ?? "99:99").localeCompare(right.timeLabel ?? "99:99"),
  );
}

export function getClassIconSrc(classroomName?: string) {
  const normalized = classroomName?.trim() ?? "";
  return CLASS_ICON_PATHS.find((item) => normalized.includes(item.keyword))?.src ?? null;
}

export function getClassTone(classroomName?: string) {
  const normalized = classroomName?.trim() ?? "";
  return (
    CLASS_TONES.find((item) => normalized.includes(item.keyword)) ?? {
      background: "rgba(136, 205, 90, 0.12)",
      accent: "#88CD5A",
    }
  );
}

function getEventEmoji(title?: string) {
  const normalizedTitle = title?.trim() ?? "";
  const matched = normalizedTitle.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u);

  if (!matched) {
    return DEFAULT_EVENT_EMOJI;
  }

  return matched[0];
}

function stripLeadingEventEmoji(title?: string) {
  const normalizedTitle = title?.trim() ?? "";

  return normalizedTitle
    .replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*/u, "")
    .trim();
}

export function toMyLessonCardItems(lessons: LessonSummaryResponseDto[] = []) {
  const grouped = new Map<string, LessonSummaryResponseDto[]>();

  lessons.forEach((lesson) => {
    const classroomName = lesson.classroomName?.trim() || "미정 반";
    const dayValue = getJsDayValue(lesson.date);
    const key = `${dayValue}:${lesson.date ?? ""}:${classroomName}`;
    const current = grouped.get(key);

    if (current) {
      current.push(lesson);
      return;
    }

    grouped.set(key, [lesson]);
  });

  return sortByStartTime(
    Array.from(grouped.entries()).map<MyLessonCardItem>(([key, groupedLessons]) => {
      const [dayText, date, classroomName] = key.split(":");
      const ordered = [...groupedLessons].sort((left, right) =>
        (left.startTime ?? "99:99").localeCompare(right.startTime ?? "99:99"),
      );
      const isCancelled = ordered.every(
        (lesson) =>
          lesson.isAbsent || lesson.status === "CANCELED" || lesson.status === "CANCELLED",
      );

      return {
        id: `my-${key}`,
        dayValue: Number(dayText) as MobileHomeDayValue,
        title: isCancelled ? "결강" : `${classroomName} 수업`,
        classroomName,
        subjectName: undefined,
        timeLabel: formatTimeLabel(ordered[0]?.startTime, ordered[ordered.length - 1]?.endTime),
        date: date || undefined,
        isCancelled,
        periods: ordered.map((lesson) => ({
          period: lesson.period,
          subjectName: lesson.subjectName,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          status: lesson.isAbsent ? "CANCELLED" : lesson.status,
        })),
      };
    }),
  );
}

export function toAllScheduleItems(
  lessons: LessonSummaryResponseDto[] = [],
  events: EventResponseDto[] = [],
) {
  const lessonItems = lessons.map<WeeklyScheduleListItem>((lesson, index) => ({
    id: `lesson-${lesson.lessonId ?? `${lesson.date ?? "unknown"}-${lesson.period ?? index}`}`,
    dayValue: getJsDayValue(lesson.date),
    title: lesson.subjectName?.trim() || `${lesson.classroomName?.trim() || "수업"} 수업`,
    timeLabel: formatTimeLabel(lesson.startTime, lesson.endTime),
    date: lesson.date,
    classroomName: lesson.classroomName?.trim() || undefined,
    kind: "lesson",
    isCancelled:
      Boolean(lesson.isAbsent) ||
      lesson.status === "CANCELED" ||
      lesson.status === "CANCELLED",
  }));

  const eventItems = events.map<WeeklyScheduleListItem>((event, index) => ({
    id: `event-${event.id ?? index}`,
    dayValue: getJsDayValue(event.eventDate),
    title: stripLeadingEventEmoji(event.title) || "기관 일정",
    timeLabel: formatTimeLabel(event.startTime, event.endTime),
    date: event.eventDate,
    kind: "event",
    isCancelled: false,
    emoji: getEventEmoji(event.title),
    description: event.description?.trim() || undefined,
  }));

  return sortByStartTime([...lessonItems, ...eventItems]);
}
