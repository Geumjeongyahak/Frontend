import Link from "next/link";
import styled from "styled-components";
import { colors, radii, spacing, typography } from "@/styles/tokens";

export default function AdminAccessDeniedPage() {
  return (
    <Main>
      <Panel aria-labelledby="admin-access-denied-title">
        <Title id="admin-access-denied-title">관리자 페이지 접근 권한이 없습니다.</Title>
        <Description>관리자 또는 운영 담당자 계정으로 로그인해 주세요.</Description>
        <HomeLink href="/">홈으로 돌아가기</HomeLink>
      </Panel>
    </Main>
  );
}

const Main = styled.main`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: ${spacing.space20};
  background-color: #f4f6f5;
`;

const Panel = styled.section`
  display: grid;
  width: 100%;
  max-width: 30.75rem;
  gap: ${spacing.space16};
  padding: ${spacing.space24};
  text-align: center;
  background-color: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
`;

const Title = styled.h1`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const Description = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const HomeLink = styled(Link)`
  justify-self: center;
  min-height: 2.5rem;
  padding: 0 ${spacing.space20};
  display: inline-flex;
  align-items: center;
  border-radius: 0.375rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  transition: filter 0.18s ease;

  &:hover {
    filter: brightness(0.97);
  }

  &:focus-visible {
    outline: 3px solid ${colors.pointSoft};
    outline-offset: 2px;
  }
`;
