export type CommentStatus = "ACTIVE" | "DELETED" | string;

export interface CreateCommentRequestDto {
  content: string;
  parentCommentId?: number;
}

export interface CommentResponseDto {
  id?: number;
  postId?: number;
  parentCommentId?: number | null;
  authorId?: number;
  authorName?: string;
  content?: string;
  status?: CommentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentListPathParamsDto {
  channelId: number;
  postId: number;
}

export interface CommentPathParamsDto extends CommentListPathParamsDto {
  commentId: number;
}
