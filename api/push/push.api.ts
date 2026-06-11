import authClient from "../client/authClient";
import type {
  AdminPushConfigResponseDto,
  AdminPushDiagnosticRequestDto,
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

// 관리자 Push 설정을 조회하는 요청
export async function getAdminPushConfig() {
  const response = await authClient.get<AdminPushConfigResponseDto>("/admin/push/config");
  return response.data;
}

// 관리자 Push 진단 정보를 전송하는 요청
export async function sendAdminPushDiagnostics(body: AdminPushDiagnosticRequestDto) {
  await authClient.post("/admin/push/diagnostics", body);
}

// 관리자 Push 알림 구독을 등록하는 요청
export async function subscribeAdminPush(body: SubscribePushRequestDto) {
  const response = await authClient.post<PushSubscriptionResponseDto>(
    "/admin/push/subscriptions",
    body,
  );

  return response.data;
}

// 관리자 Push 알림 구독을 해지하는 요청
export async function unsubscribeAdminPush(pathParams: PushSubscriptionPathParamsDto) {
  await authClient.delete(`/admin/push/subscriptions/${pathParams.subscriptionId}`);
}
