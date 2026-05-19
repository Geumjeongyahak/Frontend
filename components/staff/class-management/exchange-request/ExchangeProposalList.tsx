"use client";

import Link from "next/link";
import styled from "styled-components";
import type { LessonExchangeProposalDto } from "@/api/lessonExchange/lessonExchange.dto";
import { layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

interface ExchangeProposalListProps {
  acceptedHref: string | ((proposal: LessonExchangeProposalDto) => string);
  acceptLabel?: string;
  showAcceptLink?: boolean;
  showCardTopBorder?: boolean;
  isAccepting?: boolean;
  onAcceptProposal?: (proposal: LessonExchangeProposalDto) => void;
  proposals: LessonExchangeProposalDto[];
  proposalsLoading: boolean;
  proposalsError: boolean;
}

export function ExchangeProposalList({
  acceptedHref,
  acceptLabel = "제안 수락하기",
  showAcceptLink = true,
  showCardTopBorder = true,
  isAccepting = false,
  onAcceptProposal,
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
        proposals.map((proposal, index) => {
          const acceptHref =
            typeof acceptedHref === "function" ? acceptedHref(proposal) : acceptedHref;
          const canShowAccept =
            showAcceptLink && (proposal.status === "ACTIVE" || proposal.status == null);

          return (
            <ProposalCard key={proposal.id ?? index} $showTopBorder={showCardTopBorder}>
              <ProposalDate>{formatUtcToKstShortDate(proposal.createdAt) || "—"}</ProposalDate>
              <ProposalMetaRow>
                <ProposalMetaCell>
                  <MetaLabel>반 이름</MetaLabel>
                  <MetaValue>{proposal.classroomName ?? "—"}</MetaValue>
                </ProposalMetaCell>

                <ProposalMetaCell>
                  <MetaLabel>작성자</MetaLabel>
                  <MetaValue>{proposal.proposedByName ?? "—"}</MetaValue>
                </ProposalMetaCell>

                <ProposalMetaCell>
                  <MetaLabel>수업일자</MetaLabel>
                  <MetaValue>{formatUtcToKstShortDate(proposal.lessonDate) || "—"}</MetaValue>
                </ProposalMetaCell>
              </ProposalMetaRow>

              <ProposalContent>{proposal.content ?? "—"}</ProposalContent>

              {canShowAccept ? (
                <ProposalFooter>
                  {onAcceptProposal ? (
                    <AcceptButton
                      type="button"
                      disabled={isAccepting}
                      onClick={() => onAcceptProposal(proposal)}
                    >
                      {acceptLabel}
                    </AcceptButton>
                  ) : (
                    <AcceptLink href={acceptHref}>{acceptLabel}</AcceptLink>
                  )}
                </ProposalFooter>
              ) : null}
            </ProposalCard>
          );
        })
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

const ProposalCard = styled.article<{ $showTopBorder: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.8125rem;
  padding-top: ${spacing.space20};
  border-top: ${({ $showTopBorder }) => ($showTopBorder ? "0.5px solid #d3d3d3" : "0")};

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

  @media (min-width: 120rem) {
    min-height: 4rem;
    gap: 0.625rem;
    padding: ${spacing.space20};
  }
`;

const MetaLabel = styled.span`
  flex-shrink: 0;
  color: #c0c0c0;
  font-weight: 500;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const MetaValue = styled.span`
  min-width: 0;
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
  justify-content: flex-end;
  gap: ${spacing.space20};
  padding-left: ${spacing.space12};

  @media (min-width: 120rem) {
    padding-left: ${spacing.space20};
  }
`;

const ProposalDate = styled.span`
  align-self: flex-end;
  color: #c0c0c0;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const acceptActionStyle = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #88cd5a;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const AcceptLink = styled(Link)`
  ${acceptActionStyle}
`;

const AcceptButton = styled.button`
  ${acceptActionStyle}
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
