import type { DailyStudentAttendanceStatus } from "@/api/dailySchedule/dailySchedule.dto";

export const dailyStudentAttendanceOptions: Array<{
  value: DailyStudentAttendanceStatus;
  label: string;
}> = [
  { value: "PRESENT", label: "출석" },
  { value: "LATE", label: "지각" },
  { value: "ABSENT", label: "결석" },
];

export function getDailyStudentAttendanceLabel(status?: DailyStudentAttendanceStatus | null) {
  if (status === "PRESENT") return "출석";
  if (status === "LATE") return "지각";
  if (status === "ABSENT") return "결석";
  return "";
}

export function getDailyStudentAttendanceStatusOrDefault(
  status?: DailyStudentAttendanceStatus | null,
): DailyStudentAttendanceStatus {
  if (status === "PRESENT" || status === "LATE" || status === "ABSENT") {
    return status;
  }

  return "ABSENT";
}
