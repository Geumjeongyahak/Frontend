"use client";

import styled, { keyframes } from "styled-components";

type AuthStatusSpinnerProps = {
  size?: string;
};

export default function AuthStatusSpinner({ size = "2.625rem" }: AuthStatusSpinnerProps) {
  return <Spinner aria-hidden="true" $size={size} />;
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.span<{ $size: string }>`
  display: inline-flex;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border: 0.25rem solid rgba(135, 194, 92, 0.18);
  border-top-color: #87c25c;
  border-right-color: #5fc077;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  box-shadow: 0 0 0.75rem rgba(135, 194, 92, 0.16);
`;
