// This file must remain under public/ because the service worker path is URL-bound.
const FIREBASE_COMPAT_APP_URL =
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js";
const FIREBASE_COMPAT_MESSAGING_URL =
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js";

let firebaseConfig = null;
let messagingInstance = null;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_FIREBASE_CONFIG") {
    firebaseConfig = event.data.payload;
    setupFirebaseMessaging();
  }
});

function setupFirebaseMessaging() {
  if (!firebaseConfig || messagingInstance || !self.importScripts) {
    return;
  }

  try {
    self.importScripts(FIREBASE_COMPAT_APP_URL, FIREBASE_COMPAT_MESSAGING_URL);

    if (!self.firebase?.apps?.length) {
      self.firebase.initializeApp(firebaseConfig);
    }

    messagingInstance = self.firebase.messaging();
    messagingInstance.onBackgroundMessage((payload) => {
      handleIncomingNotification(payload);
    });
  } catch {
    messagingInstance = null;
  }
}

function buildNotificationPayload(payload) {
  const title = payload?.notification?.title ?? payload?.data?.title ?? "새 알림";
  const body = payload?.notification?.body ?? payload?.data?.body ?? "";

  return {
    notification: {
      title,
      body,
    },
    data: {
      notificationId: payload?.data?.notificationId ?? payload?.data?.messageId ?? `sw-${Date.now()}`,
      category: payload?.data?.category ?? payload?.data?.type ?? "알림",
      url: payload?.data?.targetUrl ?? payload?.data?.url ?? "/notifications",
      receivedAt: payload?.data?.receivedAt ?? new Date().toISOString(),
      ...payload?.data,
    },
  };
}

async function broadcastNotification(payload) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  clients.forEach((client) => {
    client.postMessage({
      type: "PWA_NOTIFICATION_RECEIVED",
      payload,
    });
  });
}

async function handleIncomingNotification(rawPayload) {
  const payload = buildNotificationPayload(rawPayload);

  await self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon",
    badge: "/icon",
    data: payload.data,
  });

  await broadcastNotification(payload);
}

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  try {
    const payload = event.data.json();
    event.waitUntil(handleIncomingNotification(payload));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      handleIncomingNotification({
        notification: {
          title: "새 알림",
          body: text,
        },
      }),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/notifications";
  event.waitUntil(self.clients.openWindow(targetUrl));
});
