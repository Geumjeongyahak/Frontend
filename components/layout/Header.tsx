"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuthSession } from "@/hooks/useAuthSession";
import { headerMenus } from "@/mocks/home";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const HEADER_MENU_COLUMN_WIDTH_720 = "3rem";
const HEADER_MENU_COLUMN_WIDTH_1080 = "5rem";
const HEADER_MENU_COLUMN_GAP_720 = "5.5rem";
const HEADER_MENU_COLUMN_GAP_1080 = "8.125rem";

const HEADER_DROPDOWN_MAX_HEIGHT_720 = "26.5rem";
const HEADER_DROPDOWN_MAX_HEIGHT_1080 = "30rem";
const HEADER_DROPDOWN_MIN_HEIGHT_720 = "21.5rem";
const HEADER_DROPDOWN_MIN_HEIGHT_1080 = "30rem";
const HEADER_DROPDOWN_PADDING_720 = `${spacing.space8} ${spacing.space20} ${spacing.space40}`;
const HEADER_DROPDOWN_PADDING_1080 = `${spacing.space16} ${spacing.space20} ${spacing.space47}`;

const HEADER_DROPDOWN_DIVIDER_WIDTH_720 = "2.5rem";
const HEADER_DROPDOWN_DIVIDER_WIDTH_1080 = "3.625rem";
const HEADER_DROPDOWN_DIVIDER_HEIGHT_720 = "0.1875rem";
const HEADER_DROPDOWN_DIVIDER_HEIGHT_1080 = "0.25rem";
const HEADER_DROPDOWN_DIVIDER_MARGIN_720 = `0 0 2.4rem`;
const HEADER_DROPDOWN_DIVIDER_MARGIN_1080 = `0 0 3rem`;

const HEADER_DROPDOWN_ITEM_GAP_720 = spacing.space40;
const HEADER_DROPDOWN_ITEM_GAP_1080 = "3.5rem";
const HEADER_DROPDOWN_LIST_MIN_HEIGHT_720 = "11rem";
const HEADER_DROPDOWN_LIST_MIN_HEIGHT_1080 = "16.5rem";
const HEADER_BACKDROP_COLOR = "rgba(0, 0, 0, 0.14)";

const HEADER_TRANSITION_BACKGROUND = "0.5s ease";
const HEADER_TRANSITION_VISIBILITY = "0.2s ease";
const HEADER_DROPDOWN_TRANSITION_HEIGHT = "0.5s ease";
const HEADER_DROPDOWN_TRANSITION_OPACITY = "0.5s ease";
const HEADER_BACKDROP_TRANSITION_OPACITY = "0.5s ease";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { status, signOut } = useAuthSession();
  const isAuthenticated = status === "authenticated";

  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  return (
    <>
      <HeaderContainer $isOpen={isMenuOpen} onMouseLeave={() => setIsMenuOpen(false)}>
        <HeaderWrapper $isOpen={isMenuOpen}>
          <Inner>
            <LogoArea href="/" $isOpen={isMenuOpen} onMouseEnter={() => setIsMenuOpen(false)}>
              <Logo src="/logo.svg" alt="금정야학 로고" />
            </LogoArea>

            <Nav>
              <NavList>
                {headerMenus.map((menu) => (
                  <NavItem key={menu.label}>
                    <NavLink
                      href={menu.href}
                      $isOpen={isMenuOpen}
                      onFocus={() => setIsMenuOpen(true)}
                      onMouseEnter={() => setIsMenuOpen(true)}
                    >
                      {menu.label}
                    </NavLink>
                  </NavItem>
                ))}
              </NavList>
            </Nav>

            <AuthArea $isOpen={isMenuOpen} onMouseEnter={() => setIsMenuOpen(false)}>
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
      <PageBackdrop $isOpen={isMenuOpen} aria-hidden="true" />
    </>
  );
}

const HeaderContainer = styled.div<{ $isOpen: boolean }>`
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  background-color: ${({ $isOpen }) => ($isOpen ? colors.point : colors.background)};
`;

const HeaderWrapper = styled.header<{ $isOpen: boolean }>`
  width: 100%;
  background-color: ${({ $isOpen }) => ($isOpen ? colors.point : colors.background)};
  transition: background-color ${HEADER_TRANSITION_BACKGROUND};
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

const LogoArea = styled(Link)<{ $isOpen: boolean }>`
  position: absolute;
  left: ${spacing.space20};
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)};
  visibility: ${({ $isOpen }) => ($isOpen ? "hidden" : "visible")};
  transition:
    opacity ${HEADER_TRANSITION_VISIBILITY},
    visibility ${HEADER_TRANSITION_VISIBILITY};

  @media (max-width: ${layout.breakpointTablet}) {
    position: static;
    transform: none;
  }
`;

const Logo = styled.img`
  display: block;
  width: 4.7rem;
  height: auto;

  @media (min-width: 120rem) {
    width: 7rem;
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
  display: grid;
  grid-template-columns: repeat(3, ${HEADER_MENU_COLUMN_WIDTH_720});
  align-items: center;
  justify-content: center;
  justify-items: center;
  gap: ${HEADER_MENU_COLUMN_GAP_720};
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 120rem) {
    grid-template-columns: repeat(3, ${HEADER_MENU_COLUMN_WIDTH_1080});
    gap: ${HEADER_MENU_COLUMN_GAP_1080};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: repeat(3, minmax(0, auto));
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

const NavLink = styled(Link)<{ $isOpen: boolean }>`
  color: ${({ $isOpen }) => ($isOpen ? colors.white : colors.text)};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }

  &:hover {
    color: ${({ $isOpen }) => ($isOpen ? colors.white : colors.point)};
  }
`;

const AuthArea = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: ${spacing.space20};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space12};
  width: 11.5rem;
  opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)};
  visibility: ${({ $isOpen }) => ($isOpen ? "hidden" : "visible")};
  transition:
    opacity ${HEADER_TRANSITION_VISIBILITY},
    visibility ${HEADER_TRANSITION_VISIBILITY};

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
  z-index: 30;
  width: 100%;
  overflow: hidden;
  background-color: ${colors.point};
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08);

  max-height: ${({ $isOpen }) => ($isOpen ? HEADER_DROPDOWN_MAX_HEIGHT_720 : "0")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition:
    max-height ${HEADER_DROPDOWN_TRANSITION_HEIGHT},
    opacity ${HEADER_DROPDOWN_TRANSITION_OPACITY},
    visibility ${HEADER_DROPDOWN_TRANSITION_OPACITY};

  @media (min-width: 120rem) {
    max-height: ${({ $isOpen }) => ($isOpen ? HEADER_DROPDOWN_MAX_HEIGHT_1080 : "0")};
  }
`;

const PageBackdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  background-color: ${HEADER_BACKDROP_COLOR};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition:
    opacity ${HEADER_BACKDROP_TRANSITION_OPACITY},
    visibility ${HEADER_BACKDROP_TRANSITION_OPACITY};
`;

const MegaMenuInner = styled.div`
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  margin: 0 auto;
  min-height: ${HEADER_DROPDOWN_MIN_HEIGHT_720};
  padding: ${HEADER_DROPDOWN_PADDING_720};

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    min-height: ${HEADER_DROPDOWN_MIN_HEIGHT_1080};
    padding: ${HEADER_DROPDOWN_PADDING_1080};
  }
`;

const MegaMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, ${HEADER_MENU_COLUMN_WIDTH_720});
  gap: ${HEADER_MENU_COLUMN_GAP_720};
  align-items: start;
  justify-content: center;
  justify-items: center;

  @media (min-width: 120rem) {
    grid-template-columns: repeat(3, ${HEADER_MENU_COLUMN_WIDTH_1080});
    gap: ${HEADER_MENU_COLUMN_GAP_1080};
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
  width: ${HEADER_MENU_COLUMN_WIDTH_720};

  @media (min-width: 120rem) {
    width: ${HEADER_MENU_COLUMN_WIDTH_1080};
  }
`;

const MenuDivider = styled.div`
  width: ${HEADER_DROPDOWN_DIVIDER_WIDTH_720};
  height: ${HEADER_DROPDOWN_DIVIDER_HEIGHT_720};
  margin: ${HEADER_DROPDOWN_DIVIDER_MARGIN_720};
  flex: 0 0 auto;
  border-radius: ${radii.radius999};
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    width: ${HEADER_DROPDOWN_DIVIDER_WIDTH_1080};
    height: ${HEADER_DROPDOWN_DIVIDER_HEIGHT_1080};
    margin: ${HEADER_DROPDOWN_DIVIDER_MARGIN_1080};
  }
`;

const SubMenuList = styled.ul`
  display: grid;
  gap: ${HEADER_DROPDOWN_ITEM_GAP_720};
  align-content: start;
  margin: 0;
  padding: 0;
  list-style: none;
  justify-items: center;
  min-height: ${HEADER_DROPDOWN_LIST_MIN_HEIGHT_720};

  @media (min-width: 120rem) {
    gap: ${HEADER_DROPDOWN_ITEM_GAP_1080};
    min-height: ${HEADER_DROPDOWN_LIST_MIN_HEIGHT_1080};
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
