"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AttendanceSuccessOverlayVariant } from "@/pwa/pages/mobile-home/attendanceSuccessFlag";

const POPUP_DURATION_MS = 2200;

export function useAttendanceSuccessPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [variant, setVariant] = useState<AttendanceSuccessOverlayVariant>("attendance");
  const timeoutRef = useRef<number | null>(null);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const show = useCallback((nextVariant: AttendanceSuccessOverlayVariant = "attendance") => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setVariant(nextVariant);
    setIsVisible(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
      timeoutRef.current = null;
    }, POPUP_DURATION_MS);
  }, []);

  useEffect(() => hide, [hide]);

  return {
    isVisible,
    variant,
    show,
    hide,
  };
}
