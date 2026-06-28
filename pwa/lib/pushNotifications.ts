import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import type { MessagePayload } from "firebase/messaging";
import { getAdminPushConfig, subscribePush } from "../../api/push/push.api";
import type { AdminPushConfigResponseDto } from "../../api/push/push.dto";

export const PUSH_TOKEN_STORAGE_KEY = "geumjeongyahak:pwa-push-token";

type SyncPushSubscriptionOptions = {
  requestPermission?: boolean;
  onMessageReceived?: (payload: MessagePayload) => void;
};

function hasFirebaseConfig(config: AdminPushConfigResponseDto) {
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId &&
      config.vapidKey,
  );
}

function getOrCreateFirebaseApp(config: AdminPushConfigResponseDto) {
  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  return initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
}

export async function syncPushSubscription({
  requestPermission = false,
  onMessageReceived,
}: SyncPushSubscriptionOptions = {}) {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("Notification" in window)
  ) {
    return undefined;
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return undefined;
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : requestPermission
        ? await Notification.requestPermission()
        : Notification.permission;

  if (permission !== "granted") {
    return undefined;
  }

  const registration = await navigator.serviceWorker.ready;
  const config = await getAdminPushConfig();

  if (!hasFirebaseConfig(config) || !config.vapidKey) {
    return undefined;
  }

  registration.active?.postMessage({
    type: "SET_FIREBASE_CONFIG",
    payload: {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    },
  });

  const app = getOrCreateFirebaseApp(config);
  const messaging = getMessaging(app);
  const unsubscribe = onMessageReceived ? onMessage(messaging, onMessageReceived) : undefined;
  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    return unsubscribe;
  }

  const previousToken = window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  if (previousToken !== token) {
    await subscribePush({ token, deviceType: "WEB" });
    window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  }

  return unsubscribe;
}
