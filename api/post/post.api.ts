import authClient from "../client/authClient";
import type {
  ChannelPathParamsDto,
  ChannelPostListQueryParamsDto,
  AttachPostFileRequestDto,
  CreatePostRequestDto,
  PostListQueryParamsDto,
  PostDetailResponseDto,
  PostListResponseDto,
  PostPathParamsDto,
  PinPostRequestDto,
  PublishPostRequestDto,
  SaveDraftRequestDto,
  UpdatePostRequestDto,
} from "./post.dto";

// 전체 게시글 목록을 통합 조회하는 요청
export async function getPosts(query?: PostListQueryParamsDto) {
  const response = await authClient.get<PostListResponseDto>("/api/v1/posts", {
    params: query,
  });
  return response.data;
}

// 특정 채널의 게시글 목록을 조회하는 요청
export async function getChannelPosts(
  pathParams: ChannelPathParamsDto,
  query?: ChannelPostListQueryParamsDto,
) {
  const response = await authClient.get<PostListResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts`,
    {
      params: query,
    },
  );
  return response.data;
}

// 특정 채널에 새 게시글을 생성하는 요청
export async function createPost(pathParams: ChannelPathParamsDto, body: CreatePostRequestDto) {
  const response = await authClient.post<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts`,
    body,
  );
  return response.data;
}

// 특정 채널의 특정 게시글 상세 정보를 조회하는 요청
export async function getPost(pathParams: PostPathParamsDto) {
  const response = await authClient.get<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}`,
  );
  return response.data;
}

// 특정 채널의 특정 게시글을 수정하는 요청
export async function updatePost(pathParams: PostPathParamsDto, body: UpdatePostRequestDto) {
  const response = await authClient.put<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}`,
    body,
  );
  return response.data;
}

// 특정 채널의 특정 게시글을 삭제하는 요청
export async function deletePost(pathParams: PostPathParamsDto) {
  await authClient.delete(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}`,
  );
}

// 특정 채널에 초안 게시글을 생성하는 요청
export async function createDraft(pathParams: ChannelPathParamsDto) {
  const response = await authClient.post<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/drafts`,
  );
  return response.data;
}

// 현재 사용자의 특정 채널 초안 목록을 조회하는 요청
export async function getMyDrafts(pathParams: ChannelPathParamsDto) {
  const response = await authClient.get<PostListResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/me/drafts`,
  );
  return response.data;
}

// 특정 초안 게시글을 임시 저장하는 요청
export async function saveDraft(pathParams: PostPathParamsDto, body: SaveDraftRequestDto) {
  const response = await authClient.put<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/draft`,
    body,
  );
  return response.data;
}

// 특정 초안 게시글을 발행하는 요청
export async function publishPost(pathParams: PostPathParamsDto, body: PublishPostRequestDto) {
  const response = await authClient.put<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/publish`,
    body,
  );
  return response.data;
}

// 특정 게시글의 상단 고정 여부를 변경하는 요청
export async function pinPost(pathParams: PostPathParamsDto, body: PinPostRequestDto) {
  const response = await authClient.put<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/pin`,
    body,
  );
  return response.data;
}

// 특정 게시글에 본문 이미지를 연결하는 요청
export async function attachPostImage(
  pathParams: PostPathParamsDto,
  body: AttachPostFileRequestDto,
) {
  const response = await authClient.post<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/images`,
    body,
  );
  return response.data;
}

// 특정 게시글에 첨부파일을 연결하는 요청
export async function attachPostAttachment(
  pathParams: PostPathParamsDto,
  body: AttachPostFileRequestDto,
) {
  const response = await authClient.post<PostDetailResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/attachments`,
    body,
  );
  return response.data;
}

// 특정 게시글에서 첨부파일 연결을 제거하는 요청
export async function detachPostAttachment(pathParams: PostPathParamsDto & { fileId: string }) {
  await authClient.delete(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/attachments/${pathParams.fileId}`,
  );
}
