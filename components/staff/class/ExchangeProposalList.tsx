"use client";

import Link from "next/link";
import styled from "styled-components";
import type { LessonExchangeProposalDto } from "@/api/lessonExchange/lessonExchange.dto";
import { layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

interface ExchangeProposalListProps {
  acceptedHref: string;
  proposals: LessonExchangeProposalDto[];
  proposalsLoading: boolean;
  proposalsError: boolean;
}

export function ExchangeProposalList({
  acceptedHref,
  proposals,
  proposalsLoading,
  proposalsError,
}: ExchangeProposalListProps) {
  return (
    <ProposalList>
      {proposalsLoading ? (
        <ProposalPlaceholder>제안 목록을 불러오는 중…</ProposalPlaceholder>
      ) : proposalsError ? (
        <ProposalPlaceholder role="alert">
          교환 제안 목록을 불러오지 못했습니다.
        </ProposalPlaceholder>
      ) : proposals.length === 0 ? (
        <ProposalPlaceholder>등록된 교환 제안이 없습니다.</ProposalPlaceholder>
      ) : (
        proposals.map((proposal, index) => (
          <ProposalCard key={proposal.id ?? index}>
            <ProposalMetaRow>
              <ProposalMetaCell>
                <MetaLabel>반 이름</MetaLabel>
                <MetaValue>{proposal.classroomName ?? "—"}</MetaValue>
              </ProposalMetaCell>

              <ProposalMetaCell>
                <MetaLabel>수업 일자</MetaLabel>
                <MetaValue>{formatUtcToKstShortDate(proposal.lessonDate) || "—"}</MetaValue>
              </ProposalMetaCell>

              <ProposalMetaCell>
                <MetaLabel>작성자</MetaLabel>
                <MetaValue>{proposal.proposedByName ?? "—"}</MetaValue>
              </ProposalMetaCell>
            </ProposalMetaRow>

            <ProposalContent>{proposal.content ?? "—"}</ProposalContent>

            <ProposalFooter>
              <ProposalDate>{formatUtcToKstShortDate(proposal.createdAt) || "—"}</ProposalDate>
              <AcceptLink href={acceptedHref}>제안 수락하기</AcceptLink>
            </ProposalFooter>
          </ProposalCard>
        ))
      )}
    </ProposalList>
  );
}

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};
`;

const ProposalPlaceholder = styled.p`
  margin: 0;
  padding: ${spacing.space20} 0;
  color: #878787;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ProposalCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.8125rem;
  padding-top: ${spacing.space20};
  border-top: 1px solid #a9a9a9;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: 1.875rem;
  }
`;

const ProposalMetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};
  width: 100%;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProposalMetaCell = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f8f8f8;

  @media (min-width: 120rem) {
    min-height: 4rem;
    gap: 0.625rem;
    padding: ${spacing.space20};
  }
`;

const MetaLabel = styled.span`
  flex-shrink: 0;
  color: #878787;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const MetaValue = styled.span`
  min-width: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  word-break: break-word;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ProposalContent = styled.div`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f8f8f8;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space20};
  padding-left: ${spacing.space12};

  @media (min-width: 120rem) {
    padding-left: ${spacing.space20};
  }
`;

const ProposalDate = styled.span`
  color: #c0c0c0;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const AcceptLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  padding: 0.5625rem ${spacing.space16};
  border-radius: ${radii.radius12};
  background: #dcf4ea;
  color: #3da75c;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    min-height: 3rem;
    padding: 0.75rem ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
