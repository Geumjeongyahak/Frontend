"use client";

import { useEffect } from "react";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
  onMessage,
} from "firebase/messaging";
import { getAdminPushConfig, subscribePush } from "@/api/push/push.api";
import type { AdminPushConfigResponseDto } from "@/api/push/push.dto";
import { useAuthSession } from "@/hooks/useAuthSession";
import { addNotificationRecord } from "@/pwa/lib/notificationStore";
import {
  hasFirebaseAppConfig,
  shouldRequestNotificationPermission,
} from "./notificationPermission";

const PUSH_TOKEN_STORAGE_KEY = "geumjeongyahak:pwa-push-token";
const PUSH_SW_URL = "/sw.js";
const FALLBACK_FIREBASE_CONFIG: AdminPushConfigResponseDto = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBYG96-_KCDAI8UHZ07XwUjG9jIWwHIHhs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "geumjeong-school.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "geumjeong-school",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "geumjeong-school.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "278017749414",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:278017749414:web:93b8511fc90b8483b5df67",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-4LXHE8V7VB",
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
};

type NotificationLikePayload = {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string | undefined>;
};

function buildNotificationRecord(payload: NotificationLikePayload) {
  return {
    id:
      payload.data?.notificationId ??
      payload.data?.messageId ??
      payload.data?.id ??
      `push-${Date.now()}`,
    title: payload.notification?.title ?? payload.data?.title ?? "새 알림",
    body: payload.notification?.body ?? payload.data?.body ?? "",
    category: payload.data?.category ?? payload.data?.type ?? "알림",
    targetUrl: payload.data?.targetUrl ?? payload.data?.url ?? "/notifications",
    receivedAt: payload.data?.receivedAt ?? new Date().toISOString(),
    read: false,
  };
}

function resolveFirebaseConfig(config?: AdminPushConfigResponseDto) {
  return {
    ...FALLBACK_FIREBASE_CONFIG,
    ...config,
    vapidKey: config?.vapidKey ?? FALLBACK_FIREBASE_CONFIG.vapidKey,
  };
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
    measurementId: config.measurementId,
  });
}

export default function MobileBootstrap() {
  const { status } = useAuthSession();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register(PUSH_SW_URL).catch(() => undefined);
  }, []);

  useEffect(() => {
    const config = resolveFirebaseConfig();
    if (!hasFirebaseAppConfig(config)) {
      return;
    }

    const app = getOrCreateFirebaseApp(config);
    isAnalyticsSupported()
      .then((supported) => {
        if (supported) {
          getAnalytics(app);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    function handleMessage(
      event: MessageEvent<{ type?: string; payload?: NotificationLikePayload }>,
    ) {
      if (event.data?.type !== "PWA_NOTIFICATION_RECEIVED" || !event.data.payload) {
        return;
      }

      addNotificationRecord(buildNotificationRecord(event.data.payload));
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    async function enablePush() {
      const supported = await isMessagingSupported().catch(() => false);
      if (!supported || !("serviceWorker" in navigator) || !("Notification" in window)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const config = resolveFirebaseConfig(await getAdminPushConfig().catch(() => undefined));

      if (!hasFirebaseAppConfig(config)) {
        return;
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
          measurementId: config.measurementId,
        },
      });

      const permission = shouldRequestNotificationPermission(config, Notification.permission)
        ? await Notification.requestPermission()
        : Notification.permission;

      if (cancelled || permission !== "granted") {
        return;
      }

      if (!config.vapidKey) {
        return;
      }

      const app = getOrCreateFirebaseApp(config);
      const messaging = getMessaging(app);

      const unsubscribe = onMessage(messaging, (payload) => {
        addNotificationRecord(buildNotificationRecord(payload));
      });

      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token || cancelled) {
        return;
      }

      const previousToken = window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (previousToken === token) {
        return;
      }

      await subscribePush({
        token,
        deviceType: "WEB",
      });
      window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

      return unsubscribe;
    }

    let unsubscribeOnMessage: (() => void) | undefined;

    enablePush()
      .then((cleanup) => {
        unsubscribeOnMessage = cleanup;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      unsubscribeOnMessage?.();
    };
  }, [status]);

  return null;
}
