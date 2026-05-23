export type DailyScheduleStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";
export type DailyTeacherAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type DailyStudentAttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface DailyScheduleListQueryParamsDto {
  keyword?: string;
  mine?: boolean;
  page?: number;
  size?: number;
}

export interface DailySchedulePathParamsDto {
  dailyScheduleId: number;
}

export interface DailyScheduleDetailQueryParamsDto {
  classroomId: number;
  lessonDate: string;
}

export interface DailyScheduleVolunteerHoursQueryParamsDto {
  from?: string;
  to?: string;
  teacherId?: number;
}

export interface DailyScheduleLessonResponseDto {
  lessonId?: number;
  period?: number;
  startTime?: string;
  endTime?: string;
  subjectName?: string;
  note?: string | null;
}

export interface DailyTeacherAttendanceResponseDto {
  attendanceId?: number;
  status?: DailyTeacherAttendanceStatus;
  attendedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  volunteerServiceMinutes?: number;
}

export interface DailyStudentAttendanceResponseDto {
  attendanceId?: number;
  studentId?: number;
  studentName?: string;
  status?: DailyStudentAttendanceStatus;
}

export interface DailyScheduleSummaryResponseDto {
  dailyScheduleId: number;
  lessonDate: string;
  classroomId: number;
  classroomName: string;
  teacherId: number;
  teacherName: string;
  activityStartTime: string;
  activityEndTime: string;
  volunteerServiceMinutes?: number | null;
  status: DailyScheduleStatus;
  teacherAttendanceStatus?: DailyTeacherAttendanceStatus | null;
  lessonCount: number;
  lessons?: DailyScheduleLessonResponseDto[];
}

export interface DailyScheduleDetailResponseDto extends DailyScheduleSummaryResponseDto {
  teacherPhoneNumber?: string | null;
  residentRegistrationNumberPrefix?: string | null;
  personalInfoConsent?: boolean;
  teacherAttendance?: DailyTeacherAttendanceResponseDto | null;
  studentAttendances?: DailyStudentAttendanceResponseDto[];
}

export interface DailyScheduleListResponseDto {
  content: DailyScheduleSummaryResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LessonJournalRequestDto {
  lessonId: number;
  note: string;
}

export interface CreateDailyScheduleJournalRequestDto {
  lessonDate: string;
  classroomId: number;
  personalInfoConsent: boolean;
  residentRegistrationNumberPrefix?: string;
  lessonJournals: LessonJournalRequestDto[];
}

export interface UpdateDailyScheduleJournalRequestDto {
  personalInfoConsent: boolean;
  residentRegistrationNumberPrefix?: string;
  lessonJournals: LessonJournalRequestDto[];
}

export interface UpdateDailyScheduleStatusRequestDto {
  status: DailyScheduleStatus;
}

export interface UpdateDailyTeacherAttendanceRequestDto {
  status: DailyTeacherAttendanceStatus;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDailyStudentAttendanceItemRequestDto {
  studentId: number;
  status: DailyStudentAttendanceStatus;
}

export interface UpdateDailyStudentAttendancesRequestDto {
  attendances: UpdateDailyStudentAttendanceItemRequestDto[];
}

export interface DailyScheduleVolunteerHoursResponseDto {
  teacherId?: number;
  from?: string | null;
  to?: string | null;
  totalVolunteerServiceMinutes?: number;
  totalVolunteerServiceHours?: number;
}
