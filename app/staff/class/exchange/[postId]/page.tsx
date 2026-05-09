"use client";

import { ExchangePostView } from "./ExchangePostView";
import { useExchangePostPage } from "./useExchangePostPage";

export default function ExchangePostPage() {
  const {
    acceptedHref,
    cancelRequestMutation,
    createProposalMutation,
    detailClassName,
    detailContent,
    detailCreatedDate,
    detailExpiresAtDisplay,
    detailLessonDate,
    detailStatus,
    detailStatusTone,
    detailTitle,
    detailWriter,
    editContent,
    editExpiresAt,
    editLessonDate,
    editTitle,
    handleCancelEdit,
    handleDeleteClick,
    handleProposalSubmit,
    handleSaveEdit,
    handleStartEdit,
    isAuthenticated,
    isEditingRequest,
    isError,
    isLoading,
    isValidPostId,
    proposalClassroomNameDraft,
    proposalContent,
    proposalLessonDate,
    proposalList,
    proposalWriterDraft,
    proposalsIsError,
    proposalsLoading,
    setEditContent,
    setEditExpiresAt,
    setEditLessonDate,
    setEditTitle,
    setProposalClassroomNameDraft,
    setProposalContent,
    setProposalLessonDate,
    setProposalWriterDraft,
    updateRequestMutation,
  } = useExchangePostPage();

  const canDelete =
    isAuthenticated &&
    isValidPostId &&
    !cancelRequestMutation.isPending &&
    !updateRequestMutation.isPending;
  const canEdit =
    isAuthenticated && isValidPostId && !isLoading && !isError && !cancelRequestMutation.isPending;

  return (
    <ExchangePostView
      acceptedHref={acceptedHref}
      canDelete={canDelete}
      canEdit={canEdit}
      cancelPending={cancelRequestMutation.isPending}
      createProposalPending={createProposalMutation.isPending}
      detailClassName={detailClassName}
      detailContent={detailContent}
      detailCreatedDate={detailCreatedDate}
      detailExpiresAtDisplay={detailExpiresAtDisplay}
      detailLessonDate={detailLessonDate}
      detailStatus={detailStatus}
      detailStatusTone={detailStatusTone}
      detailTitle={detailTitle}
      detailWriter={detailWriter}
      editContent={editContent}
      editExpiresAt={editExpiresAt}
      editLessonDate={editLessonDate}
      editTitle={editTitle}
      isEditingRequest={isEditingRequest}
      isUpdating={updateRequestMutation.isPending}
      proposalClassroomNameDraft={proposalClassroomNameDraft}
      proposalContent={proposalContent}
      proposalLessonDate={proposalLessonDate}
      proposalList={proposalList}
      proposalWriterDraft={proposalWriterDraft}
      proposalsIsError={proposalsIsError}
      proposalsLoading={proposalsLoading}
      onCancelEdit={handleCancelEdit}
      onDelete={handleDeleteClick}
      onSaveEdit={handleSaveEdit}
      onStartEdit={handleStartEdit}
      onSubmitProposal={handleProposalSubmit}
      setEditContent={setEditContent}
      setEditExpiresAt={setEditExpiresAt}
      setEditLessonDate={setEditLessonDate}
      setEditTitle={setEditTitle}
      setProposalClassroomNameDraft={setProposalClassroomNameDraft}
      setProposalContent={setProposalContent}
      setProposalLessonDate={setProposalLessonDate}
      setProposalWriterDraft={setProposalWriterDraft}
    />
  );
}
