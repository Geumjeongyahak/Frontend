"use client";

import { AdminLessonExchangeRequestsListPanel } from "@/components/admin/lesson-exchange/AdminLessonExchangeRequestsListPanel";
import { useAdminLessonExchangeRequests } from "@/components/admin/lesson-exchange/useAdminLessonExchangeRequests";

export function AdminLessonExchangeSection() {
  const viewModel = useAdminLessonExchangeRequests();

  return <AdminLessonExchangeRequestsListPanel viewModel={viewModel} />;
}
