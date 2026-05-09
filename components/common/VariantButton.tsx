"use client";

import styled from "styled-components";
import { radii, spacing, typography } from "@/styles/tokens";

export type ButtonVariant = "primary" | "danger" | "neutral";

export const Button = styled.button<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  border-radius: ${radii.radius12};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  background-color: ${({ $variant = "primary" }) => {
    switch ($variant) {
      case "danger":
        return "#fde4e2";
      case "neutral":
        return "#e4e4e4";
      case "primary":
      default:
        return "#88cd5a";
    }
  }};

  color: ${({ $variant = "primary" }) => {
    switch ($variant) {
      case "danger":
        return "#da3a30";
      case "neutral":
        return "#000000";
      case "primary":
      default:
        return "#ffffff";
    }
  }};

  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;
