"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

type MobileRequestShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  children: ReactNode;
};

export default function MobileRequestShell({
  eyebrow,
  title,
  description,
  action,
  backHref = "/",
  children,
}: MobileRequestShellProps) {
  const router = useRouter();

  return (
    <Page>
      <Header>
        <BackButton type="button" onClick={() => router.push(backHref)}>
          <IconChevronLeft size={24} stroke={1.9} />
        </BackButton>
        {action}
      </Header>

      <Intro>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title>{title}</Title>
        {description ? <Description>{description}</Description> : null}
      </Intro>

      <Content>{children}</Content>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100dvh;
  padding: 3.5rem 1.25rem calc(5.5rem + env(safe-area-inset-bottom, 0rem));
  background:
    radial-gradient(circle at top right, rgba(136, 205, 90, 0.22), transparent 34%),
    linear-gradient(180deg, #f7faf4 0%, #f3f3f3 42%, #f3f3f3 100%);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.75rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: ${colors.text};
  padding: 0;
  cursor: pointer;
`;

const Intro = styled.header`
  display: grid;
  gap: ${spacing.space8};
  margin-top: ${spacing.space20};
`;

const Eyebrow = styled.p`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.22;
  word-break: keep-all;
`;

const Description = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const Content = styled.section`
  display: grid;
  gap: ${spacing.space16};
  margin-top: ${spacing.space20};
`;
