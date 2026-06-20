export interface SiteHistoryLinkRequestDto {
  label: string;
  href: string;
}

export interface SiteHistoryLinkResponseDto {
  id?: number;
  label?: string;
  href?: string;
}

export interface SiteHistoryPhotoRequestDto {
  id?: number;
  fileId?: string;
  src: string;
  alt?: string;
}

export interface SiteHistoryPhotoResponseDto {
  id?: number;
  src?: string;
  alt?: string;
}

export interface SiteHistoryResponseDto {
  id?: number;
  title?: string;
  historyDate?: string;
  detail?: string;
  links?: SiteHistoryLinkResponseDto[];
  photos?: SiteHistoryPhotoResponseDto[];
}

export interface SiteHistoriesResponseDto {
  history?: SiteHistoryResponseDto[];
}

export interface UpsertSiteHistoryRequestDto {
  title: string;
  historyDate: string;
  detail?: string;
  links?: SiteHistoryLinkRequestDto[];
  photos?: SiteHistoryPhotoRequestDto[];
}

export interface SiteContentDepartmentResponseDto {
  id?: number;
  title?: string;
  name?: string;
  responsibilities?: string[];
}

export interface SiteContentDepartmentsResponseDto {
  principal?: SiteContentDepartmentResponseDto | null;
  departments?: SiteContentDepartmentResponseDto[];
}

export interface UpsertSiteContentDepartmentRequestDto {
  title: string;
  name?: string;
  responsibilities?: string[];
}

export interface SiteContentClassResponseDto {
  id?: number;
  name?: string;
  description?: string[];
}

export interface SiteContentClassesResponseDto {
  weekday?: SiteContentClassResponseDto[];
  weekendMorning?: SiteContentClassResponseDto[];
  weekendAfternoon?: SiteContentClassResponseDto[];
}

export interface UpsertSiteContentClassRequestDto {
  name: string;
  groupId: string;
  description?: string[];
}

export interface SiteHistoryPathParamsDto {
  historyId: number;
}

export interface SiteContentDepartmentPathParamsDto {
  departmentInfoId: number;
}

export interface SiteContentClassPathParamsDto {
  classInfoId: number;
}
