"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { addNotificationRecord } from "@/pwa/lib/notificationStore";
import { syncPushSubscription } from "@/pwa/lib/pushNotifications";

const PUSH_SW_URL = "/sw.js";

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

export default function MobileBootstrap() {
  const { status } = useAuthSession();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register(PUSH_SW_URL).catch(() => undefined);
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

    let unsubscribeOnMessage: (() => void) | undefined;

    syncPushSubscription({
      onMessageReceived: (payload) => {
        addNotificationRecord(buildNotificationRecord(payload));
      },
    })
      .then((cleanup) => {
        if (cancelled) {
          cleanup?.();
          return;
        }

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
