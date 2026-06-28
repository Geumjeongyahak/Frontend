"use client";

import styled, { css } from "styled-components";
import { colors, radii, typography } from "@/styles/tokens";
import { normalizeRequestStatusTone, type RequestStatusTone } from "@/utils/formatRequestStatus";

type RequestStatusBadgeProps = {
  label: string;
  status?: string;
};

export default function RequestStatusBadge({ label, status }: RequestStatusBadgeProps) {
  const tone = normalizeRequestStatusTone(status) as RequestStatusTone;

  return <Badge $tone={tone}>{label}</Badge>;
}

const Badge = styled.span<{ $tone: RequestStatusTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0 0.75rem;
  border-radius: ${radii.radius999};
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: 1;

  ${({ $tone }) =>
    $tone === "APPROVED"
      ? css`
          background: ${colors.pointSoft};
          color: #4f8f27;
        `
      : $tone === "REJECTED"
        ? css`
            background: ${colors.noticeSoft};
            color: ${colors.notice};
          `
        : css`
            background: #efefef;
            color: #5d5d5d;
          `}
`;
