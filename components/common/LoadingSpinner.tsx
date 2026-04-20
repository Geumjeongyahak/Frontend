"use client";

import styled from "styled-components";
import { colors } from "@/styles/tokens";

type LoadingSpinnerProps = {
  label?: string;
};

export default function LoadingSpinner({ label = "로딩 중" }: LoadingSpinnerProps) {
  return <Spinner role="status" aria-label={label} />;
}

const Spinner = styled.span`
  display: inline-block;
  width: 2.25rem;
  height: 2.25rem;
  border: 0.25rem solid rgba(136, 205, 90, 0.22);
  border-top-color: ${colors.point};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
