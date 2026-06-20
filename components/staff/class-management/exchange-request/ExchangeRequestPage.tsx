"use client";

import { useRef } from "react";
import { IconCalendarMonth } from "@tabler/icons-react";
import styled from "styled-components";
import { FieldInput, FieldTextarea } from "@/components/common/FormField";
import { Button } from "@/components/common/VariantButton";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { ExchangeRequestActionBar } from "./ExchangeRequestActionBar";
import { ExchangePostDetail } from "./ExchangeRequestDetail";
import { ExchangeProposalList } from "./ExchangeProposalList";
import { useExchangePostPage } from "@/app/staff/class-management/exchange-request/[postId]/useExchangePostPage";

interface ExchangeRequestPageProps {
  page: ReturnType<typeof useExchangePostPage>;
}

export function ExchangeRequestPage({ page }: ExchangeRequestPageProps) {
  const lessonDateInputRef = useRef<HTMLInputElement>(null);
  const lessonDateValue = page.proposalForm.watch("lessonDate");

  const handleOpenDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const dateInput = ref.current;
    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.click();
  };

  const handleProposalLessonDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) return;

    const [year, month, day] = value.split("-");
    page.proposalForm.setValue("lessonDate", `${year.slice(-2)}.${month}.${day}`, {
      shouldDirty: true,
    });
  };

  return (
    <PageWrapper>
      <ExchangeRequestActionBar
        canDelete={page.canDelete}
        canEdit={page.canEdit}
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
        {!page.isEditing && page.showProposalSection ? (
          <>
            <Divider />

            {page.showProposalMessage ? (
              <ProposalMessage>{page.proposalMessage}</ProposalMessage>
            ) : null}

            {page.showProposalForm ? (
              <>
                <ProposalHeader>
                  <ProposalTitle>{page.proposalListTitle}</ProposalTitle>

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
                    aria-label="작성자"
                    placeholder="작성자"
                    type="text"
                    value={page.user?.name ?? ""}
                    readOnly
                  />
                  {page.assignmentClassNames.length > 0 ? (
                    <ProposalSelect
                      aria-label="반 이름"
                      value={page.proposalForm.watch("className")}
                      {...page.proposalForm.register("className")}
                    >
                      <option value="" disabled>
                        반을 선택해 주세요
                      </option>
                      {page.assignmentClassNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </ProposalSelect>
                  ) : (
                    <FieldInput
                      $tone="proposal"
                      aria-label="반 이름"
                      placeholder="반 이름"
                      type="text"
                      value={page.proposalClassName}
                      readOnly
                    />
                  )}
                  <DateRow>
                    <DateInput
                      aria-label="수업 일자"
                      placeholder="00.00.00"
                      value={lessonDateValue}
                      readOnly
                      onClick={() => handleOpenDatePicker(lessonDateInputRef)}
                    />
                    <HiddenNativeDateInput
                      ref={lessonDateInputRef}
                      type="date"
                      onChange={handleProposalLessonDateChange}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <CalendarButton
                      type="button"
                      aria-label="수업 일자 달력 열기"
                      onClick={() => handleOpenDatePicker(lessonDateInputRef)}
                    >
                      <IconCalendarMonth size={16} stroke={2} color={colors.white} />
                    </CalendarButton>
                  </DateRow>

                  <ProposalFormTextarea
                    $tone="proposal"
                    placeholder="내용"
                    rows={6}
                    {...page.proposalForm.register("content")}
                  />
                </ProposalForm>
              </>
            ) : null}

            {page.showProposalList ? (
              <>
                {!page.showProposalForm ? (
                  <ProposalTitle>{page.proposalListTitle}</ProposalTitle>
                ) : null}

                <ExchangeProposalList
                  acceptedHref={`/staff/class-management/exchange-request/${page.postId}`}
                  acceptLabel={page.canChangeExchangeTarget ? "교환 대상 변경하기" : "제안 수락하기"}
                  withdrawAcceptedLabel="교환 제안 철회"
                  showAcceptLink={page.canAcceptProposal || page.canChangeExchangeTarget}
                  showCardTopBorder={!page.canChangeExchangeTarget}
                  isAccepting={page.isAcceptingProposal}
                  canManageProposal={page.canManageProposal}
                  canWithdrawAcceptedProposal={page.canWithdrawAcceptedProposal}
                  editingProposalId={page.editingProposalId}
                  editingProposalValues={page.editingProposalValues}
                  isUpdatingProposal={page.isUpdatingProposal}
                  isDeletingProposal={page.isDeletingProposal}
                  onAcceptProposal={
                    page.canChangeExchangeTarget
                      ? () => page.changeExchangeTarget()
                      : (proposal) => {
                          if (proposal.id) page.acceptProposal(proposal.id);
                        }
                  }
                  onStartProposalEdit={page.startProposalEdit}
                  onCancelProposalEdit={page.cancelProposalEdit}
                  onSaveProposalEdit={page.saveProposalEdit}
                  onDeleteProposal={page.deleteProposal}
                  onWithdrawAcceptedProposal={page.withdrawAcceptedProposal}
                  onProposalEditValueChange={(patch) =>
                    page.setEditingProposalValues((current) => ({ ...current, ...patch }))
                  }
                  assignmentClassNames={page.assignmentClassNames}
                  proposalClassName={page.proposalClassName}
                  proposals={page.proposals}
                  proposalsLoading={page.proposalsLoading}
                  proposalsError={page.proposalsError}
                />
              </>
            ) : null}
          </>
        ) : null}
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
  border-top: 1px solid #c0c0c0;
  margin: 0;
`;

const ProposalMessage = styled.p`
  margin: 0;
  color: #878787;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
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

const ProposalSelect = styled.select`
  width: 100%;
  min-width: 0;
  min-height: 2.6875rem;
  border: 0.5px solid #c0c0c0;
  background: #ffffff;
  padding: 0.8125rem ${spacing.space12};
  padding-right: 2rem;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  appearance: none;
  outline: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #8c8c8c 50%),
    linear-gradient(135deg, #8c8c8c 50%, transparent 50%);
  background-position:
    calc(100% - 1rem) calc(50% - 2px),
    calc(100% - 0.6875rem) calc(50% - 2px);
  background-size:
    0.375rem 0.375rem,
    0.375rem 0.375rem;
  background-repeat: no-repeat;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalFormTextarea = styled(FieldTextarea)`
  grid-column: 1 / -1;
  background: #ffffff;
`;

const DateRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  min-height: 2.6875rem;
  padding: 0.4375rem ${spacing.space12};
  border: 0.5px solid #c0c0c0;
  background: #ffffff;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: 0.625rem ${spacing.space20};
  }
`;

const DateInput = styled.input`
  width: 100%;
  min-width: 0;
  background: transparent;
  border: 0;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const HiddenNativeDateInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const CalendarButton = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin-left: ${spacing.space8};
  border: 0;
  border-radius: 50%;
  background: ${colors.point};
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;
  }
`;
