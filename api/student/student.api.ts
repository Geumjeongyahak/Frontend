import authClient from "../client/authClient";
import type {
  CreateStudentRequestDto,
  StudentListQueryParamsDto,
  StudentListResponseDto,
  StudentPathParamsDto,
  StudentResponseDto,
  UpdateStudentRequestDto,
} from "./student.dto";

// 학생 목록을 조회하는 요청
export async function getStudents(queryParams?: StudentListQueryParamsDto) {
  const response = await authClient.get<StudentListResponseDto>("/api/v1/students", {
    params: queryParams,
  });
  return response.data;
}

// 새 학생을 생성하는 요청
export async function createStudent(body: CreateStudentRequestDto) {
  const response = await authClient.post<StudentResponseDto>("/api/v1/students", body);
  return response.data;
}

// 특정 학생 상세 정보를 조회하는 요청
export async function getStudentDetail(pathParams: StudentPathParamsDto) {
  const response = await authClient.get<StudentResponseDto>(
    `/api/v1/students/${pathParams.studentId}`,
  );
  return response.data;
}

// 특정 학생 정보를 수정하는 요청
export async function updateStudent(
  pathParams: StudentPathParamsDto,
  body: UpdateStudentRequestDto,
) {
  const response = await authClient.patch<StudentResponseDto>(
    `/api/v1/students/${pathParams.studentId}`,
    body,
  );
  return response.data;
}

// 특정 학생을 삭제하는 요청
export async function deleteStudent(pathParams: StudentPathParamsDto) {
  await authClient.delete(`/api/v1/students/${pathParams.studentId}`);
}
