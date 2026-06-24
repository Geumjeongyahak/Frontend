"use client";

import { useRef } from "react";
import Link from "next/link";
import { IconCalendarMonth } from "@tabler/icons-react";
import styled from "styled-components";
import type { LessonExchangeProposalDto } from "@/api/lessonExchange/lessonExchange.dto";
import { FieldInput, FieldTextarea } from "@/components/common/FormField";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

interface ExchangeProposalListProps {
  acceptedHref: string | ((proposal: LessonExchangeProposalDto) => string);
  acceptLabel?: string;
  showAcceptLink?: boolean;
  showCardTopBorder?: boolean;
  isAccepting?: boolean;
  onAcceptProposal?: (proposal: LessonExchangeProposalDto) => void;
  canManageProposal?: (proposal: LessonExchangeProposalDto) => boolean;
  editingProposalId?: number | null;
  editingProposalValues?: {
    className: string;
    lessonDate: string;
    content: string;
  };
  isUpdatingProposal?: boolean;
  isDeletingProposal?: boolean;
  onStartProposalEdit?: (proposal: LessonExchangeProposalDto) => void;
  onCancelProposalEdit?: () => void;
  onSaveProposalEdit?: (proposalId: number) => void;
  onDeleteProposal?: (proposalId: number) => void;
  onProposalEditValueChange?: (patch: {
    className?: string;
    lessonDate?: string;
    content?: string;
  }) => void;
  assignmentClassNames?: string[];
  proposalClassName?: string;
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
  canManageProposal,
  editingProposalId = null,
  editingProposalValues,
  isUpdatingProposal = false,
  isDeletingProposal = false,
  onStartProposalEdit,
  onCancelProposalEdit,
  onSaveProposalEdit,
  onDeleteProposal,
  onProposalEditValueChange,
  assignmentClassNames = [],
  proposalClassName = "",
  proposals,
  proposalsLoading,
  proposalsError,
}: ExchangeProposalListProps) {
  const lessonDateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDatePicker = () => {
    const dateInput = lessonDateInputRef.current;
    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.click();
  };

  const handleLessonDateChange = (value: string) => {
    if (!value) return;

    const [year, month, day] = value.split("-");
    onProposalEditValueChange?.({
      lessonDate: `${year.slice(-2)}.${month}.${day}`,
    });
  };

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
          const canShowManageActions = canManageProposal?.(proposal) ?? false;
          const isEditingProposal =
            typeof proposal.id === "number" && editingProposalId === proposal.id;
          const shouldRenderFooter = canShowAccept || Boolean(canManageProposal);

          return (
            <ProposalCard key={proposal.id ?? index} $showTopBorder={showCardTopBorder}>
              <ProposalDate>{formatUtcToKstShortDate(proposal.createdAt) || "—"}</ProposalDate>
              {isEditingProposal ? (
                <ProposalEditForm>
                  <FieldInput
                    $tone="proposal"
                    aria-label="작성자"
                    placeholder="작성자"
                    type="text"
                    value={proposal.proposedByName ?? ""}
                    readOnly
                  />

                  {assignmentClassNames.length > 0 ? (
                    <EditClassSelect
                      aria-label="반 이름"
                      value={editingProposalValues?.className ?? ""}
                      onChange={(event) =>
                        onProposalEditValueChange?.({ className: event.target.value })
                      }
                    >
                      <option value="" disabled>
                        반을 선택해 주세요
                      </option>
                      {assignmentClassNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </EditClassSelect>
                  ) : (
                    <FieldInput
                      $tone="proposal"
                      aria-label="반 이름"
                      placeholder="반 이름"
                      type="text"
                      value={editingProposalValues?.className || proposalClassName || ""}
                      readOnly
                    />
                  )}

                  <DateRow onClick={handleOpenDatePicker}>
                    <EditDateInput
                      aria-label="수업 일자"
                      placeholder="00.00.00"
                      value={editingProposalValues?.lessonDate ?? ""}
                      readOnly
                      onClick={handleOpenDatePicker}
                    />
                    <HiddenNativeDateInput
                      ref={lessonDateInputRef}
                      type="date"
                      onChange={(event) => handleLessonDateChange(event.target.value)}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <CalendarIconWrap aria-hidden="true">
                      <IconCalendarMonth size={16} stroke={2} color={colors.white} />
                    </CalendarIconWrap>
                  </DateRow>

                  <ProposalEditTextarea
                    $tone="proposal"
                    placeholder="내용"
                    rows={6}
                    value={editingProposalValues?.content ?? ""}
                    onChange={(event) =>
                      onProposalEditValueChange?.({ content: event.target.value })
                    }
                  />
                </ProposalEditForm>
              ) : (
                <>
                  <ProposalMetaRow>
                    <ProposalMetaCell>
                      <MetaLabel>작성자</MetaLabel>
                      <MetaValue>{proposal.proposedByName ?? "—"}</MetaValue>
                    </ProposalMetaCell>

                    <ProposalMetaCell>
                      <MetaLabel>반 이름</MetaLabel>
                      <MetaValue>{proposal.classroomName ?? "—"}</MetaValue>
                    </ProposalMetaCell>

                    <ProposalMetaCell>
                      <MetaLabel>수업일자</MetaLabel>
                      <MetaValue>{formatUtcToKstShortDate(proposal.lessonDate) || "—"}</MetaValue>
                    </ProposalMetaCell>
                  </ProposalMetaRow>
                  <ProposalContent>{proposal.content ?? "—"}</ProposalContent>
                </>
              )}

              {shouldRenderFooter ? (
                <ProposalFooter>
                  <ManageActionGroup>
                    {canShowManageActions ? (
                      isEditingProposal ? (
                        <>
                          <ActionSecondaryButton
                            type="button"
                            disabled={isUpdatingProposal}
                            onClick={onCancelProposalEdit}
                          >
                            취소
                          </ActionSecondaryButton>
                          {typeof proposal.id === "number" ? (
                            <ActionPrimaryButton
                              type="button"
                              disabled={isUpdatingProposal}
                              onClick={() => onSaveProposalEdit?.(proposal.id as number)}
                            >
                              {isUpdatingProposal ? "수정 중" : "수정 완료"}
                            </ActionPrimaryButton>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <TextActionButton
                            type="button"
                            $tone="danger"
                            disabled={isDeletingProposal}
                            onClick={() => {
                              if (typeof proposal.id === "number") {
                                onDeleteProposal?.(proposal.id);
                              }
                            }}
                          >
                            {isDeletingProposal ? "삭제 중" : "삭제"}
                          </TextActionButton>
                          <TextActionButton
                            type="button"
                            onClick={() => onStartProposalEdit?.(proposal)}
                          >
                            수정
                          </TextActionButton>
                        </>
                      )
                    ) : !isEditingProposal ? (
                      <>
                        <ActionGhostButton aria-hidden="true" tabIndex={-1}>
                          삭제
                        </ActionGhostButton>
                        <ActionGhostButton aria-hidden="true" tabIndex={-1}>
                          수정
                        </ActionGhostButton>
                      </>
                    ) : null}
                  </ManageActionGroup>

                  {canShowAccept ? (
                    <AcceptActionGroup>
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
                    </AcceptActionGroup>
                  ) : null}
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
  gap: ${spacing.space8};
  padding: 0 0.5rem ${spacing.space12};
  border-bottom: 0.5px solid #d3d3d3;

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    padding: ${spacing.space8} 0.75rem 1.25rem;
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

const ProposalEditForm = styled.div`
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

const ProposalMetaCell = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.625rem ${spacing.space12};

  @media (min-width: 120rem) {
    min-height: 4rem;
    gap: 0.625rem;
    padding: 0.875rem ${spacing.space20};
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
  padding: 0rem ${spacing.space12};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  white-space: pre-wrap;
  margin-bottom: 1.5rem;

  @media (min-width: 120rem) {
    padding: 0rem ${spacing.space20};
    margin-bottom: 2rem;
    font-size: ${typography.fontSize20};
  }
`;

const ProposalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space12};
  padding-left: ${spacing.space12};
  margin-bottom: -${spacing.space8};

  @media (min-width: 120rem) {
    padding-left: ${spacing.space20};
    margin-bottom: -${spacing.space12};
  }
`;

const ManageActionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space12};
  min-width: 5rem;

  @media (min-width: 120rem) {
    min-width: 7.5rem;
  }
`;

const AcceptActionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 6.5rem;

  @media (min-width: 120rem) {
    min-width: 9rem;
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

const EditClassSelect = styled.select`
  min-width: 0;
  width: 100%;
  min-height: 2.6875rem;
  border: 0.5px solid #c0c0c0;
  background: #ffffff;
  padding: 0.8125rem ${spacing.space12};
  padding-right: 2rem;
  font-size: ${typography.fontSize14};
  font-weight: 400;
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

const TextActionButton = styled.button<{ $tone?: "default" | "danger" }>`
  border: 0;
  padding: 0;
  background: transparent;
  color: ${({ $tone }) => ($tone === "danger" ? colors.notice : "#b3b3b3")};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;
  cursor: pointer;

  &:not(:disabled):hover {
    color: ${({ $tone }) => ($tone === "danger" ? colors.notice : colors.point)};
    opacity: 0.72;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ActionGhostButton = styled(TextActionButton).attrs({
  type: "button",
  disabled: true,
})`
  visibility: hidden;
  pointer-events: none;
`;

const ActionPillButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  border-radius: ${radii.radius15};
  padding: 0.8125rem ${spacing.space20};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ActionSecondaryButton = styled(ActionPillButton)`
  border: 1px solid ${colors.border};
  background: ${colors.white};
  color: ${colors.placeholder};

  &:not(:disabled):hover {
    background: ${colors.background};
  }
`;

const ActionPrimaryButton = styled(ActionPillButton)`
  border: 1px solid ${colors.point};
  background: ${colors.white};
  color: ${colors.point};

  &:not(:disabled):hover {
    background: ${colors.pointSoft};
  }
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

const EditDateInput = styled.input`
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

const CalendarIconWrap = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin-left: ${spacing.space8};
  border-radius: 50%;
  background: ${colors.point};

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;
  }
`;

const ProposalEditTextarea = styled(FieldTextarea)`
  grid-column: 1 / -1;
  background: #ffffff;
`;
