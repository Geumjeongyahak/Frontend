"use client";

import { AdminAbsenceRequestsDetailPanel } from "@/components/admin/absence-requests/AdminAbsenceRequestsDetailPanel";
import { AdminAbsenceRequestsListPanel } from "@/components/admin/absence-requests/AdminAbsenceRequestsListPanel";
import { useAdminAbsenceRequests } from "@/components/admin/absence-requests/useAdminAbsenceRequests";
import { TwoColumnGrid } from "@/components/admin/AdminDashboardSectionParts";

export function AdminAbsenceRequestsSection() {
  const absenceRequests = useAdminAbsenceRequests();

  return (
    <TwoColumnGrid>
      <AdminAbsenceRequestsListPanel
        statusFilter={absenceRequests.statusFilter}
        keywordInput={absenceRequests.keywordInput}
        setKeywordInput={absenceRequests.setKeywordInput}
        handleSearch={absenceRequests.handleSearch}
        handleStatusFilterChange={absenceRequests.handleStatusFilterChange}
        absenceRequestsQuery={absenceRequests.absenceRequestsQuery}
        sortedRequests={absenceRequests.sortedRequests}
        selectedAbsenceId={absenceRequests.selectedAbsenceId}
        selectAbsence={absenceRequests.selectAbsence}
        currentPage={absenceRequests.currentPage}
        totalPages={absenceRequests.totalPages}
        goToPrevPage={absenceRequests.goToPrevPage}
        goToNextPage={absenceRequests.goToNextPage}
      />
      <AdminAbsenceRequestsDetailPanel
        selectedAbsence={absenceRequests.selectedAbsence}
        rejectNote={absenceRequests.rejectNote}
        setRejectNote={absenceRequests.setRejectNote}
        handleApprove={absenceRequests.handleApprove}
        handleReject={absenceRequests.handleReject}
        isActionPending={absenceRequests.isActionPending}
      />
    </TwoColumnGrid>
  );
}
