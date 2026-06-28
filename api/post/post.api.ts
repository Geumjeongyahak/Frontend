import authClient from "../client/authClient";
import publicClient from "../client/publicClient";
import type { FileUploadResponseDto } from "../file/file.dto";
import type {
  AttachPostFileRequestDto,
  CreatePostRequestDto,
  ChannelPathParamsDto,
  ChannelPostListQueryParamsDto,
  PostListQueryParamsDto,
  PostDetailResponseDto,
  PostListResponseDto,
  PostPathParamsDto,
  PinPostRequestDto,
  PublishPostRequestDto,
  SaveDraftRequestDto,
  UpdatePostRequestDto,
} from "./post.dto";

function createMultipartFormData(file: Blob, filename?: string) {
  const formData = new FormData();

  if (filename) {
    formData.append("file", file, filename);
  } else {
    formData.append("file", file);
  }

  return formData;
}

async function uploadPostMultipart(endpoint: string, file: Blob, filename?: string) {
  const response = await authClient.post<FileUploadResponseDto>(
    endpoint,
    createMultipartFormData(file, filename),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

// 전체 게시글 목록을 통합 조회하는 요청
export async function getPosts(query?: PostListQueryParamsDto) {
  const response = await authClient.get<PostListResponseDto>("/api/v1/posts", {
    params: query,
  });
  return response.data;
}

export async function getPublicPosts(query?: PostListQueryParamsDto) {
  const response = await publicClient.get<PostListResponseDto>("/api/v1/posts", {
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

export async function getPublicPost(pathParams: PostPathParamsDto) {
  const response = await publicClient.get<PostDetailResponseDto>(
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
  file: Blob,
  filename?: string,
) {
  return uploadPostMultipart(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/images`,
    file,
    filename,
  );
}

// files 테이블에 등록된 파일을 DRAFT 게시글 첨부로 연동하는 요청
export async function attachPostFile(
  pathParams: PostPathParamsDto,
  body: AttachPostFileRequestDto,
) {
  const response = await authClient.post<FileUploadResponseDto>(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/attachments`,
    body,
  );
  return response.data;
}

// 특정 게시글에 첨부파일을 연결하는 요청
export async function attachPostAttachment(
  pathParams: PostPathParamsDto,
  file: Blob,
  filename?: string,
) {
  return uploadPostMultipart(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/attachments`,
    file,
    filename,
  );
}

// 특정 게시글에서 첨부파일 연결을 제거하는 요청
export async function detachPostAttachment(pathParams: PostPathParamsDto & { fileId: string }) {
  await authClient.delete(
    `/api/v1/channels/${pathParams.channelId}/posts/${pathParams.postId}/attachments/${pathParams.fileId}`,
  );
}

// 기존 관리자 게시글 본문 이미지 업로드 경로를 호출하는 요청
export async function attachAdminPostImage(
  pathParams: PostPathParamsDto,
  file: Blob,
  filename?: string,
) {
  return uploadPostMultipart(
    `/admin/channel/${pathParams.channelId}/posts/${pathParams.postId}/images`,
    file,
    filename,
  );
}

// 기존 관리자 게시글 첨부파일 업로드 경로를 호출하는 요청
export async function attachAdminPostAttachment(
  pathParams: PostPathParamsDto,
  file: Blob,
  filename?: string,
) {
  return uploadPostMultipart(
    `/admin/channel/${pathParams.channelId}/posts/${pathParams.postId}/attachments`,
    file,
    filename,
  );
}

// 기존 관리자 게시글 첨부파일 연결 제거 경로를 호출하는 요청
export async function detachAdminPostAttachment(
  pathParams: PostPathParamsDto & { fileId: string },
) {
  await authClient.delete(
    `/admin/channel/${pathParams.channelId}/posts/${pathParams.postId}/attachments/${pathParams.fileId}`,
  );
}
