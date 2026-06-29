"use client";

import type { ReactNode } from "react";
import styled, { keyframes } from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export type ActionTone = "default" | "success" | "error";

type AuthActionCardProps = {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description: ReactNode;
  status?: ReactNode;
  statusTone?: ActionTone;
  showProgress?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
};

export default function AuthActionCard({
  icon,
  eyebrow = "금정열린배움터",
  title,
  description,
  status,
  statusTone = "default",
  showProgress = false,
  children,
  footer,
}: AuthActionCardProps) {
  return (
    <Main>
      <Card>
        <IconFrame $tone={statusTone}>{icon}</IconFrame>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
        <Description>{description}</Description>

        {showProgress ? (
          <ProgressTrack aria-hidden="true">
            <ProgressBar />
          </ProgressTrack>
        ) : null}

        {status ? <StatusMessage $tone={statusTone}>{status}</StatusMessage> : null}
        {children}
        {footer ? <Footer>{footer}</Footer> : null}
      </Card>
    </Main>
  );
}

export const ActionForm = styled.form`
  display: grid;
  gap: ${spacing.space16};
  margin-top: ${spacing.space20};
`;

export const ActionButton = styled.button`
  width: 100%;
  min-height: 2.875rem;
  border: 0;
  border-radius: 0.625rem;
  background-color: #4f9d34;
  color: ${colors.white};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  transition: filter 0.18s ease, transform 0.18s ease;

  &:not(:disabled):hover {
    filter: brightness(0.97);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid ${colors.pointSoft};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.56;
    transform: none;
  }

  @media (min-width: 120rem) {
    min-height: 3.75rem;
    font-size: ${typography.fontSize18};
  }
`;

export const InlineActionButton = styled.button`
  border: 0;
  background: none;
  color: #4f9d34;
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }

  &:focus-visible {
    border-radius: 0.25rem;
    outline: 2px solid ${colors.pointSoft};
    outline-offset: 2px;
  }

  &:disabled {
    color: ${colors.muted};
    cursor: not-allowed;
    text-decoration: none;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

export const AccountPill = styled.div`
  width: 100%;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${spacing.space12};
  border: 1px solid #dfe8dc;
  border-radius: 999px;
  background: #f8fbf6;
  color: #52604c;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  word-break: break-all;

  @media (min-width: 120rem) {
    min-height: 3.25rem;
    font-size: ${typography.fontSize16};
  }
`;

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  display: grid;
  place-items: center;
  padding: ${spacing.space32} ${spacing.space20};
  background:
    linear-gradient(180deg, #f4f8f1 0%, ${colors.background} 46%),
    ${colors.background};
`;

const Card = styled.section`
  width: min(100%, 27rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: ${spacing.space32} ${spacing.space24};
  border: 1px solid #e6ece5;
  border-radius: ${radii.radius12};
  background: ${colors.white};
  box-shadow: 0 1.5rem 3.75rem rgba(34, 34, 34, 0.08);

  > * {
    width: 100%;
  }

  @media (min-width: 120rem) {
    width: 39rem;
    padding: ${spacing.space46} ${spacing.space40};
  }
`;

const IconFrame = styled.div<{ $tone: ActionTone }>`
  width: 3.75rem;
  height: 3.75rem;
  display: grid;
  place-items: center;
  margin-bottom: ${spacing.space20};
  border-radius: ${radii.radius12};
  background: ${({ $tone }) => ($tone === "error" ? colors.noticeSoft : colors.pointSoft)};
  color: ${({ $tone }) => ($tone === "error" ? colors.notice : "#4f9d34")};

  svg {
    width: 2rem;
    height: 2rem;
    stroke-width: 1.9;
  }

  @media (min-width: 120rem) {
    width: 5rem;
    height: 5rem;
    border-radius: ${radii.radius20};

    svg {
      width: 2.625rem;
      height: 2.625rem;
    }
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 ${spacing.space8};
  color: #4f9d34;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #151a18;
  font-size: 1.625rem;
  font-weight: 800;
  line-height: 1.22;
  letter-spacing: 0;
  word-break: keep-all;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const Description = styled.p`
  margin: ${spacing.space12} 0 0;
  color: #52604c;
  font-size: ${typography.fontSize14};
  line-height: 1.65;
  word-break: keep-all;

  strong {
    color: #151a18;
    font-weight: 800;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const loading = keyframes`
  0% {
    transform: translateX(-70%);
  }
  100% {
    transform: translateX(170%);
  }
`;

const ProgressTrack = styled.div`
  height: 0.625rem;
  margin-top: ${spacing.space24};
  overflow: hidden;
  border-radius: 999px;
  background: ${colors.pointSoft};
`;

const ProgressBar = styled.div`
  width: 44%;
  height: 100%;
  border-radius: inherit;
  background: #89ca6b;
  animation: ${loading} 1.2s ease-in-out infinite;
`;

const StatusMessage = styled.p<{ $tone: ActionTone }>`
  min-height: 1.25rem;
  margin: ${spacing.space16} 0 0;
  color: ${({ $tone }) =>
    $tone === "error" ? colors.notice : $tone === "success" ? "#4f9d34" : "#52604c"};
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const Footer = styled.div`
  margin-top: ${spacing.space24};
  padding-top: ${spacing.space20};
  border-top: 1px solid #e6ece5;
  color: #7a857f;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  text-align: center;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;
