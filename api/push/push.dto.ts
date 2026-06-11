export type PushDeviceType = "WEB" | "ANDROID" | "IOS";

export interface SubscribePushRequestDto {
  token: string;
  deviceType: PushDeviceType;
}

export interface PushSubscriptionResponseDto {
  id?: number;
  userId?: number;
  deviceType?: PushDeviceType;
  active?: boolean;
  subscribedAt?: string;
  unsubscribedAt?: string | null;
  lastUsedAt?: string | null;
  failureCount?: number;
}

export interface PushSubscriptionPathParamsDto {
  subscriptionId: number;
}

export interface AdminPushConfigResponseDto {
  enabled?: boolean;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  vapidKey?: string;
}

export interface AdminPushDiagnosticRequestDto {
  step?: string;
  message?: string;
}
