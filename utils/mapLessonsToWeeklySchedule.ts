import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { getEventDisplayDate, getEventDisplayId, getEventDisplayTitle } from "../api/event/eventDisplay";
import type { EventResponseDto } from "@/api/event/event.dto";
import type { SubjectDayOfWeek } from "@/api/subject/subject.dto";
import type { UserTeacherAssignmentResponseDto } from "@/api/user/user.dto";
import type { WeeklyScheduleDay } from "@/types/home";

dayjs.extend(isoWeek);

const WEEK_ORDER = ["월", "화", "수", "목", "금", "토", "일"] as const;
const DEFAULT_EVENT_EMOJI = "📌";
type WeekDay = (typeof WEEK_ORDER)[number];
type WeeklyItem = WeeklyScheduleDay["items"][number];

function splitEmojiFromTitle(title?: string) {
  const normalizedTitle = title?.trim() ?? "";
  const matched = normalizedTitle.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u);

  if (!matched) {
    return {
      emoji: DEFAULT_EVENT_EMOJI,
      title: normalizedTitle,
    };
  }

  const emoji = matched[0];
  const strippedTitle = normalizedTitle.slice(emoji.length).trim();

  return {
    emoji,
    title: strippedTitle,
  };
}

function formatTimeRange(startTime?: string, endTime?: string) {
  const start = startTime?.slice(0, 5) ?? "";
  const end = endTime?.slice(0, 5) ?? "";

  if (start && end) return `${start}-${end}`;
  return start || end;
}

function getItemSortTime(item: WeeklyItem) {
  return item.time || "99:99";
}

function mapSubjectDayToIsoWeekday(dayOfWeek?: SubjectDayOfWeek) {
  if (dayOfWeek === "MONDAY") return 1;
  if (dayOfWeek === "TUESDAY") return 2;
  if (dayOfWeek === "WEDNESDAY") return 3;
  if (dayOfWeek === "THURSDAY") return 4;
  if (dayOfWeek === "FRIDAY") return 5;
  if (dayOfWeek === "SATURDAY") return 6;
  if (dayOfWeek === "SUNDAY") return 7;
  return null;
}

function mapIsoWeekdayToLabel(isoWeekday: number): WeekDay {
  return WEEK_ORDER[isoWeekday - 1] ?? "월";
}

function buildAssignmentDate(from: string, assignment: UserTeacherAssignmentResponseDto) {
  const isoWeekday = mapSubjectDayToIsoWeekday(assignment.dayOfWeek);
  if (!isoWeekday) return null;

  const weekStart = dayjs(from).startOf("isoWeek");
  const weekEnd = dayjs(from).endOf("isoWeek");
  const lessonDate = dayjs(from).isoWeekday(isoWeekday);
  const lessonDateText = lessonDate.format("YYYY-MM-DD");

  if (assignment.startAt && dayjs(assignment.startAt).isAfter(weekEnd, "day")) return null;
  if (assignment.endAt && dayjs(assignment.endAt).isBefore(weekStart, "day")) return null;

  return lessonDateText;
}

function groupAssignmentsByDateAndClassroom(
  teacherAssignments: UserTeacherAssignmentResponseDto[],
  from: string,
) {
  const grouped = new Map<string, UserTeacherAssignmentResponseDto[]>();

  teacherAssignments.forEach((assignment) => {
    const classroomName = assignment.classroomName?.trim();
    if (!classroomName) return;

    const lessonDate = buildAssignmentDate(from, assignment);
    if (!lessonDate) return;

    const key = `${lessonDate}:${classroomName}`;
    const current = grouped.get(key);

    if (current) {
      current.push(assignment);
      return;
    }

    grouped.set(key, [assignment]);
  });

  return grouped;
}

export function mapLessonsToWeeklySchedule(
  teacherAssignments: UserTeacherAssignmentResponseDto[],
  events: EventResponseDto[] = [],
  from: string,
) {
  const grouped = new Map<WeekDay, WeeklyItem[]>();
  for (const day of WEEK_ORDER) grouped.set(day, []);

  events.forEach((event, index) => {
    const eventDate = getEventDisplayDate(event);
    if (!eventDate) return;

    const isoDay = dayjs(eventDate).isoWeekday();
    if (isoDay < 1 || isoDay > 7) return;

    const day = WEEK_ORDER[isoDay - 1];
    const rawTitle = getEventDisplayTitle(event);
    const { emoji, title } = splitEmojiFromTitle(rawTitle);

    grouped.get(day)?.push({
      id: Number(getEventDisplayId(event, index)) || undefined,
      type: "event",
      emoji,
      date: eventDate,
      time: formatTimeRange(event.startTime, event.endTime),
      title: title || rawTitle,
    });
  });

  groupAssignmentsByDateAndClassroom(teacherAssignments, from).forEach((assignments, key) => {
    const [lessonDate, classroomName] = key.split(":");
    const orderedAssignments = [...assignments].sort((a, b) => {
      const periodA = a.period ?? Number.MAX_SAFE_INTEGER;
      const periodB = b.period ?? Number.MAX_SAFE_INTEGER;
      return periodA - periodB;
    });

    const isoDay = dayjs(lessonDate).isoWeekday();
    if (isoDay < 1 || isoDay > 7) return;

    grouped.get(mapIsoWeekdayToLabel(isoDay))?.push({
      id: orderedAssignments[0]?.subjectId,
      type: "lesson",
      time: formatTimeRange(
        orderedAssignments[0]?.startTime,
        orderedAssignments[orderedAssignments.length - 1]?.endTime,
      ),
      date: lessonDate,
      classroomName,
      title: `${classroomName} 수업`,
      periods: orderedAssignments.map((assignment, index) => ({
        period: assignment.period ?? index + 1,
        subjectName: assignment.subjectName?.trim() || "미등록",
        startTime: assignment.startTime?.slice(0, 5) ?? "",
        endTime: assignment.endTime?.slice(0, 5) ?? "",
        status: "SCHEDULED",
      })),
    });
  });

  return WEEK_ORDER.map((day) => ({
    day,
    items: (grouped.get(day) ?? []).sort((a, b) =>
      getItemSortTime(a).localeCompare(getItemSortTime(b)),
    ),
  }));
}
