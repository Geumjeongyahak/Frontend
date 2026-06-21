import Link from "next/link";
import styled from "styled-components";
import { colors, layout, typography } from "@/styles/tokens";

type ApplyLayoutProps = {
  children: React.ReactNode;
  activeItem?: "apply" | "status";
};

export default function ApplyLayout({ children, activeItem = "apply" }: ApplyLayoutProps) {
  return (
    <ApplyShell>
      <ApplyStage>
        <ApplySidebar activeItem={activeItem} />
        <ApplyContent>{children}</ApplyContent>
      </ApplyStage>
    </ApplyShell>
  );
}

function ApplySidebar({ activeItem }: { activeItem: "apply" | "status" }) {
  return (
    <Sidebar>
      <SidebarHeader>신규 등록</SidebarHeader>
      <SidebarContent>
        <SidebarList>
          <SidebarItem>
            <NavLink
              href="/apply"
              aria-current={activeItem === "apply" ? "page" : undefined}
              $active={activeItem === "apply"}
            >
              교사 신청
            </NavLink>
          </SidebarItem>
          <SidebarItem>
            <NavLink
              href="/apply/status"
              aria-current={activeItem === "status" ? "page" : undefined}
              $active={activeItem === "status"}
            >
              지원 현황
            </NavLink>
          </SidebarItem>
        </SidebarList>
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
  padding: 1.75rem 0 2.5rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 0 3.75rem;
  }
`;

const SidebarList = styled.ul`
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 120rem) {
    gap: 0.625rem;
  }
`;

const SidebarItem = styled.li`
  display: block;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: block;
  padding: 0.25rem 1.625rem;
  background-color: ${({ $active }) => ($active ? colors.point : "transparent")};
  color: ${({ $active }) => ($active ? colors.white : colors.point)};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? colors.point : "#eeeeee")};
    color: ${({ $active }) => ($active ? colors.white : colors.text)};
  }

  @media (min-width: 120rem) {
    padding: 0.3125rem 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;

const ApplyContent = styled.main`
  flex: 1;
  min-width: 0;
`;
