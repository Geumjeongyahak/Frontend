import type { AdminPushConfigResponseDto } from "../../api/push/push.dto";

export function hasFirebaseAppConfig(config: AdminPushConfigResponseDto) {
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId,
  );
}

export function shouldRequestNotificationPermission(
  config: AdminPushConfigResponseDto,
  permission: NotificationPermission,
) {
  return hasFirebaseAppConfig(config) && permission === "default";
}
