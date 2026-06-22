"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotificationRecords,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  subscribeNotificationStore,
  type NotificationRecord,
} from "@/pwa/lib/notificationStore";

type NotificationInboxState = {
  notifications: NotificationRecord[];
  unreadCount: number;
};

function readInbox(): NotificationInboxState {
  return {
    notifications: getNotificationRecords(),
    unreadCount: getUnreadNotificationCount(),
  };
}

export function useNotificationInbox() {
  const [state, setState] = useState<NotificationInboxState>(() => readInbox());

  useEffect(() => {
    return subscribeNotificationStore(() => {
      setState(readInbox());
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
    setState(readInbox());
  }, []);

  return {
    ...state,
    markAllAsRead,
  };
}
