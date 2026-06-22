"use client";

import styled from "styled-components";
import { getClassIconSrc, getClassTone } from "@/pwa/pages/mobile-home/utils";

type ClassBadgeIconProps = {
  classroomName?: string;
  size?: string;
};

export default function ClassBadgeIcon({
  classroomName,
  size = "18vw",
}: ClassBadgeIconProps) {
  const src = getClassIconSrc(classroomName);
  const tone = getClassTone(classroomName);

  if (!src) {
    return <FallbackBadge $size={size} $accent={tone.accent} aria-hidden="true" />;
  }

  return <IconImage src={src} alt="" $size={size} aria-hidden="true" />;
}

const IconImage = styled.img<{ $size: string }>`
  display: block;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  object-fit: contain;
`;

const FallbackBadge = styled.span<{ $size: string; $accent: string }>`
  display: inline-flex;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background: ${({ $accent }) => $accent};
`;
