import styled, { css } from "styled-components";
import type { MouseEventHandler } from "react";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type HomeCardProps = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
};

export default function HomeCard({
  title,
  actionLabel,
  actionHref,
  onActionClick,
  children,
  className,
}: HomeCardProps) {
  return (
    <Card className={className}>
      <Header>
        <Title>{title}</Title>
        {actionLabel && onActionClick ? (
          <ActionButton type="button" onClick={onActionClick}>
            {actionLabel}
          </ActionButton>
        ) : null}
        {actionLabel && !onActionClick ? (
          <Action href={actionHref ?? "#"}>{actionLabel}</Action>
        ) : null}
      </Header>
      <Content>{children}</Content>
    </Card>
  );
}

const cardShell = css`
  background-color: ${colors.white};
  border-radius: ${radii.radius30};
  padding: ${spacing.space24};

  @media (min-width: 120rem) {
    padding: ${spacing.space32};
  }
`;

const Card = styled.section`
  ${cardShell}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space16};
  margin-bottom: ${spacing.space20};

  @media (min-width: 120rem) {
    margin-bottom: ${spacing.space28};
  }
`;

const Title = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const Action = styled.a`
  color: ${colors.point};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ActionButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: ${colors.point};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Content = styled.div`
  min-width: 0;
`;
