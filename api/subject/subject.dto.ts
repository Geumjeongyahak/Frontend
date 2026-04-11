export type SubjectDayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface SubjectListQueryParamsDto {
  classroomId?: number;
}

export interface CreateSubjectRequestDto {
  classroomId: number;
  teacherId: number;
  name: string;
  startAt: string;
  endAt: string;
  times: number;
  dayOfWeek: SubjectDayOfWeek;
  startTime: string;
  endTime: string;
  period: number;
  description?: string;
}

export interface UpdateSubjectRequestDto {
  classroomId?: number;
  teacherId?: number;
  name?: string;
  startAt?: string;
  endAt?: string;
  times?: number;
  dayOfWeek?: SubjectDayOfWeek;
  startTime?: string;
  endTime?: string;
  period?: number;
  description?: string;
}

export interface SubjectDetailResponseDto {
  id?: number;
  classroomId?: number;
  teacherId?: number;
  name?: string;
  startAt?: string;
  endAt?: string;
  times?: number;
  dayOfWeek?: SubjectDayOfWeek;
  startTime?: string;
  endTime?: string;
  period?: number;
  description?: string;
  isActive?: boolean;
}

export type SubjectListItemDto = SubjectDetailResponseDto;

export interface SubjectPathParamsDto {
  subjectId: number;
}
