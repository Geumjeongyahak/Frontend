import { isAxiosError } from "axios";
import authClient from "../client/authClient";
import type {
  CreateDailyScheduleJournalRequestDto,
  DailyScheduleDetailQueryParamsDto,
  DailyScheduleDetailResponseDto,
  DailyScheduleListResponseDto,
  DailyScheduleListQueryParamsDto,
  DailySchedulePathParamsDto,
  DailyScheduleVolunteerHoursQueryParamsDto,
  DailyScheduleVolunteerHoursResponseDto,
  UpdateDailyScheduleJournalRequestDto,
  UpdateDailyScheduleStatusRequestDto,
  UpdateDailyStudentAttendancesRequestDto,
  UpdateDailyTeacherAttendanceRequestDto,
  UpdateDailyTeacherAttendanceCorrectionRequestDto,
} from "./dailySchedule.dto";

// 조건에 맞는 하루 일정 목록을 조회하는 요청
export async function getDailySchedules(query?: DailyScheduleListQueryParamsDto) {
  const response = await authClient.get<DailyScheduleListResponseDto>("/api/v1/daily-schedules", {
    params: query,
  });

  return response.data;
}

// 특정 하루 일정 상세를 조회하는 요청
export async function getDailySchedule(pathParams: DailySchedulePathParamsDto) {
  const response = await authClient.get<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}`,
  );

  return response.data;
}

// 날짜/분반 기준 하루 일정 상세를 조회하는 요청
export async function getDailyScheduleDetail(query: DailyScheduleDetailQueryParamsDto) {
  const response = await authClient.get<DailyScheduleDetailResponseDto>(
    "/api/v1/daily-schedules/detail",
    { params: query },
  );

  return response.data;
}

// 날짜/분반 기준으로 일정 존재 여부를 확인한 뒤 상세를 조회하는 요청
export async function getDailyScheduleDetailIfExists(query: DailyScheduleDetailQueryParamsDto) {
  try {
    return await getDailyScheduleDetail(query);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// 봉사 인정 시간을 조회하는 요청
export async function getVolunteerHours(query?: DailyScheduleVolunteerHoursQueryParamsDto) {
  const response = await authClient.get<DailyScheduleVolunteerHoursResponseDto>(
    "/api/v1/daily-schedules/volunteer-hours",
    {
      params: query,
    },
  );

  return response.data;
}

// 수업 일지를 최초 작성하는 요청
export async function createJournal(body: CreateDailyScheduleJournalRequestDto) {
  const response = await authClient.post<DailyScheduleDetailResponseDto>(
    "/api/v1/daily-schedules/journal",
    body,
  );

  return response.data;
}

// 특정 하루 일정의 수업 일지를 수정하는 요청
export async function updateJournal(
  pathParams: DailySchedulePathParamsDto,
  body: UpdateDailyScheduleJournalRequestDto,
) {
  const response = await authClient.patch<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}/journal`,
    body,
  );

  return response.data;
}

// 특정 하루 일정의 수업 일지를 삭제하는 요청
export async function deleteJournal(pathParams: DailySchedulePathParamsDto) {
  await authClient.delete(`/api/v1/daily-schedules/${pathParams.dailyScheduleId}/journal`);
}

// 특정 하루 일정 상태를 변경하는 요청
export async function updateStatus(
  pathParams: DailySchedulePathParamsDto,
  body: UpdateDailyScheduleStatusRequestDto,
) {
  const response = await authClient.patch<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}/status`,
    body,
  );

  return response.data;
}

// 특정 하루 일정의 교사 출석을 처리하는 요청
export async function updateTeacherAttendance(
  pathParams: DailySchedulePathParamsDto,
  body: UpdateDailyTeacherAttendanceRequestDto,
) {
  const response = await authClient.patch<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}/teacher-attendance`,
    body,
  );

  return response.data;
}

// 특정 하루 일정의 교사 퇴근을 처리하는 요청
export async function checkOutTeacherAttendance(pathParams: DailySchedulePathParamsDto) {
  const response = await authClient.patch<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}/teacher-attendance/check-out`,
  );

  return response.data;
}

// 특정 하루 일정의 교사 출석 정보를 관리자가 보정하는 요청
export async function correctTeacherAttendance(
  pathParams: DailySchedulePathParamsDto,
  body: UpdateDailyTeacherAttendanceCorrectionRequestDto,
) {
  const response = await authClient.patch<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}/teacher-attendance/adjustment`,
    body,
  );

  return response.data;
}

// 특정 하루 일정의 학생 출석부를 처리하는 요청
export async function updateStudentAttendances(
  pathParams: DailySchedulePathParamsDto,
  body: UpdateDailyStudentAttendancesRequestDto,
) {
  const response = await authClient.patch<DailyScheduleDetailResponseDto>(
    `/api/v1/daily-schedules/${pathParams.dailyScheduleId}/student-attendances`,
    body,
  );

  return response.data;
}
