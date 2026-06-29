import { describe, expect, it } from "vitest";
import { shouldRequestNotificationPermission } from "./notificationPermission";

describe("shouldRequestNotificationPermission", () => {
  it("requests browser permission when Firebase app config exists even without a VAPID key", () => {
    expect(
      shouldRequestNotificationPermission(
        {
          apiKey: "api-key",
          authDomain: "example.firebaseapp.com",
          projectId: "example",
          storageBucket: "example.firebasestorage.app",
          messagingSenderId: "123",
          appId: "app-id",
        },
        "default",
      ),
    ).toBe(true);
  });
});
