import authClient from "../client/authClient";
import publicClient from "../client/publicClient";
import type {
  CreateEventRequestDto,
  EventListQueryParamsDto,
  EventListResponseDto,
  EventPathParamsDto,
  EventResponseDto,
  UpdateEventRequestDto,
} from "./event.dto";

// 공개 행사 목록을 조회하는 요청
export async function getEvents(query?: EventListQueryParamsDto) {
  const response = await publicClient.get<EventListResponseDto>("/api/v1/events", {
    params: query,
  });
  return response.data;
}

// 공개 행사 상세를 조회하는 요청
export async function getEvent(pathParams: EventPathParamsDto) {
  const response = await publicClient.get<EventResponseDto>(
    `/api/v1/events/${pathParams.eventId}`,
  );
  return response.data;
}

// 관리자 권한으로 행사를 생성하는 요청
export async function createEvent(body: CreateEventRequestDto) {
  const response = await authClient.post<EventResponseDto>("/api/v1/admin/events", body);
  return response.data;
}

// 관리자 권한으로 행사를 수정하는 요청
export async function updateEvent(
  pathParams: EventPathParamsDto,
  body: UpdateEventRequestDto,
) {
  const response = await authClient.patch<EventResponseDto>(
    `/api/v1/admin/events/${pathParams.eventId}`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 행사를 삭제하는 요청
export async function deleteEvent(pathParams: EventPathParamsDto) {
  await authClient.delete(`/api/v1/admin/events/${pathParams.eventId}`);
}
