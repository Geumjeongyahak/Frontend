import authClient from "../client/authClient";
import publicClient from "../client/publicClient";
import type {
  SiteContentClassPathParamsDto,
  SiteContentClassesResponseDto,
  SiteContentClassResponseDto,
  SiteContentDepartmentPathParamsDto,
  SiteContentDepartmentResponseDto,
  SiteContentDepartmentsResponseDto,
  SiteHistoriesResponseDto,
  SiteHistoryPathParamsDto,
  SiteHistoryResponseDto,
  UpsertSiteContentClassRequestDto,
  UpsertSiteContentDepartmentRequestDto,
  UpsertSiteHistoryRequestDto,
} from "./siteContent.dto";

// 공개 연혁 콘텐츠를 조회하는 요청
export async function getHistories() {
  const response = await publicClient.get<SiteHistoriesResponseDto>(
    "/api/v1/site-contents/history",
  );
  return response.data;
}

// 관리자 권한으로 연혁 항목을 생성하는 요청
export async function createHistory(body: UpsertSiteHistoryRequestDto) {
  const response = await authClient.post<SiteHistoryResponseDto>(
    "/api/v1/site-contents/history",
    body,
  );
  return response.data;
}

// 관리자 권한으로 연혁 항목을 수정하는 요청
export async function updateHistory(
  pathParams: SiteHistoryPathParamsDto,
  body: UpsertSiteHistoryRequestDto,
) {
  const response = await authClient.put<SiteHistoryResponseDto>(
    `/api/v1/site-contents/history/${pathParams.historyId}`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 연혁 항목을 삭제하는 요청
export async function deleteHistory(pathParams: SiteHistoryPathParamsDto) {
  await authClient.delete(`/api/v1/site-contents/history/${pathParams.historyId}`);
}

// 공개 부서 소개 콘텐츠를 조회하는 요청
export async function getDepartmentInfos() {
  const response = await publicClient.get<SiteContentDepartmentsResponseDto>(
    "/api/v1/site-contents/departments",
  );
  return response.data;
}

// 관리자 권한으로 부서 소개 항목을 생성하는 요청
export async function createDepartmentInfo(body: UpsertSiteContentDepartmentRequestDto) {
  const response = await authClient.post<SiteContentDepartmentResponseDto>(
    "/api/v1/site-contents/departments",
    body,
  );
  return response.data;
}

// 관리자 권한으로 부서 소개 항목을 수정하는 요청
export async function updateDepartmentInfo(
  pathParams: SiteContentDepartmentPathParamsDto,
  body: UpsertSiteContentDepartmentRequestDto,
) {
  const response = await authClient.put<SiteContentDepartmentResponseDto>(
    `/api/v1/site-contents/departments/${pathParams.departmentInfoId}`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 부서 소개 항목을 삭제하는 요청
export async function deleteDepartmentInfo(pathParams: SiteContentDepartmentPathParamsDto) {
  await authClient.delete(
    `/api/v1/site-contents/departments/${pathParams.departmentInfoId}`,
  );
}

// 공개 반 소개 콘텐츠를 조회하는 요청
export async function getClassInfos() {
  const response = await publicClient.get<SiteContentClassesResponseDto>(
    "/api/v1/site-contents/classes",
  );
  return response.data;
}

// 관리자 권한으로 반 소개 항목을 생성하는 요청
export async function createClassInfo(body: UpsertSiteContentClassRequestDto) {
  const response = await authClient.post<SiteContentClassResponseDto>(
    "/api/v1/site-contents/classes",
    body,
  );
  return response.data;
}

// 관리자 권한으로 반 소개 항목을 수정하는 요청
export async function updateClassInfo(
  pathParams: SiteContentClassPathParamsDto,
  body: UpsertSiteContentClassRequestDto,
) {
  const response = await authClient.put<SiteContentClassResponseDto>(
    `/api/v1/site-contents/classes/${pathParams.classInfoId}`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 반 소개 항목을 삭제하는 요청
export async function deleteClassInfo(pathParams: SiteContentClassPathParamsDto) {
  await authClient.delete(`/api/v1/site-contents/classes/${pathParams.classInfoId}`);
}
