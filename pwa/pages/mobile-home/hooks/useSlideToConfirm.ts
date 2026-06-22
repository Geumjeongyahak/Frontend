"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MOBILE_HOME_SLIDER_THRESHOLD } from "@/pwa/pages/mobile-home/constants";

type UseSlideToConfirmOptions = {
  disabled: boolean;
  onConfirm: (controls: { reset: () => void }) => void;
};

const KNOB_SIZE_PX = 48;

export function useSlideToConfirm({ disabled, onConfirm }: UseSlideToConfirmOptions) {
  const trackRef = useRef<HTMLButtonElement | null>(null);
  const progressRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const updateProgress = useCallback((nextProgress: number) => {
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  const updateProgressFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const rect = track.getBoundingClientRect();
      const nextProgress = Math.min(
        1,
        Math.max(0, (clientX - rect.left - KNOB_SIZE_PX / 2) / (rect.width - KNOB_SIZE_PX)),
      );

      updateProgress(nextProgress);
    },
    [updateProgress],
  );

  const reset = useCallback(() => {
    activePointerIdRef.current = null;
    updateProgress(0);
    setIsDragging(false);
  }, [updateProgress]);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

      event.preventDefault();
      activePointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateProgressFromClientX(event.clientX);
    setIsDragging(true);
    },
    [disabled, updateProgressFromClientX],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      updateProgressFromClientX(event.clientX);
    }

    function finishDrag(event: PointerEvent) {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      activePointerIdRef.current = null;
      setIsDragging(false);

      if (progressRef.current < MOBILE_HOME_SLIDER_THRESHOLD) {
        updateProgress(0);
        return;
      }

      onConfirm({ reset });
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [isDragging, onConfirm, reset, updateProgress, updateProgressFromClientX]);

  return {
    trackRef,
    progress,
    isDragging,
    startDrag,
    reset,
  };
}
