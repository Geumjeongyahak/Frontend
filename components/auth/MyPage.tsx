"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function MyPage() {
  const router = useRouter();
  const { status, user, signOut } = useAuthSession();

  const displayName = user?.name ?? "회원";
  const identifier = user?.nickname ?? user?.email ?? "확인 가능한 계정 정보가 없습니다.";

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  return (
    <Main>
      <Content>
        <HeaderBlock>
          <Eyebrow>마이페이지</Eyebrow>
          <Title>내 정보</Title>
        </HeaderBlock>

        <Panel aria-live="polite">
          {status === "loading" ? (
            <StatusSlot>
              <LoadingSpinner label="회원 정보 확인 중" />
            </StatusSlot>
          ) : null}

          {status === "unauthenticated" ? (
            <StatusSlot>
              <StateGroup>
                <StateText>로그인이 필요한 페이지입니다.</StateText>
                <PrimaryLink href="/login">로그인</PrimaryLink>
              </StateGroup>
            </StatusSlot>
          ) : null}

          {status === "error" ? (
            <StatusSlot>
              <StateGroup>
                <StateText>회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</StateText>
                <SecondaryButton type="button" onClick={handleLogout}>
                  로그아웃
                </SecondaryButton>
              </StateGroup>
            </StatusSlot>
          ) : null}

          {status === "authenticated" ? (
            <>
              <SectionTitle>내 정보</SectionTitle>
              <ProfileList>
                <ProfileItem>
                  <ProfileLabel>이름</ProfileLabel>
                  <ProfileValue>{displayName}</ProfileValue>
                </ProfileItem>
                <ProfileItem>
                  <ProfileLabel>닉네임</ProfileLabel>
                  <ProfileValue>{identifier}</ProfileValue>
                </ProfileItem>
                <ProfileItem>
                  <ProfileLabel>이메일</ProfileLabel>
                  <ProfileValue>{user?.email ?? "등록된 이메일이 없습니다."}</ProfileValue>
                </ProfileItem>
                <ProfileItem>
                  <ProfileLabel>전화번호</ProfileLabel>
                  <ProfileValue>{user?.phoneNumber ?? "등록된 전화번호가 없습니다."}</ProfileValue>
                </ProfileItem>
              </ProfileList>
              <ActionRow>
                <PrimaryLink href="/">메인으로</PrimaryLink>
                <SecondaryButton type="button" onClick={handleLogout}>
                  로그아웃
                </SecondaryButton>
              </ActionRow>
            </>
          ) : null}
        </Panel>
      </Content>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.background};
`;

const Content = styled.div`
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  padding: ${spacing.space28} ${spacing.space20} ${spacing.space32};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${spacing.space24};

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    min-height: calc(100vh - 7.1875rem);
    padding-top: ${spacing.space46};
    padding-bottom: ${spacing.space47};
    gap: ${spacing.space32};
  }
`;

const HeaderBlock = styled.section`
  width: 100%;
  max-width: 34.625rem;
  display: flex;
  flex-direction: column;
  gap: ${spacing.space4};

  @media (min-width: 120rem) {
    max-width: 51.9375rem;
    gap: ${spacing.space8};
  }
`;

const Eyebrow = styled.p`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: ${typography.fontSize24};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const Panel = styled.section`
  width: 100%;
  max-width: 34.625rem;
  min-height: 23.25rem;
  padding: ${spacing.space24};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius30};
  background-color: ${colors.white};
  display: flex;
  flex-direction: column;

  @media (min-width: 120rem) {
    max-width: 51.9375rem;
    min-height: 34.875rem;
    padding: ${spacing.space32};
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  margin-bottom: ${spacing.space20};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
    margin-bottom: ${spacing.space28};
  }
`;

const ProfileList = styled.dl`
  display: grid;
  gap: ${spacing.space16};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
  }
`;

const ProfileItem = styled.div`
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: ${spacing.space12};
  padding-bottom: ${spacing.space16};
  border-bottom: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    grid-template-columns: 7rem minmax(0, 1fr);
    gap: ${spacing.space16};
    padding-bottom: ${spacing.space24};
  }

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const ProfileLabel = styled.dt`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ProfileValue = styled.dd`
  min-width: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
  overflow-wrap: anywhere;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
  margin-top: ${spacing.space28};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
    margin-top: ${spacing.space40};
  }
`;

const StateGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space16};
`;

const StatusSlot = styled.div`
  min-height: 19.75rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 120rem) {
    min-height: 29.625rem;
  }
`;

const StateText = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding: 0 ${spacing.space20};
  border-radius: ${radii.radius12};
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    min-height: 4.9375rem;
    padding: 0 ${spacing.space32};
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize24};
  }
`;

const SecondaryButton = styled.button`
  min-height: 3.5rem;
  padding: 0 ${spacing.space20};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 4.9375rem;
    padding: 0 ${spacing.space32};
    border-radius: ${radii.radius15};
    font-size: ${typography.fontSize24};
  }

  &:hover {
    border-color: ${colors.point};
    color: ${colors.point};
  }
`;
