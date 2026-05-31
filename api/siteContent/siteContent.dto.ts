export interface SiteHistoryPhotoRequestDto {
  url: string;
  alt?: string;
}

export interface SiteHistoryPhotoResponseDto {
  id?: number;
  url?: string;
  alt?: string;
}

export interface SiteHistoryResponseDto {
  id?: number;
  title?: string;
  detail?: string;
  linkLabel?: string;
  linkHref?: string;
  photos?: SiteHistoryPhotoResponseDto[];
}

export interface SiteHistoriesResponseDto {
  history?: SiteHistoryResponseDto[];
}

export interface UpsertSiteHistoryRequestDto {
  title: string;
  detail?: string;
  linkLabel?: string;
  linkHref?: string;
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
