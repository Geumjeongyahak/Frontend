export type ChannelType = "NOTICE" | "CLASSROOM" | "DEPARTMENT" | "CUSTOM" | string;

export type ChannelBindingType = "STANDALONE" | "DOMAIN_LINKED" | string;
export type ChannelAccessLevel = "CLOSED" | "READ_ONLY" | "READ_COMMENT" | "READ_WRITE" | string;

export interface ChannelListQueryParamsDto {
  name?: string;
  channelType?: ChannelType;
  bindingType?: ChannelBindingType;
  isActive?: boolean;
  isDefault?: boolean;
  classroomId?: number;
  departmentId?: number;
  sort?: string;
}

export interface CreateChannelRequestDto {
  name: string;
  description?: string;
  accessLevel: ChannelAccessLevel;
  allowGuestRead?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateChannelRequestDto {
  name?: string;
  description?: string;
  accessLevel?: ChannelAccessLevel;
  allowGuestRead?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ChannelResponseDto {
  id?: number;
  name?: string;
  description?: string;
  channelType?: ChannelType;
  bindingType?: ChannelBindingType;
  refId?: number | null;
  accessLevel?: ChannelAccessLevel;
  allowGuestRead?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
  lastPostedAt?: string | null;
}

export type ChannelListItemDto = ChannelResponseDto;

export interface ChannelPathParamsDto {
  id: number;
}
