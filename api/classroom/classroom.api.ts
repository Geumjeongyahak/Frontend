import authClient from "../client/authClient";
import type {
  ClassroomDetailResponseDto,
  ClassroomListQueryParamsDto,
  ClassroomListResponseDto,
  ClassroomPathParamsDto,
  CreateClassroomRequestDto,
  UpdateClassroomRequestDto,
} from "./classroom.dto";

// 교실 목록을 조회하는 요청
export async function getClassrooms(query?: ClassroomListQueryParamsDto) {
  const response = await authClient.get<ClassroomListResponseDto>("/api/v1/classrooms", {
    params: query,
  });
  return response.data;
}

// 새 교실을 생성하는 요청
export async function createClassroom(body: CreateClassroomRequestDto) {
  const response = await authClient.post<ClassroomDetailResponseDto>("/api/v1/classrooms", body);
  return response.data;
}

// 특정 교실 상세 정보를 조회하는 요청
export async function getClassroomDetail(pathParams: ClassroomPathParamsDto) {
  const response = await authClient.get<ClassroomDetailResponseDto>(
    `/api/v1/classrooms/${pathParams.id}`,
  );
  return response.data;
}

// 특정 교실 정보를 수정하는 요청
export async function updateClassroom(
  pathParams: ClassroomPathParamsDto,
  body: UpdateClassroomRequestDto,
) {
  const response = await authClient.put<ClassroomDetailResponseDto>(
    `/api/v1/classrooms/${pathParams.id}`,
    body,
  );
  return response.data;
}

// 특정 교실을 삭제하는 요청
export async function deleteClassroom(pathParams: ClassroomPathParamsDto) {
  await authClient.delete(`/api/v1/classrooms/${pathParams.id}`);
}
