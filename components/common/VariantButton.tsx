"use client";

import styled from "styled-components";
import { colors, radii, spacing, typography } from "@/styles/tokens";

export type ButtonVariant = "primary" | "danger" | "neutral" | "edit";

export const Button = styled.button<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border-radius: ${radii.radius15};

  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  cursor: pointer;

  border: 1px solid
    ${({ $variant = "primary" }) => {
      switch ($variant) {
        case "danger":
          return "#da3a30";

        case "edit":
          return "#88cd5a";

        case "neutral":
          return colors.border;

        default:
          return "transparent";
      }
    }};

  background-color: ${({ $variant = "primary" }) => {
    switch ($variant) {
      case "danger":
      case "edit":
        return "#ffffff";

      case "neutral":
        return colors.background;

      case "primary":
      default:
        return "#88cd5a";
    }
  }};

  color: ${({ $variant = "primary" }) => {
    switch ($variant) {
      case "danger":
        return "#da3a30";

      case "edit":
        return "#88cd5a";

      case "neutral":
        return colors.text;

      case "primary":
      default:
        return "#ffffff";
    }
  }};

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: ${({ $variant = "primary" }) => {
      switch ($variant) {
        case "danger":
          return colors.noticeSoft;

        case "edit":
          return colors.pointSoft;

        case "neutral":
          return colors.border;

        case "primary":
        default:
          return "#76bd49";
      }
    }};
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;
