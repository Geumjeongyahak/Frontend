"use client";

import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

type StatusProps = {
  $tone?: "default" | "error";
  $visible?: boolean;
};

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space24};
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space16};
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space8};
`;

export const Label = styled.label`
  color: #4d5848;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

export const Input = styled.input`
  width: 100%;
  height: 3.25rem;
  padding: 0 ${spacing.space16};
  color: ${colors.text};
  background-color: #fbfdf9;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight150};
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &::placeholder {
    color: ${colors.muted};
  }

  &:focus {
    border-color: ${colors.point};
    background-color: ${colors.white};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.18);
  }
`;

export const Status = styled.p<StatusProps>`
  min-height: 1.375rem;
  color: ${({ $tone }) => ($tone === "error" ? "#d97b7b" : "#52604c")};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight150};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
`;

export const SubmitButton = styled.button`
  width: 100%;
  height: 3.5rem;
  border: 0;
  border-radius: 8px;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-0.0625rem);
    box-shadow: 0 0.75rem 1.5rem rgba(93, 153, 54, 0.2);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;
