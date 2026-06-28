export interface EventListQueryParamsDto {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface EventPathParamsDto {
  eventId: number;
}

export interface EventResponseDto {
  id?: number | string;
  title?: string;
  description?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  lastModifiedById?: number;
  lastModifiedByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventListResponseDto {
  content?: EventResponseDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface CreateEventRequestDto {
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateEventRequestDto {
  title?: string;
  description?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
}
