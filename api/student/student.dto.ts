export type StudentStatus = "ENROLLED" | "ON_LEAVE" | "COMPLETED";

export interface StudentListQueryParamsDto {
  name?: string;
  status?: StudentStatus;
  page?: number;
  size?: number;
}

export interface CreateStudentRequestDto {
  name: string;
  phoneNumber?: string;
  description?: string;
}

export interface UpdateStudentRequestDto {
  name?: string;
  phoneNumber?: string;
  description?: string;
  status?: StudentStatus;
}

export interface StudentResponseDto {
  id?: number;
  name?: string;
  phoneNumber?: string;
  description?: string;
  status?: StudentStatus | string;
}

export type StudentListItemDto = StudentResponseDto;

export interface StudentListResponseDto {
  content?: StudentListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface StudentPathParamsDto {
  studentId: number;
}
