import type { SubjectDayOfWeek } from "../subject/subject.dto";

export type TeacherApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface TeacherApplicationPathParamsDto {
  applicationId: number;
}

export interface TeacherApplicationListQueryParamsDto {
  keyword?: string;
  page?: number;
  size?: number;
  status?: TeacherApplicationStatus;
}

export interface TeacherApplicationRequestDto {
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  educationAndMajor: string;
  preferredSubjectId: number;
  motivation: string;
  desiredTeacherImage: string;
  meaningOfSharing: string;
}

export type CreateTeacherApplicationRequestDto = TeacherApplicationRequestDto;
export type UpdateTeacherApplicationRequestDto = TeacherApplicationRequestDto;

export interface AssignedSubjectResponseDto {
  subjectId?: number;
  subjectName?: string;
  period?: number;
  startTime?: string;
  endTime?: string;
}

export interface AvailableTeacherScheduleSubjectResponseDto {
  subjectId?: number;
  subjectName?: string;
  period?: number;
  startTime?: string;
  endTime?: string;
}

export interface AvailableTeacherScheduleResponseDto {
  scheduleKey?: string;
  classroomId?: number;
  classroomName?: string;
  dayOfWeek?: SubjectDayOfWeek;
  startAt?: string;
  endAt?: string;
  startTime?: string;
  endTime?: string;
  subjectIds?: number[];
  subjects?: AvailableTeacherScheduleSubjectResponseDto[];
}

export interface TeacherApplicationResponseDto {
  id?: number;
  applicantId?: number;
  applicantName?: string;
  applicantPhoneNumber?: string;
  applicantEmail?: string;
  birthDate?: string;
  address?: string;
  educationAndMajor?: string;
  preferredSubjectId?: number;
  preferredSubjectName?: string;
  preferredClassroomName?: string;
  preferredDayOfWeek?: SubjectDayOfWeek;
  preferredStartTime?: string;
  preferredEndTime?: string;
  assignedSubjects?: AssignedSubjectResponseDto[];
  assignedClassroomId?: number | null;
  assignedClassroomName?: string | null;
  assignedDayOfWeek?: SubjectDayOfWeek | null;
  assignedStartTime?: string | null;
  assignedEndTime?: string | null;
  motivation?: string;
  desiredTeacherImage?: string;
  meaningOfSharing?: string;
  status?: TeacherApplicationStatus;
  reviewedAt?: string;
  reviewedByName?: string;
  reviewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyTeacherApplicationResponseDto {
  exists?: boolean;
  application?: TeacherApplicationResponseDto | null;
}

export interface TeacherApplicationListResponseDto {
  content?: TeacherApplicationResponseDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface ApproveTeacherApplicationRequestDto {
  assignedSubjectIds: number[];
  teacherStartAt: string;
  teacherEndAt: string;
  note?: string;
}

export interface RejectTeacherApplicationRequestDto {
  note: string;
}
