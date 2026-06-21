import { describe, expect, it } from "vitest";
import {
  formatTeacherApplicationPreference,
  formatTeacherApplicationStatus,
  toTeacherScheduleOption,
} from "./teacherApplicationUtils";

describe("teacherApplicationUtils", () => {
  it("formats teacher schedule options for the dropdown", () => {
    const option = toTeacherScheduleOption(
      {
        scheduleKey: "1-TUESDAY",
        classroomName: "개나리반",
        dayOfWeek: "TUESDAY",
        startTime: "19:00:00",
        endTime: "21:00:00",
        subjectIds: [3, 4],
        subjects: [
          { subjectId: 3, subjectName: "한글" },
          { subjectId: 4, subjectName: "영어" },
        ],
      },
      0,
    );

    expect(option).toEqual({
      key: "1-TUESDAY",
      preferredSubjectId: 3,
      label: "개나리반 한글/영어 수업 - 화요일 19:00 ~ 21:00",
    });
  });

  it("formats the preferred lesson summary in application detail", () => {
    expect(
      formatTeacherApplicationPreference({
        preferredClassroomName: "개나리반",
        preferredSubjectName: "한글",
        preferredDayOfWeek: "THURSDAY",
        preferredStartTime: "18:00:00",
        preferredEndTime: "20:00:00",
      }),
    ).toBe("개나리반 한글 수업 - 목요일 18:00 ~ 20:00");
  });

  it("maps statuses to Korean labels", () => {
    expect(formatTeacherApplicationStatus("PENDING")).toBe("대기");
    expect(formatTeacherApplicationStatus("APPROVED")).toBe("승인");
    expect(formatTeacherApplicationStatus("REJECTED")).toBe("반려");
    expect(formatTeacherApplicationStatus("CANCELLED")).toBe("취소");
  });
});
