export type LessonStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

export interface LessonTeacherAttendanceResponseDto {
  isAttended?: boolean;
  isCheckedOut?: boolean;
  attendedAt?: string | null;
  checkedOutAt?: string | null;
}

export interface LessonRangeQueryParamsDto {
  from: string;
  to: string;
}

export interface CreateLessonRequestDto {
  subjectId: number;
  teacherId: number;
  date: string;
  startTime: string;
  endTime: string;
  period: number;
}

export interface UpdateLessonRequestDto {
  subjectId?: number;
  teacherId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  period?: number;
}

export interface UpdateLessonStatusRequestDto {
  status: LessonStatus;
}

export interface LessonSummaryResponseDto {
  lessonId?: number;
  date?: string;
  period?: number;
  startTime?: string;
  endTime?: string;
  status?: LessonStatus | "CANCELLED";
  teacherName?: string;
  subjectName?: string;
  classroomId?: number;
  classroomName?: string;
  isExchanged?: boolean;
  isAbsent?: boolean;
  exchangedLessonDate?: string | null;
  teacherAttendance?: LessonTeacherAttendanceResponseDto | null;
}

export type LessonListItemDto = LessonSummaryResponseDto;

export interface LessonDetailResponseDto {
  lessonId?: number;
  dailyScheduleId?: number | null;
  date?: string;
  period?: number;
  startTime?: string;
  endTime?: string;
  status?: LessonStatus;
  teacherName?: string;
  subjectName?: string;
  classroomId?: number;
  classroomName?: string;
  note?: string | null;
}

export interface LessonPathParamsDto {
  lessonId: number;
}
