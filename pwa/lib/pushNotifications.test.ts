import "../../test/setup";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { subscribePush } from "../../api/push/push.api";

import { PUSH_TOKEN_STORAGE_KEY, syncPushSubscription } from "./pushNotifications";

vi.mock("../../api/push/push.api", () => ({
  getAdminPushConfig: vi.fn(async () => ({
    apiKey: "api-key",
    authDomain: "auth.example.com",
    projectId: "project-id",
    storageBucket: "bucket",
    messagingSenderId: "sender-id",
    appId: "app-id",
    vapidKey: "vapid-key",
  })),
  subscribePush: vi.fn(async () => ({ id: 1, active: true, deviceType: "WEB" })),
}));

vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({ name: "firebase-app" })),
}));

vi.mock("firebase/messaging", () => ({
  getMessaging: vi.fn(() => ({ name: "messaging" })),
  getToken: vi.fn(async () => "fcm-token"),
  isSupported: vi.fn(async () => true),
  onMessage: vi.fn(() => vi.fn()),
}));

function setNotification(permission: NotificationPermission, requestPermission = vi.fn()) {
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: {
      permission,
      requestPermission,
    },
  });
}

function setServiceWorker() {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      ready: Promise.resolve({
        active: {
          postMessage: vi.fn(),
        },
      }),
    },
  });
}

describe("syncPushSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setServiceWorker();
  });

  it("does not request browser permission during silent sync", async () => {
    const requestPermission = vi.fn();
    setNotification("default", requestPermission);

    await syncPushSubscription();

    expect(requestPermission).not.toHaveBeenCalled();
    expect(subscribePush).not.toHaveBeenCalled();
  });

  it("requests permission only when asked and subscribes a new token", async () => {
    const requestPermission = vi.fn(async () => "granted" as NotificationPermission);
    setNotification("default", requestPermission);

    await syncPushSubscription({ requestPermission: true });

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(subscribePush).toHaveBeenCalledWith({ token: "fcm-token", deviceType: "WEB" });
    expect(window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY)).toBe("fcm-token");
  });
});
