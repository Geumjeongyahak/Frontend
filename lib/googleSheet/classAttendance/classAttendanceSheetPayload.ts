import type { StudentListResponseDto } from "@/api/student/student.dto";
import { parseKoreanShortDateToIsoDate } from "@/utils/kstShortDate";

const ATTENDANCE_COLUMNS = 10;

export type ClassAttendanceSheetPayload = {
  date: string;
  className: string;
  attendances: {
    name: string;
    status: string;
  }[];
};

export function toAttendanceSheetDate(date: string) {
  return parseKoreanShortDateToIsoDate(date) ?? date;
}

export function buildClassAttendanceSheetPayload(
  formData: FormData,
  students: StudentListResponseDto,
  className: string,
  date: string,
): ClassAttendanceSheetPayload {
  return {
    date: toAttendanceSheetDate(date),
    className,
    attendances: students.flatMap((student, index) => {
      if (typeof student.id !== "number") return [];

      const rowIndex = Math.floor(index / ATTENDANCE_COLUMNS);
      const column = index % ATTENDANCE_COLUMNS;
      const slotIndex = rowIndex * ATTENDANCE_COLUMNS + column + 1;
      const name = String(formData.get(`studentName${slotIndex}`) ?? student.name ?? "").trim();

      if (!name) return [];

      const isPresent = formData.get(`attendanceStatus${slotIndex}`) === "on";

      return [
        {
          name,
          status: isPresent ? "O" : "X",
        },
      ];
    }),
  };
}
