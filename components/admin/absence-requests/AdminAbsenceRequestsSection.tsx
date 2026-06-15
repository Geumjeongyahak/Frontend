"use client";

import { AdminAbsenceRequestsListPanel } from "@/components/admin/absence-requests/AdminAbsenceRequestsListPanel";
import { useAdminAbsenceRequests } from "@/components/admin/absence-requests/useAdminAbsenceRequests";

export function AdminAbsenceRequestsSection() {
  const absenceRequests = useAdminAbsenceRequests();

  return (
    <AdminAbsenceRequestsListPanel
      statusFilter={absenceRequests.statusFilter}
      keywordInput={absenceRequests.keywordInput}
      handleKeywordInputChange={absenceRequests.handleKeywordInputChange}
      handleSearch={absenceRequests.handleSearch}
      handleStatusFilterChange={absenceRequests.handleStatusFilterChange}
      absenceRequestsQuery={absenceRequests.absenceRequestsQuery}
      sortedRequests={absenceRequests.sortedRequests}
      selectedAbsenceId={absenceRequests.selectedAbsenceId}
      selectedAbsence={absenceRequests.selectedAbsence}
      selectAbsence={absenceRequests.selectAbsence}
      resetSelection={absenceRequests.resetSelection}
      currentPage={absenceRequests.currentPage}
      totalPages={absenceRequests.totalPages}
      goToPrevPage={absenceRequests.goToPrevPage}
      goToNextPage={absenceRequests.goToNextPage}
      goToPage={absenceRequests.goToPage}
      rejectNote={absenceRequests.rejectNote}
      setRejectNote={absenceRequests.setRejectNote}
      handleApprove={absenceRequests.handleApprove}
      handleReject={absenceRequests.handleReject}
      isActionPending={absenceRequests.isActionPending}
    />
  );
}
