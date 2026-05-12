"use client";

import styled from "styled-components";
import { spacing, typography } from "@/styles/tokens";

export type FieldTone = "default" | "proposal";

const BaseFieldStyle = `
  width: 100%;
  min-width: 0;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid #c0c0c0;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const FieldInput = styled.input<{ $tone?: FieldTone }>`
  ${BaseFieldStyle}
  min-height: 2.6875rem;
  background: ${({ $tone }) => ($tone === "proposal" ? "#ffffff" : "#f7f7f7")};

  ${({ $tone }) =>
    $tone === "proposal"
      ? `
    &::placeholder {
      color: #9c9c9c;
    }
  `
      : ""}

  @media (min-width: 120rem) {
    min-height: 4rem;
  }
`;

export const FieldTextarea = styled.textarea<{ $tone?: FieldTone }>`
  ${BaseFieldStyle}
  min-height: 6.875rem;
  resize: ${({ $tone }) => ($tone === "proposal" ? "none" : "vertical")};
  background: ${({ $tone }) => ($tone === "proposal" ? "#ffffff" : "#f7f7f7")};

  ${({ $tone }) =>
    $tone === "proposal"
      ? `
    &::placeholder {
      color: #9c9c9c;
    }
  `
      : ""}

  @media (min-width: 120rem) {
    min-height: ${({ $tone }) => ($tone === "proposal" ? "10.0625rem" : "9.6875rem")};
  }
`;
