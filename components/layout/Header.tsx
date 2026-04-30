"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuthSession } from "@/hooks/useAuthSession";
import { headerMenus } from "@/mocks/home";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { status, signOut } = useAuthSession();
  const isAuthenticated = status === "authenticated";

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  return (
    <HeaderContainer onMouseLeave={() => setIsMenuOpen(false)}>
      <HeaderWrapper>
        <Inner>
          <LogoArea href="/" onMouseEnter={() => setIsMenuOpen(false)}>
            <Logo src="/logo.svg" alt="금정야학 로고" />
          </LogoArea>

          <Nav>
            <NavList>
              {headerMenus.map((menu) => (
                <NavItem key={menu.label}>
                  <NavLink
                    href={menu.href}
                    onFocus={() => setIsMenuOpen(true)}
                    onMouseEnter={() => setIsMenuOpen(true)}
                  >
                    {menu.label}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>
          </Nav>

          <AuthArea onMouseEnter={() => setIsMenuOpen(false)}>
            {status === "loading" ? (
              <AuthPlaceholder aria-hidden="true" />
            ) : isAuthenticated ? (
              <>
                <AuthLink href="/mypage">마이페이지</AuthLink>
                <LogoutButton type="button" onClick={handleLogout}>
                  로그아웃
                </LogoutButton>
              </>
            ) : (
              <AuthLink href="/login">로그인</AuthLink>
            )}
          </AuthArea>
        </Inner>
      </HeaderWrapper>

      <MegaMenu $isOpen={isMenuOpen} onMouseEnter={() => setIsMenuOpen(true)}>
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
  background-color: ${colors.background};
`;

const HeaderWrapper = styled.header`
  width: 100%;
  background-color: ${colors.background};
`;

const Inner = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  min-height: ${layout.headerHeight};
  margin: 0 auto;
  padding: 0 ${spacing.space20};

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    min-height: 7.1875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-wrap: wrap;
    justify-content: center;
    padding-top: ${spacing.space16};
    padding-bottom: ${spacing.space16};
  }
`;

const LogoArea = styled(Link)`
  position: absolute;
  left: ${spacing.space20};
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  display: flex;
  align-items: center;

  @media (max-width: ${layout.breakpointTablet}) {
    position: static;
    transform: none;
  }
`;

const Logo = styled.img`
  display: block;
  width: 3.5rem;
  height: auto;

  @media (min-width: 120rem) {
    width: 5.25rem;
  }
`;

const Nav = styled.nav`
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
  gap: 5.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 120rem) {
    gap: 8.125rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    gap: ${spacing.space20};
  }
`;

const NavItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space28} 0 ${spacing.space24};

  @media (min-width: 120rem) {
    padding: ${spacing.space40} 0 ${spacing.space32};
  }
`;

const NavLink = styled(Link)`
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }

  &:hover {
    color: ${colors.point};
  }
`;

const AuthArea = styled.div`
  position: absolute;
  right: ${spacing.space20};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space12};
  width: 11.5rem;

  @media (max-width: ${layout.breakpointTablet}) {
    position: static;
    transform: none;
    flex-shrink: 0;
  }
`;

const AuthPlaceholder = styled.span`
  display: block;
  width: 100%;
  min-height: 1.125rem;
`;

const AuthLink = styled(Link)`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }

  &:hover {
    color: ${colors.point};
  }
`;

const LogoutButton = styled.button`
  border: 0;
  background-color: transparent;
  color: ${colors.muted};
  padding: 0;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }

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
  max-width: ${layout.homeMaxWidth};
  margin: 0 auto;
  padding: ${spacing.space24} ${spacing.space20} ${spacing.space32};

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const MegaMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 5.5625rem);
  gap: 5.5rem;
  align-items: start;
  justify-content: center;
  justify-items: center;

  @media (min-width: 120rem) {
    grid-template-columns: repeat(3, 5.5625rem);
    gap: 8.125rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
    gap: ${spacing.space28};
  }
`;

const MenuColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 8.75rem;

  @media (min-width: 120rem) {
    width: 13.125rem;
  }
`;

const MenuTitle = styled(Link)`
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const MenuDivider = styled.div`
  width: 2.5rem;
  height: 0.1875rem;
  margin: ${spacing.space12} 0 ${spacing.space20};
  border-radius: ${radii.radius999};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    width: 3.625rem;
    height: 0.25rem;
    margin: ${spacing.space16} 0 ${spacing.space28};
  }
`;

const SubMenuList = styled.ul`
  display: grid;
  gap: ${spacing.space12};
  margin: 0;
  padding: 0;
  list-style: none;
  justify-items: center;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const SubMenuItem = styled.li`
  text-align: center;
`;

const SubMenuLink = styled(Link)`
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
  opacity: 0.95;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }

  &:hover {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }
`;
