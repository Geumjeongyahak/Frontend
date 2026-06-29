"use client";

const ATTENDANCE_SUCCESS_FLAG_KEY = "mobile-home-attendance-success";

export function markPendingAttendanceSuccessOverlay() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ATTENDANCE_SUCCESS_FLAG_KEY, "1");
}

export function consumePendingAttendanceSuccessOverlay() {
  if (typeof window === "undefined") {
    return false;
  }

  const hasPendingFlag = window.sessionStorage.getItem(ATTENDANCE_SUCCESS_FLAG_KEY) === "1";

  if (hasPendingFlag) {
    window.sessionStorage.removeItem(ATTENDANCE_SUCCESS_FLAG_KEY);
  }

  return hasPendingFlag;
}
