export type DailyScheduleStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED" | string;

export interface DailyScheduleListQueryParamsDto {
  from: string;
  to: string;
  classroomId?: number;
  teacherId?: number;
  status?: DailyScheduleStatus;
}

export interface DailyScheduleResponseDto {
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
  teacherAttendanceStatus?: string | null;
  lessonCount: number;
}
