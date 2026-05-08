import authClient from "../client/authClient";
import type {
  ChannelListQueryParamsDto,
  ChannelResponseDto,
  ChannelPathParamsDto,
  CreateChannelRequestDto,
  UpdateChannelRequestDto,
} from "./channel.dto";

// 채널 목록을 조회하는 요청
export async function getChannels(query?: ChannelListQueryParamsDto) {
  const response = await authClient.get<ChannelResponseDto[]>("/api/v1/channels", {
    params: query,
  });
  return response.data;
}

// 새 채널을 생성하는 요청
export async function createChannel(body: CreateChannelRequestDto) {
  const response = await authClient.post<ChannelResponseDto>("/api/v1/channels", body);
  return response.data;
}

// 특정 채널의 상세 정보를 조회하는 요청
export async function getChannel(pathParams: ChannelPathParamsDto) {
  const response = await authClient.get<ChannelResponseDto>(
    `/api/v1/channels/${pathParams.id}`,
  );
  return response.data;
}

// 특정 채널의 정보를 수정하는 요청
export async function updateChannel(
  pathParams: ChannelPathParamsDto,
  body: UpdateChannelRequestDto,
) {
  const response = await authClient.put<ChannelResponseDto>(
    `/api/v1/channels/${pathParams.id}`,
    body,
  );
  return response.data;
}

// 특정 채널을 삭제하는 요청
export async function deleteChannel(pathParams: ChannelPathParamsDto) {
  await authClient.delete(`/api/v1/channels/${pathParams.id}`);
}
