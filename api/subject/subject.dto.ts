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
  teacherId?: number | null;
  name: string;
  startAt: string;
  endAt: string;
  dayOfWeek: SubjectDayOfWeek;
  startTime: string;
  endTime: string;
  period: number;
  description?: string;
}

export interface UpdateSubjectRequestDto {
  name?: string;
  description?: string;
}

export interface AssignSubjectTeacherRequestDto {
  teacherId?: number | null;
}

export interface AssignTeacherToScheduleRequestDto {
  teacherId: number;
  subjectIds: number[];
  confirmTeacherReplacement?: boolean;
}

export interface UnassignTeacherScheduleRequestDto {
  subjectIds: number[];
}

export interface UpdateSubjectScheduleRequestDto {
  startAt?: string;
  endAt?: string;
  dayOfWeek?: SubjectDayOfWeek;
  startTime?: string;
  endTime?: string;
  period?: number;
}

export interface SubjectDetailResponseDto {
  id?: number;
  classroomId?: number;
  classroomName?: string;
  teacherId?: number | null;
  teacherName?: string | null;
  name?: string;
  startAt?: string;
  endAt?: string;
  times?: number;
  dayOfWeek?: SubjectDayOfWeek;
  startTime?: string;
  endTime?: string;
  period?: number;
  teacherAssignedAt?: string | null;
  description?: string;
  isActive?: boolean;
}

export type SubjectListItemDto = SubjectDetailResponseDto;

export interface SubjectPathParamsDto {
  subjectId: number;
}

// 과목 기간 복사 (POST /api/v1/subjects/copy). 하나라도 실패하면 아무것도 저장되지 않는다.
export interface CopySubjectsRequestDto {
  subjectIds: number[];
  startAt: string;
  endAt: string;
}

export interface CopySubjectsResponseDto {
  copiedCount: number;
  subjects: SubjectDetailResponseDto[];
}

export interface CopySubjectFailureDto {
  sourceSubjectId: number;
  classroomId?: number;
  classroomName?: string;
  dayOfWeek?: SubjectDayOfWeek;
  period?: number;
  subjectName?: string;
  reason: string;
}
