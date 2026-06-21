"use client";

import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

type StatusProps = {
  $tone?: "default" | "error";
  $visible?: boolean;
};

export const Form = styled.form`
  display: grid;
  gap: ${spacing.space16};
`;

export const FieldGroup = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

export const Field = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

export const Label = styled.label`
  color: #050505;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 ${spacing.space12};
  color: #050505;
  background-color: ${colors.white};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: ${colors.muted};
  }

  &:focus {
    border-color: ${colors.point};
    outline: 2px solid ${colors.pointSoft};
  }

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    padding: 0 ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

export const Status = styled.p<StatusProps>`
  min-height: 1.125rem;
  margin: 0;
  color: ${({ $tone }) => ($tone === "error" ? colors.notice : "#52604c")};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};

  @media (min-width: 120rem) {
    min-height: 1.5rem;
    font-size: ${typography.fontSize16};
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  min-height: 2.5rem;
  border: 0;
  border-radius: 0.375rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  transition: filter 0.18s ease;

  &:not(:disabled):hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;
