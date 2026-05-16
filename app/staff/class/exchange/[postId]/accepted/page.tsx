"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { colors, layout, spacing } from "@/styles/tokens";
import { Button } from "@/components/common/VariantButton";
import { ExchangeProposalList } from "@/components/staff/class/ExchangeProposalList";
import { ExchangePostDetail } from "@/components/staff/class/ExchangeRequestDetail";
import { useExchangePostPage } from "../useExchangePostPage";

export default function ExchangeAcceptedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = useExchangePostPage();
  const proposalId = Number(searchParams.get("proposalId"));

  const acceptedProposals =
    Number.isInteger(proposalId) && proposalId > 0
      ? page.proposals.filter((proposal) => proposal.id === proposalId)
      : [];

  return (
    <PageWrapper>
      <TopButtonRow>
        <Button type="button" $variant="neutral" onClick={() => router.push("/staff/class/exchange")}>
          목록
        </Button>
      </TopButtonRow>

      <ContentColumn>
        <PostSection>
          <ExchangePostDetail page={page} showExpiresAt={false} />

          <TargetSection>
            <TargetTitle>교환 대상</TargetTitle>
            <ExchangeProposalList
              acceptedHref={`/staff/class/exchange/${page.postId}`}
              acceptLabel="교환 대상 변경하기"
              showCardTopBorder={false}
              proposals={acceptedProposals}
              proposalsLoading={page.proposalsLoading}
              proposalsError={page.proposalsError}
            />
          </TargetSection>
        </PostSection>
      </ContentColumn>
    </PageWrapper>
  );
}

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 1.8125rem 3.125rem 4rem;
  background: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const TopButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PostSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const TargetTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;

  @media (min-width: 120rem) {
    font-size: 1.25rem;
  }
`;

const TargetSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};
  margin-top: ${spacing.space12};
  padding-bottom: ${spacing.space20};
  border-bottom: 0.5px solid #d3d3d3;

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
    margin-top: ${spacing.space20};
    padding-bottom: 1.875rem;
  }
`;

