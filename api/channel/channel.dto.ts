export type ChannelType = "ALL" | "CLASSROOM" | "DEPARTMENT" | "CUSTOM" | string;

export type ChannelWriterPolicy =
  | "ALL_AUTHENTICATED"
  | "ADMIN_MANAGER_ONLY"
  | "CLASSROOM_MANAGER_TEACHER_ONLY"
  | "DEPARTMENT_MEMBER_OR_ADMIN"
  | string;

export interface ChannelListQueryParamsDto {
  name?: string;
  channelType?: ChannelType;
  isActive?: boolean;
  isDefault?: boolean;
  classroomId?: number;
  departmentId?: number;
  sort?: string;
}

export interface CreateChannelRequestDto {
  name: string;
  slug: string;
  description?: string;
  channelType: ChannelType;
  classroomId?: number;
  departmentId?: number;
  customRefId?: number;
  writerPolicy?: ChannelWriterPolicy;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateChannelRequestDto {
  name?: string;
  slug?: string;
  description?: string;
  channelType?: ChannelType;
  classroomId?: number;
  departmentId?: number;
  customRefId?: number;
  writerPolicy?: ChannelWriterPolicy;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ChannelResponseDto {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  channelType?: ChannelType;
  classroomId?: number | null;
  departmentId?: number | null;
  customRefId?: number | null;
  writerPolicy?: ChannelWriterPolicy;
  isDefault?: boolean;
  isActive?: boolean;
  lastPostedAt?: string | null;
}

export type ChannelListItemDto = ChannelResponseDto;

export interface ChannelPathParamsDto {
  id: number;
}
