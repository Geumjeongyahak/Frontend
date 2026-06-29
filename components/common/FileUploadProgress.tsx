"use client";

import styled, { keyframes } from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type FileUploadProgressNoticeProps = {
  message?: string;
};

export function FileUploadProgressNotice({
  message = "파일 업로드 중...",
}: FileUploadProgressNoticeProps) {
  return (
    <Notice role="status" aria-live="polite">
      <Spinner aria-hidden="true" />
      <span>{message}</span>
    </Notice>
  );
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Notice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  color: ${colors.placeholder};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    font-size: ${typography.fontSize20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;

const Spinner = styled.span`
  width: 1rem;
  height: 1rem;
  border: 2px solid ${colors.border};
  border-top-color: ${colors.point};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  flex-shrink: 0;

  @media (min-width: 120rem) {
    width: 1.25rem;
    height: 1.25rem;
  }
`;
