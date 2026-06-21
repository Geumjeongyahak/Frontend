import type {
  AvailableTeacherScheduleResponseDto,
  TeacherApplicationResponseDto,
} from "@/api/teacherApplication/teacherApplication.dto";
import type { SubjectDayOfWeek } from "@/api/subject/subject.dto";

const DAY_OF_WEEK_LABELS: Record<SubjectDayOfWeek, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

function formatSubjectDayOfWeek(dayOfWeek?: SubjectDayOfWeek) {
  return dayOfWeek ? DAY_OF_WEEK_LABELS[dayOfWeek] : "—";
}

function formatSubjectTimeRange(startTime?: string, endTime?: string) {
  const start = startTime ? startTime.slice(0, 5) : "—";
  const end = endTime ? endTime.slice(0, 5) : "—";
  return `${start} ~ ${end}`;
}

export type TeacherApplicationField = {
  label: string;
  value: string;
};

export function getTeacherApplicationFields(
  application?: TeacherApplicationResponseDto | null,
): TeacherApplicationField[] {
  return [
    { label: "생년 월일", value: application?.birthDate ?? "-" },
    { label: "이름", value: application?.applicantName ?? "-" },
    { label: "연락처", value: application?.applicantPhoneNumber ?? "-" },
    { label: "이메일", value: application?.applicantEmail ?? "-" },
    { label: "주소", value: application?.address ?? "-" },
    { label: "최종 학력 및 전공", value: application?.educationAndMajor ?? "-" },
    {
      label: "지원 희망하는 과목과 요일",
      value: formatTeacherApplicationPreference(application),
    },
    { label: "금정열린배움터에 관심을 가지게 된 동기", value: application?.motivation ?? "-" },
    {
      label: "금정열린배움터에서 어떠한 선생님이 되시길 희망하십니까?",
      value: application?.desiredTeacherImage ?? "-",
    },
    {
      label: "지원자께서 생각하시는 '나눔' 의 의미를 간단하게 서술해 주십시오. (2~3문장 내외)",
      value: application?.meaningOfSharing ?? "-",
    },
  ];
}

export function formatTeacherApplicationStatus(status?: TeacherApplicationResponseDto["status"]) {
  const labels = {
    PENDING: "대기",
    APPROVED: "승인",
    REJECTED: "반려",
    CANCELLED: "취소",
  } as const;

  return status ? labels[status] : "-";
}

export function getTeacherApplicationStatusColor(
  status?: TeacherApplicationResponseDto["status"],
) {
  const colors = {
    PENDING: "#C58A00",
    APPROVED: "#88CD5A",
    REJECTED: "#DA3A30",
    CANCELLED: "#7B8480",
  } as const;

  return status ? colors[status] : "#7B8480";
}

export function formatTeacherApplicationPreference(
  application?: Pick<
    TeacherApplicationResponseDto,
    | "preferredClassroomName"
    | "preferredSubjectName"
    | "preferredDayOfWeek"
    | "preferredStartTime"
    | "preferredEndTime"
  > | null,
) {
  const classroomName = application?.preferredClassroomName?.trim();
  const subjectName = application?.preferredSubjectName?.trim();
  const dayOfWeek = formatSubjectDayOfWeek(application?.preferredDayOfWeek);
  const time = formatSubjectTimeRange(application?.preferredStartTime, application?.preferredEndTime);

  if (!classroomName && !subjectName && dayOfWeek === "—" && time === "— ~ —") {
    return "-";
  }

  const classPart = classroomName ? `${classroomName} ` : "";
  const subjectPart = subjectName ? `${subjectName} 수업` : "수업";
  return `${classPart}${subjectPart} - ${dayOfWeek}요일 ${time}`;
}

export function toTeacherScheduleOption(
  schedule: AvailableTeacherScheduleResponseDto,
  index: number,
) {
  const subjectIds = schedule.subjectIds ?? [];
  const subjects = schedule.subjects ?? [];
  const preferredSubjectId =
    subjects.find((subject) => typeof subject.subjectId === "number")?.subjectId ?? subjectIds[0];

  if (typeof preferredSubjectId !== "number") {
    return null;
  }

  const subjectNames = subjects
    .map((subject) => subject.subjectName?.trim())
    .filter((name): name is string => Boolean(name));
  const joinedSubjectNames = subjectNames.length > 0 ? subjectNames.join("/") : "미정";
  const classPart = schedule.classroomName?.trim() ? `${schedule.classroomName} ` : "";
  const dayLabel = formatSubjectDayOfWeek(schedule.dayOfWeek);
  const timeLabel = formatSubjectTimeRange(schedule.startTime, schedule.endTime);

  return {
    key: schedule.scheduleKey ?? `${preferredSubjectId}-${index}`,
    preferredSubjectId,
    label: `${classPart}${joinedSubjectNames} 수업 - ${dayLabel}요일 ${timeLabel}`,
  };
}
