import type { ChannelType } from "../channel/channel.dto";

export type PostType = "NOTICE" | "GENERAL" | "EVENT" | string;
export type PostStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED" | string;

export interface PostListQueryParamsDto {
  author?: string;
  title?: string;
  content?: string;
  status?: PostStatus;
  channelId?: number;
  channelType?: ChannelType;
  classroomId?: number;
  departmentId?: number;
  isPinned?: boolean;
  page?: number;
  size?: number;
}

export type ChannelPostListQueryParamsDto = Omit<PostListQueryParamsDto, "channelId">;

export interface CreatePostRequestDto {
  title: string;
  contentHtml: string;
  status?: PostStatus;
  isPinned?: boolean;
  allowComment?: boolean;
  thumbnailUrl?: string;
}

export interface UpdatePostRequestDto {
  title?: string;
  contentHtml?: string;
  status?: PostStatus;
  allowComment?: boolean;
  thumbnailUrl?: string;
}

export interface PublishPostRequestDto {
  title: string;
  contentHtml: string;
  allowComment?: boolean;
  thumbnailUrl?: string;
}

export interface SaveDraftRequestDto {
  title?: string;
  contentHtml?: string;
  allowComment?: boolean;
  thumbnailUrl?: string;
}

export interface PinPostRequestDto {
  isPinned: boolean;
}

export interface AttachPostFileRequestDto {
  fileId: string;
  sortOrder?: number;
}

export interface PostAttachmentInfoDto {
  fileId?: string;
  originalName?: string;
  contentType?: string;
  fileSize?: number;
  ext?: string;
  downloadUrl?: string;
  url?: string;
  sortOrder?: number;
}

export interface PostSummaryResponseDto {
  id?: number;
  channelId?: number;
  channelName?: string;
  channelType?: ChannelType;
  title?: string;
  // Legacy mock/UI field. The backend now exposes post status and channelType instead.
  postType?: PostType;
  status?: PostStatus;
  authorId?: number;
  authorName?: string;
  isPinned?: boolean;
  viewCount?: number;
  thumbnailUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostDetailResponseDto extends PostSummaryResponseDto {
  contentHtml?: string;
  allowComment?: boolean;
  expiresAt?: string | null;
  attachments?: PostAttachmentInfoDto[];
}

export interface PostListResponseDto {
  content?: PostSummaryResponseDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface ChannelPathParamsDto {
  channelId: number;
}

export interface PostPathParamsDto extends ChannelPathParamsDto {
  postId: number;
}
