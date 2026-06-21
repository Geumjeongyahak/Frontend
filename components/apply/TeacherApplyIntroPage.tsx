"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import ApplyLayout from "@/components/apply/ApplyLayout";
import { ApplyActionLink } from "@/components/apply/ApplyAction";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, spacing, typography } from "@/styles/tokens";

const notices = [
  "* 금정열린배움터는 정규교육을 이수하지 못한 분들을 위해 자치적인 비영리 교육봉사 활동이 이루어지는 곳입니다.",
  "* 2026년 기준 32년째 운영 중이며 학생 대부분이 정규교육을 받지 못하신 50~80대 어머님·아버님입니다.",
  "* 40명 이상의 교사로 구성되어 있으며, 고등학교를 졸업하신 분이라면 누구든 교사로 활동하실 수 있습니다.",
  "* 재학생, 휴학생, 직장인 모두 지원이 가능하며, 대기자가 많을 경우 신입교사로 들어오시기까지 시간이 걸릴 수 있습니다.",
  "* 지원서에 정해진 글자 수를 요구하지는 않으나, 지나치게 성의 없이 작성하실 경우 불합격 처리될 수 있음에 유의해 주십시오.",
  "* 면접 날짜는 지원서 확인 후 지원자님께 개별 연락드린 뒤 상의 후 진행됩니다.",
];

export default function TeacherApplyIntroPage() {
  const router = useRouter();
  const { status } = useAuthSession();

  useEffect(() => {
    if (status === "unauthenticated" || status === "error") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <ApplyLayout activeItem="apply">
        <LoadingSection>
          <LoadingSpinner label="교사 신청 페이지를 불러오는 중" />
        </LoadingSection>
      </ApplyLayout>
    );
  }

  return (
    <ApplyLayout activeItem="apply">
      <PageSection>
        <Title>교사 신청</Title>
        <NoticeBox>
          <NoticeList>
            {notices.map((notice) => (
              <NoticeItem key={notice}>{notice}</NoticeItem>
            ))}
          </NoticeList>
          <CautionText>
            연락 없이 면접, 참관수업과 같은 일정에 나오지 않는 등 소위 &apos;노쇼&apos;가 벌어지는
            경우가 많습니다.
          </CautionText>
          <CautionText>
            지원은 신중하게 해주시고 차후 참여하지 못하게 되셨을 경우 꼭 연락해주시기 바랍니다.
          </CautionText>
        </NoticeBox>
        <ActionRow>
          <ApplyActionLink href="/apply/write">지원서 작성하기</ApplyActionLink>
        </ActionRow>
      </PageSection>
    </ApplyLayout>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 4rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const Title = styled.h1`
  margin: 0 0 2rem;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-bottom: 3rem;
    font-size: 2.5rem;
  }
`;

const NoticeBox = styled.section`
  padding: 1.25rem;
  background-color: ${colors.pointSoft};
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 600;
  line-height: 2.08;

  @media (min-width: 120rem) {
    padding: 1.875rem;
    font-size: ${typography.fontSize24};
  }
`;

const NoticeList = styled.ul`
  display: grid;
  gap: 0;
  margin: 0 0 1.75rem;
  padding-left: 1.5rem;

  @media (min-width: 120rem) {
    margin-bottom: 2.625rem;
    padding-left: 2.25rem;
  }
`;

const NoticeItem = styled.li`
  padding-left: 0.25rem;
`;

const CautionText = styled.p`
  margin: 0;

  & + & {
    margin-top: 0.25rem;

    @media (min-width: 120rem) {
      margin-top: 0.375rem;
    }
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2.1875rem;

  @media (min-width: 120rem) {
    margin-top: 3.25rem;
  }
`;

const LoadingSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - ${layout.headerHeight});
  padding: ${spacing.space40} ${spacing.space20};
`;
