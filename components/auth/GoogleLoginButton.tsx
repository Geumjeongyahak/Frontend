"use client";

import styled from "styled-components";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type GoogleLoginButtonProps = {
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  size?: "default" | "compact";
  children?: React.ReactNode;
};

export default function GoogleLoginButton({
  type = "button",
  onClick,
  disabled = false,
  size = "default",
  children = "Google로 로그인",
}: GoogleLoginButtonProps) {
  return (
    <Button type={type} onClick={onClick} disabled={disabled} $size={size}>
      <GoogleIcon aria-hidden="true" viewBox="0 0 18 18">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.46.35 2.84.96 4.06l3.02-2.34Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.46 3.44 1.34l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34c.7-2.12 2.68-3.7 5.02-3.7Z"
        />
      </GoogleIcon>
      <Label>{children}</Label>
      <Spacer aria-hidden="true" $size={size} />
    </Button>
  );
}

const Button = styled.button<{ $size: "default" | "compact" }>`
  width: 100%;
  min-height: ${({ $size }) => ($size === "compact" ? "2.75rem" : "2.5rem")};
  border: 1px solid ${colors.borderStrong};
  border-radius: ${({ $size }) => ($size === "compact" ? "8px" : "0.375rem")};
  background-color: ${colors.white};
  color: ${colors.text};
  display: grid;
  grid-template-columns: 1.125rem 1fr 1.125rem;
  align-items: center;
  gap: ${spacing.space8};
  padding: 0 0.875rem;
  font-family: inherit;
  font-size: ${({ $size }) =>
    $size === "compact" ? typography.fontSize16 : typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: ${colors.background};
    border-color: ${colors.border};
  }

  @media (min-width: 120rem) {
    min-height: ${({ $size }) => ($size === "compact" ? "3.75rem" : "3.75rem")};
    border-radius: ${({ $size }) => ($size === "compact" ? "10px" : "0.5rem")};
    grid-template-columns: 1.375rem 1fr 1.375rem;
    padding: 0 1.25rem;
    font-size: ${({ $size }) =>
      $size === "compact" ? typography.fontSize20 : typography.fontSize18};
  }
`;

const GoogleIcon = styled.svg`
  width: 1.125rem;
  height: 1.125rem;

  @media (min-width: 120rem) {
    width: 1.375rem;
    height: 1.375rem;
  }
`;

const Label = styled.span`
  justify-self: center;
`;

const Spacer = styled.span<{ $size: "default" | "compact" }>`
  width: ${({ $size }) => ($size === "compact" ? "1.125rem" : "1.125rem")};

  @media (min-width: 120rem) {
    width: ${({ $size }) => ($size === "compact" ? "1.375rem" : "1.375rem")};
  }
`;
