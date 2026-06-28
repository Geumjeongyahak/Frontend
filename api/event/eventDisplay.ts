import type { EventResponseDto } from "./event.dto";

type EventLike = EventResponseDto & Record<string, unknown>;

export function getEventDisplayDate(event: EventResponseDto) {
  const rawEvent = event as EventLike;

  if (typeof event.eventDate === "string" && event.eventDate) {
    return event.eventDate;
  }

  if (typeof rawEvent.date === "string" && rawEvent.date) {
    return rawEvent.date;
  }

  if (typeof rawEvent.startDate === "string" && rawEvent.startDate) {
    return rawEvent.startDate;
  }

  return undefined;
}

export function getEventDisplayTitle(event: EventResponseDto) {
  const rawEvent = event as EventLike;

  if (typeof event.title === "string" && event.title.trim()) {
    return event.title;
  }

  if (typeof rawEvent.name === "string" && rawEvent.name.trim()) {
    return rawEvent.name;
  }

  if (typeof rawEvent.eventName === "string" && rawEvent.eventName.trim()) {
    return rawEvent.eventName;
  }

  return "기관 일정";
}

export function getEventDisplayId(event: EventResponseDto, fallbackIndex = 0) {
  if (typeof event.id === "number") {
    return String(event.id);
  }

  if (typeof event.id === "string" && event.id.trim()) {
    return event.id;
  }

  const eventDate = getEventDisplayDate(event) ?? "unknown-date";
  const title = getEventDisplayTitle(event);

  return `${eventDate}-${title}-${fallbackIndex}`;
}

export function filterEventsInDateRange(
  events: EventResponseDto[] = [],
  from: string,
  to: string,
) {
  return events.filter((event) => {
    const eventDate = getEventDisplayDate(event);

    return Boolean(eventDate && eventDate >= from && eventDate <= to);
  });
}
