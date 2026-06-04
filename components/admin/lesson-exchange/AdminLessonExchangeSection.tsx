"use client";

import { AdminLessonExchangeRequestsDetailPanel } from "@/components/admin/lesson-exchange/AdminLessonExchangeRequestsDetailPanel";
import { AdminLessonExchangeRequestsListPanel } from "@/components/admin/lesson-exchange/AdminLessonExchangeRequestsListPanel";
import { useAdminLessonExchangeRequests } from "@/components/admin/lesson-exchange/useAdminLessonExchangeRequests";
import { TwoColumnGrid } from "@/components/admin/AdminDashboardSectionParts";

export function AdminLessonExchangeSection() {
  const viewModel = useAdminLessonExchangeRequests();

  return (
    <TwoColumnGrid>
      <AdminLessonExchangeRequestsListPanel viewModel={viewModel} />
      <AdminLessonExchangeRequestsDetailPanel viewModel={viewModel} />
    </TwoColumnGrid>
  );
}
