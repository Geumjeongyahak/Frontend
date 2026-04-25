import authClient from "../client/authClient";
import type {
  CommentListPathParamsDto,
  CommentPathParamsDto,
  CommentResponseDto,
  CreateCommentRequestDto,
} from "./comment.dto";

// 특정 게시글의 댓글 목록을 조회하는 요청
export async function getComments(pathParams: CommentListPathParamsDto) {
  const response = await authClient.get<CommentResponseDto[]>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/comments`,
  );
  return response.data;
}

// 특정 게시글에 새 댓글을 생성하는 요청
export async function createComment(
  pathParams: CommentListPathParamsDto,
  body: CreateCommentRequestDto,
) {
  const response = await authClient.post<CommentResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/comments`,
    body,
  );
  return response.data;
}

// 특정 게시글의 특정 댓글을 삭제하는 요청
export async function deleteComment(pathParams: CommentPathParamsDto) {
  await authClient.delete(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/comments/${pathParams.commentId}`,
  );
}
