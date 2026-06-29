"use client";

import styled, { keyframes } from "styled-components";
import { mobileHomeTone } from "@/pwa/pages/mobile-home/constants";

type AttendanceSuccessOverlayProps = {
  variant: "attendance" | "checkout";
};

export default function AttendanceSuccessOverlay({
  variant,
}: AttendanceSuccessOverlayProps) {
  return (
    <Overlay>
      <OverlayImage src="/check-hole-overlay.svg" alt="" aria-hidden="true" />
      <OverlayText>{variant === "checkout" ? "퇴근 완료!" : "출근 완료!"}</OverlayText>
    </Overlay>
  );
}

const fadeOut = keyframes`
  0% {
    opacity: 0;
  }

  12% {
    opacity: 1;
  }

  82% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 1.25rem;
  background: rgba(0, 0, 0, 0.42);
  animation: ${fadeOut} 2.2s ease forwards;
  pointer-events: none;
`;

const OverlayImage = styled.img`
  display: block;
  width: min(42vw, 10.5rem);
  height: auto;
`;

const OverlayText = styled.p`
  color: ${mobileHomeTone.white};
  font-size: clamp(1.75rem, 8vw, 2.25rem);
  font-weight: 800;
`;
