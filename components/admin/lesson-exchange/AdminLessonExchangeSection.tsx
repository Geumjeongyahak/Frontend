"use client";

import { AdminLessonExchangeRequestsDetailPanel } from "@/components/admin/lesson-exchange/AdminLessonExchangeRequestsDetailPanel";
import { AdminLessonExchangeRequestsListPanel } from "@/components/admin/lesson-exchange/AdminLessonExchangeRequestsListPanel";
import { useAdminLessonExchangeRequests } from "@/components/admin/lesson-exchange/useAdminLessonExchangeRequests";
import { TwoColumnGrid } from "@/components/admin/AdminDashboardSectionParts";

export function AdminLessonExchangeSection() {
  const lessonExchangeRequests = useAdminLessonExchangeRequests();

  return (
    <TwoColumnGrid>
      <AdminLessonExchangeRequestsListPanel
        statusFilter={lessonExchangeRequests.statusFilter}
        keywordInput={lessonExchangeRequests.keywordInput}
        setKeywordInput={lessonExchangeRequests.setKeywordInput}
        handleSearch={lessonExchangeRequests.handleSearch}
        handleStatusFilterChange={lessonExchangeRequests.handleStatusFilterChange}
        lessonExchangeRequestsQuery={lessonExchangeRequests.lessonExchangeRequestsQuery}
        sortedRequests={lessonExchangeRequests.sortedRequests}
        selectedRequestId={lessonExchangeRequests.selectedRequestId}
        selectLessonExchangeRequest={lessonExchangeRequests.selectLessonExchangeRequest}
        currentPage={lessonExchangeRequests.currentPage}
        totalPages={lessonExchangeRequests.totalPages}
        goToPrevPage={lessonExchangeRequests.goToPrevPage}
        goToNextPage={lessonExchangeRequests.goToNextPage}
      />
      <AdminLessonExchangeRequestsDetailPanel
        selectedRequestId={lessonExchangeRequests.selectedRequestId}
        lessonExchangeDetailQuery={lessonExchangeRequests.lessonExchangeDetailQuery}
        rejectNote={lessonExchangeRequests.rejectNote}
        setRejectNote={lessonExchangeRequests.setRejectNote}
        handleApprove={lessonExchangeRequests.handleApprove}
        handleReject={lessonExchangeRequests.handleReject}
        isActionPending={lessonExchangeRequests.isActionPending}
      />
    </TwoColumnGrid>
  );
}
