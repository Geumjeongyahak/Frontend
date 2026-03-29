"use client";

import styled, { css } from "styled-components";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type HomeCardProps = {
  title: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
};

export default function HomeCard({
  title,
  actionLabel,
  children,
  className,
}: HomeCardProps) {
  return (
    <Card className={className}>
      <Header>
        <Title>{title}</Title>
        {actionLabel ? <Action href="#">{actionLabel}</Action> : null}
      </Header>
      <Content>{children}</Content>
    </Card>
  );
}

const cardShell = css`
  background-color: ${colors.white};
  border: 0.0625rem solid ${colors.border};
  border-radius: ${radii.radius30};
  padding: ${spacing.space33};
`;

const Card = styled.section`
  ${cardShell}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space16};
  margin-bottom: ${spacing.space24};
`;

const Title = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize24};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const Action = styled.a`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
`;

const Content = styled.div`
  min-width: 0;
`;
