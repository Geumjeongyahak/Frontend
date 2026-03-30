"use client";

import Link from "next/link";
import styled from "styled-components";

export default function Header() {
  return (
    <HeaderWrapper>
      <Inner>
        <LogoArea href="/">
          <Logo src="/logo.svg" alt="로고" />
        </LogoArea>

        <Nav>
          <NavList>
            <li>
              <NavLink href="/info">기관 정보</NavLink>
            </li>
            <li>
              <NavLink href="/staff">교원</NavLink>
            </li>
            <li>
              <NavLink href="/register">신규 등록</NavLink>
            </li>
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
  width: 100%;
  background-color: #ffffff;
  border-bottom: 0.0625rem solid #d9d9d9;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 75rem;
  height: 5.25rem;
  margin: 0 auto;
  padding: 0 1.5rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
`;

const LogoArea = styled(Link)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 5rem;
  height: auto;
  display: block;
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: 6.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    color: #84cc16;
  }
`;

const AuthArea = styled.div`
  flex-shrink: 0;
`;

const AuthLink = styled(Link)`
  text-decoration: none;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    color: #84cc16;
  }
`;
