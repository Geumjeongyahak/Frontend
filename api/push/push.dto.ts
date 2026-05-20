export interface PushSubscriptionKeysDto {
  p256dh: string;
  auth: string;
}

export interface SubscribePushRequestDto {
  endpoint: string;
  keys: PushSubscriptionKeysDto;
}

export interface PushSubscriptionResponseDto {
  id?: number;
  endpoint?: string;
  createdAt?: string;
}

export interface PushSubscriptionPathParamsDto {
  subscriptionId: number;
}
