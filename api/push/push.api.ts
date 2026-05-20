import authClient from "../client/authClient";
import type {
  PushSubscriptionPathParamsDto,
  PushSubscriptionResponseDto,
  SubscribePushRequestDto,
} from "./push.dto";

// Push 알림 구독을 등록하는 요청
export async function subscribePush(body: SubscribePushRequestDto) {
  const response = await authClient.post<PushSubscriptionResponseDto>(
    "/api/v1/push/subscriptions",
    body,
  );

  return response.data;
}

// Push 알림 구독을 해지하는 요청
export async function unsubscribePush(pathParams: PushSubscriptionPathParamsDto) {
  await authClient.delete(`/api/v1/push/subscriptions/${pathParams.subscriptionId}`);
}
