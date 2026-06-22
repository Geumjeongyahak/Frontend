export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  category: string;
  targetUrl: string;
  receivedAt: string;
  read: boolean;
};

const STORAGE_KEY = "geumjeongyahak:pwa-notifications";
const CHANGE_EVENT = "geumjeongyahak:pwa-notifications-change";
const MAX_RECORD_COUNT = 50;

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function sortRecords(records: NotificationRecord[]) {
  return [...records].sort((a, b) => {
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });
}

function emitChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getNotificationRecords() {
  if (!canUseStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as NotificationRecord[];
    return Array.isArray(parsed) ? sortRecords(parsed) : [];
  } catch {
    return [];
  }
}

function saveNotificationRecords(records: NotificationRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(sortRecords(records).slice(0, MAX_RECORD_COUNT)),
  );
  emitChange();
}

export function addNotificationRecord(record: NotificationRecord) {
  const records = getNotificationRecords();
  const nextRecords = [record, ...records.filter((current) => current.id !== record.id)];
  saveNotificationRecords(nextRecords);
}

export function markAllNotificationsAsRead() {
  const records = getNotificationRecords();
  saveNotificationRecords(records.map((record) => ({ ...record, read: true })));
}

export function getUnreadNotificationCount() {
  return getNotificationRecords().filter((record) => !record.read).length;
}

export function subscribeNotificationStore(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
