"use client";

import Link from "next/link";
import styled from "styled-components";
import { headerMenus } from "@/mocks/home";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function Header() {
  return (
    <HeaderWrapper>
      <Inner>
        <LogoArea href="/">
          <Logo src="/logo.svg" alt="금정열린배움터 로고" />
        </LogoArea>

        <Nav>
          <NavList>
            {headerMenus.map((menu) => (
              <NavItem key={menu.label}>
                <NavLink href={menu.href}>{menu.label}</NavLink>
                <Dropdown>
                  <DropdownTitle>{menu.label}</DropdownTitle>
                  <DropdownDivider />
                  <DropdownList>
                    {menu.items.map((item) => (
                      <DropdownItem key={item.label}>
                        <DropdownLink href={item.href}>{item.label}</DropdownLink>
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </NavItem>
            ))}
          </NavList>
        </Nav>

        <AuthArea>
          <AuthLink href="/login">로그인</AuthLink>
        </AuthArea>
      </Inner>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  background-color: ${colors.white};
  border-bottom: 0.0625rem solid ${colors.border};
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space24};
  width: 100%;
  max-width: ${layout.maxWidth};
  min-height: ${layout.headerHeight};
  margin: 0 auto;
  padding: 0 ${spacing.space20};

  @media (max-width: ${layout.breakpointTablet}) {
    flex-wrap: wrap;
    justify-content: center;
    padding-top: ${spacing.space16};
    padding-bottom: ${spacing.space16};
  }
`;

const LogoArea = styled(Link)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  display: block;
  width: 3.5rem;
  height: auto;
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  justify-content: center;

  @media (max-width: ${layout.breakpointTablet}) {
    order: 3;
    width: 100%;
  }
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: ${spacing.space40};
  margin: 0;
  padding: 0;

  @media (max-width: ${layout.breakpointMobile}) {
    gap: ${spacing.space20};
  }
`;

const NavItem = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space28} 0 ${spacing.space24};
  margin-bottom: -${spacing.space24};

  &:hover > div {
    display: block;
  }
`;

const NavLink = styled(Link)`
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${colors.point};
  }
`;

const AuthArea = styled.div`
  flex-shrink: 0;
`;

const AuthLink = styled(Link)`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    color: ${colors.point};
  }
`;

const Dropdown = styled.div`
  display: none;
  position: absolute;
  top: calc(100% - ${spacing.space12});
  left: 50%;
  min-width: 14rem;
  padding: ${spacing.space24} ${spacing.space24} ${spacing.space28};
  border-radius: ${radii.radius30};
  background-color: ${colors.point};
  transform: translateX(-50%);
`;

const DropdownTitle = styled.p`
  color: ${colors.white};
  font-size: ${typography.fontSize24};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;
`;

const DropdownDivider = styled.div`
  width: 5.625rem;
  height: 0.25rem;
  margin: ${spacing.space20} auto ${spacing.space24};
  border-radius: ${radii.radius999};
  background-color: ${colors.white};
`;

const DropdownList = styled.ul`
  display: grid;
  gap: ${spacing.space20};
  justify-items: center;
`;

const DropdownItem = styled.li`
  text-align: center;
`;

const DropdownLink = styled(Link)`
  color: ${colors.white};
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
`;
