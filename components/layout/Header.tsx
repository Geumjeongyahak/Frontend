"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { headerMenus } from "@/mocks/home";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <HeaderContainer
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
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
                </NavItem>
              ))}
            </NavList>
          </Nav>

          <AuthArea>
            <AuthLink href="/login">로그인</AuthLink>
          </AuthArea>
        </Inner>
      </HeaderWrapper>

      <MegaMenu $isOpen={isMenuOpen}>
        <MegaMenuInner>
          <MegaMenuGrid>
            {headerMenus.map((menu) => (
              <MenuColumn key={menu.label}>
                <MenuTitle href={menu.href}>{menu.label}</MenuTitle>
                <MenuDivider />
                <SubMenuList>
                  {menu.items.map((item) => (
                    <SubMenuItem key={item.label}>
                      <SubMenuLink href={item.href}>{item.label}</SubMenuLink>
                    </SubMenuItem>
                  ))}
                </SubMenuList>
              </MenuColumn>
            ))}
          </MegaMenuGrid>
        </MegaMenuInner>
      </MegaMenu>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  background-color: ${colors.white};
`;

const HeaderWrapper = styled.header`
  width: 100%;
  border-bottom: 0.0625rem solid ${colors.border};
  background-color: ${colors.white};
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
  list-style: none;

  @media (max-width: ${layout.breakpointMobile}) {
    gap: ${spacing.space20};
  }
`;

const NavItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space28} 0 ${spacing.space24};
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

const MegaMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 99;
  width: 100%;
  overflow: hidden;
  background-color: ${colors.point};
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08);

  max-height: ${({ $isOpen }) => ($isOpen ? "32rem" : "0")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition:
    max-height 0.28s ease,
    opacity 0.2s ease,
    visibility 0.2s ease;
`;

const MegaMenuInner = styled.div`
  width: 100%;
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
`;

const MegaMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: ${spacing.space40};
  align-items: start;
  justify-items: center;
`;

const MenuColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 8rem;
`;

const MenuTitle = styled(Link)`
  color: ${colors.white};
  font-size: ${typography.fontSize24};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
`;

const MenuDivider = styled.div`
  width: 3.625rem;
  height: 0.25rem;
  margin: ${spacing.space16} 0 ${spacing.space28};
  border-radius: ${radii.radius999};
  background-color: ${colors.white};
`;

const SubMenuList = styled.ul`
  display: grid;
  gap: ${spacing.space20};
  margin: 0;
  padding: 0;
  list-style: none;
  justify-items: center;
`;

const SubMenuItem = styled.li`
  text-align: center;
`;

const SubMenuLink = styled(Link)`
  color: ${colors.white};
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
  opacity: 0.95;

  &:hover {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }
`;
