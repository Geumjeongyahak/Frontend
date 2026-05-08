export type ClassroomType = "WEEKDAY" | "WEEKEND" | string;

export interface ClassroomListQueryParamsDto {
  name?: string;
  type?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CreateClassroomRequestDto {
  name: string;
  type: ClassroomType;
  description?: string;
}

export interface UpdateClassroomRequestDto {
  name?: string;
  type?: ClassroomType;
  description?: string;
}

export interface ClassroomDetailResponseDto {
  id?: number;
  name?: string;
  type?: ClassroomType;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ClassroomListItemDto = ClassroomDetailResponseDto;

export interface ClassroomListResponseDto {
  content?: ClassroomListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export interface ClassroomPathParamsDto {
  id: number;
}
