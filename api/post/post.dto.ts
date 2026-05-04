import type { ChannelType } from "../channel/channel.dto";

export type PostType = "NOTICE" | "GENERAL" | "EVENT" | string;
export type PostStatus = "PUBLISHED" | "DRAFT" | string;

export interface PostListQueryParamsDto {
  author?: string;
  title?: string;
  content?: string;
  postType?: PostType;
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
  postType: PostType;
  status?: PostStatus;
  isPinned?: boolean;
  allowComment?: boolean;
}

export interface UpdatePostRequestDto {
  title?: string;
  contentHtml?: string;
  postType?: PostType;
  status?: PostStatus;
  isPinned?: boolean;
  allowComment?: boolean;
}

export interface PostSummaryResponseDto {
  id?: number;
  channelId?: number;
  channelName?: string;
  channelType?: ChannelType;
  title?: string;
  postType?: PostType;
  status?: PostStatus;
  authorId?: number;
  authorName?: string;
  isPinned?: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostDetailResponseDto extends PostSummaryResponseDto {
  contentHtml?: string;
  allowComment?: boolean;
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
