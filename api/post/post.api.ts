import authClient from "../client/authClient";
import type {
  ChannelPathParamsDto,
  ChannelPostListQueryParamsDto,
  CreatePostRequestDto,
  PostListQueryParamsDto,
  PostDetailResponseDto,
  PostListResponseDto,
  PostPathParamsDto,
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
