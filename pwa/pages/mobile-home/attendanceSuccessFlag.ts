"use client";

const ATTENDANCE_SUCCESS_FLAG_KEY = "mobile-home-attendance-success";

export type AttendanceSuccessOverlayVariant = "attendance" | "checkout";

export function markPendingAttendanceSuccessOverlay(
  variant: AttendanceSuccessOverlayVariant = "attendance",
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ATTENDANCE_SUCCESS_FLAG_KEY, variant);
}

export function consumePendingAttendanceSuccessOverlay() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(ATTENDANCE_SUCCESS_FLAG_KEY);
  const hasPendingFlag = value === "attendance" || value === "checkout";

  if (hasPendingFlag) {
    window.sessionStorage.removeItem(ATTENDANCE_SUCCESS_FLAG_KEY);
  }

  return hasPendingFlag ? value : null;
}
