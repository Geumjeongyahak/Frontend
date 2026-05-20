import Link from "next/link";
import styled from "styled-components";
import { colors, layout, typography } from "@/styles/tokens";

type ApplyLayoutProps = {
  children: React.ReactNode;
};

export default function ApplyLayout({ children }: ApplyLayoutProps) {
  return (
    <ApplyShell>
      <ApplyStage>
        <ApplySidebar />
        <ApplyContent>{children}</ApplyContent>
      </ApplyStage>
    </ApplyShell>
  );
}

function ApplySidebar() {
  return (
    <Sidebar>
      <SidebarHeader>신규 등록</SidebarHeader>
      <SidebarContent>
        <ActiveLink href="/apply" aria-current="page">
          교사 신청
        </ActiveLink>
      </SidebarContent>
    </Sidebar>
  );
}

const ApplyShell = styled.div`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const ApplyStage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 11.625rem;
  flex-shrink: 0;
  background-color: ${colors.background};
  border-right: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    width: 17.4375rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
  }
`;

const SidebarHeader = styled.h1`
  display: flex;
  align-items: center;
  min-height: 3.625rem;
  margin: 0;
  padding: 0 1.625rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 5.5rem;
    padding: 0 2.5rem;
    font-size: ${typography.fontSize24};
  }
`;

const SidebarContent = styled.nav`
  padding: 1.5rem 0 2.5rem;

  @media (min-width: 120rem) {
    padding: 2.25rem 0 3.75rem;
  }
`;

const ActiveLink = styled(Link)`
  display: block;
  padding: 0.25rem 1.625rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    padding: 0.3125rem 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;

const ApplyContent = styled.main`
  flex: 1;
  min-width: 0;
`;
