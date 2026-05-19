import authClient from "../client/authClient";
import type {
  DailyScheduleListQueryParamsDto,
  DailyScheduleResponseDto,
} from "./dailySchedule.dto";

// 조건에 맞는 하루 일정 목록을 조회하는 요청
export async function getDailySchedules(query: DailyScheduleListQueryParamsDto) {
  const response = await authClient.get<DailyScheduleResponseDto[]>("/api/v1/daily-schedules", {
    params: query,
  });

  return response.data;
}
