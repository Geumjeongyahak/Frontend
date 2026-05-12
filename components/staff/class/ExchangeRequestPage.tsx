"use client";

import styled from "styled-components";
import { FieldInput, FieldTextarea } from "@/components/common/FormField";
import { Button } from "@/components/common/VariantButton";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { ExchangeRequestActionBar } from "./ExchangeRequestActionBar";
import { ExchangePostDetail } from "./ExchangeRequestDetail";
import { ExchangeProposalList } from "./ExchangeProposalList";
import { useExchangePostPage } from "@/app/staff/class/exchange/[postId]/useExchangePostPage";

interface ExchangeRequestPageProps {
  page: ReturnType<typeof useExchangePostPage>;
}

export function ExchangeRequestPage({ page }: ExchangeRequestPageProps) {
  const canDelete = page.isAuthenticated && page.isValidPostId;
  const isLocked =
    page.request?.status === "APPROVED" ||
    page.request?.status === "COMPLETED" ||
    page.request?.status === "REJECTED";

  const canEdit = page.isAuthenticated && page.isValidPostId && !page.requestError && !isLocked;
  const acceptedHref = `/staff/class/exchange/${page.postId}/accepted`;

  return (
    <PageWrapper>
      <ExchangeRequestActionBar
        canDelete={canDelete}
        canEdit={canEdit}
        isEditing={page.isEditing}
        isUpdating={page.isUpdating}
        onDelete={page.deleteRequest}
        onCancelEdit={page.cancelEdit}
        onSaveEdit={page.saveEdit}
        onStartEdit={page.startEdit}
        onBackToList={page.backToList}
      />

      <ContentColumn>
        <ExchangePostDetail page={page} />
        {!page.isEditing && (
          <>
            <Divider />

            <ProposalHeader>
              <ProposalTitle>교환 제안서</ProposalTitle>

              <Button
                type="submit"
                form="exchange-proposal-form"
                $variant="edit"
                disabled={page.isCreatingProposal}
              >
                작성 완료
              </Button>
            </ProposalHeader>

            <ProposalForm id="exchange-proposal-form" onSubmit={page.submitProposal}>
              <FieldInput
                $tone="proposal"
                aria-label="반 이름"
                placeholder="반 이름"
                type="text"
                value={page.user?.role ?? ""} //TODO: dto 반이름
                readOnly
              />
              <FieldInput
                $tone="proposal"
                aria-label="작성자"
                placeholder="작성자"
                type="text"
                value={page.user?.name ?? ""}
                readOnly
              />
              <FieldInput
                $tone="proposal"
                aria-label="수업 일자"
                placeholder="수업 일자"
                type="text"
                {...page.proposalForm.register("lessonDate")}
              />

              <ProposalFormTextarea
                $tone="proposal"
                placeholder="내용"
                rows={6}
                {...page.proposalForm.register("content")}
              />
            </ProposalForm>

            <ExchangeProposalList
              acceptedHref={acceptedHref}
              proposals={page.proposals}
              proposalsLoading={page.proposalsLoading}
              proposalsError={page.proposalsError}
            />
          </>
        )}
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

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1.3125rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space32};
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid #a9a9a9;
  margin: 0;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space24};
`;

const ProposalTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const ProposalForm = styled.form`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProposalFormTextarea = styled(FieldTextarea)`
  grid-column: 1 / -1;
  background: #ffffff;
`;
