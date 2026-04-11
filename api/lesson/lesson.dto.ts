export type LessonStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type TeacherAttendanceStatus = AttendanceStatus | "EXCUSED";

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

export interface UpdateLessonNoteRequestDto {
  note: string;
}

export interface UpdateLessonStatusRequestDto {
  status: LessonStatus;
}

export interface UpdateTeacherAttendanceRequestDto {
  status: AttendanceStatus;
}

export interface UpdateStudentAttendanceItemRequestDto {
  studentId: number;
  status: AttendanceStatus;
  memo?: string;
}

export interface UpdateStudentAttendancesRequestDto {
  attendances: UpdateStudentAttendanceItemRequestDto[];
}

export interface LessonSummaryResponseDto {
  lessonId?: number;
  date?: string;
  period?: number;
  startTime?: string;
  endTime?: string;
  teacherName?: string;
  subjectName?: string;
}

export type LessonListItemDto = LessonSummaryResponseDto;

export interface LessonDetailResponseDto {
  lessonId?: number;
  date?: string;
  period?: number;
  startTime?: string;
  endTime?: string;
  status?: LessonStatus;
  teacherAttendance?: TeacherAttendanceStatus;
  teacherName?: string;
  subjectName?: string;
  note?: string;
}

export interface LessonNoteResponseDto {
  lessonId?: number;
  note?: string;
}

export interface StudentAttendanceResponseDto {
  studentId?: number;
  studentName?: string;
  status?: AttendanceStatus;
  memo?: string;
}

export interface LessonPathParamsDto {
  lessonId: number;
}
