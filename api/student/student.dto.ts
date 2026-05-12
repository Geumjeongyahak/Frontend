export type StudentStatus = "ENROLLED" | "ON_LEAVE" | "COMPLETED";

export interface StudentPathParamsDto {
  studentId: number;
}

export interface StudentListQueryParamsDto {
  name?: string;
  status?: StudentStatus;
  classroomId?: number;
}

export interface CreateStudentRequestDto {
  name: string;
  phoneNumber?: string;
  description?: string;
  classroomId: number;
}

export interface UpdateStudentRequestDto {
  name?: string;
  phoneNumber?: string;
  description?: string;
  status?: StudentStatus;
  classroomId?: number;
}

export interface StudentResponseDto {
  id?: number;
  name?: string;
  phoneNumber?: string;
  description?: string;
  classroomId?: number;
  classroomName?: string;
  status?: StudentStatus | string;
}

export type StudentListItemDto = StudentResponseDto;

export type StudentListResponseDto = StudentListItemDto[];
