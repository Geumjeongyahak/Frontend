"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POPUP_DURATION_MS = 2200;

export function useAttendanceSuccessPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const show = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsVisible(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
      timeoutRef.current = null;
    }, POPUP_DURATION_MS);
  }, []);

  useEffect(() => hide, [hide]);

  return {
    isVisible,
    show,
    hide,
  };
}
