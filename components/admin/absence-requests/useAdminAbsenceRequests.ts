"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAbsenceRequest,
  getAbsenceRequests,
  rejectAbsenceRequest,
} from "@/api/request/request.api";
import type { AbsenceRequestResponseDto, RequestStatusQueryParamsDto } from "@/api/request/request.dto";
import {
  ABSENCE_ITEMS_PER_PAGE,
  type AbsenceStatusFilter,
} from "@/components/admin/absence-requests/absenceRequestConstants";
import { queryKeys } from "@/lib/queryKeys";

export function useAdminAbsenceRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<AbsenceStatusFilter>("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const absenceRequestsQuery = useQuery({
    queryKey: [...queryKeys.requests.absenceList(), statusFilter, keyword, page, ABSENCE_ITEMS_PER_PAGE],
    queryFn: () => {
      const query: RequestStatusQueryParamsDto = {
        keyword: keyword.trim() || undefined,
        page: page - 1,
        size: ABSENCE_ITEMS_PER_PAGE,
      };

      if (statusFilter) {
        query.status = statusFilter as RequestStatusQueryParamsDto["status"];
      }

      return getAbsenceRequests(query);
    },
  });

  const totalPages = Math.max(1, absenceRequestsQuery.data?.totalPages ?? 1);
  const currentPage = page <= totalPages ? page : totalPages;

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.absenceList() });
  };

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => approveAbsenceRequest({ requestId }),
    onMutate: (requestId) => {
      setPendingActionId(requestId);
    },
    onSuccess: () => {
      invalidateList();
      setRejectNote("");
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, note }: { requestId: number; note: string }) =>
      rejectAbsenceRequest({ requestId }, { note }),
    onMutate: ({ requestId }) => {
      setPendingActionId(requestId);
    },
    onSuccess: () => {
      invalidateList();
      setRejectNote("");
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const sortedRequests = useMemo(
    () => {
      const absenceRequests = absenceRequestsQuery.data?.content ?? [];

      return [...absenceRequests].sort((a, b) => {
        const aTime = new Date(a.createdAt ?? a.lessonDate ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? b.lessonDate ?? 0).getTime();
        return bTime - aTime;
      });
    },
    [absenceRequestsQuery.data?.content],
  );

  const selectedAbsence = useMemo(
    () => sortedRequests.find((item) => item.id === selectedAbsenceId) ?? null,
    [sortedRequests, selectedAbsenceId],
  );

  const resetSelection = () => {
    setSelectedAbsenceId(null);
    setRejectNote("");
  };

  const handleSearch = () => {
    setKeyword(keywordInput);
    setPage(1);
    resetSelection();
  };

  const handleKeywordInputChange = (value: string) => {
    setKeywordInput(value);
    setKeyword(value);
    setPage(1);
    resetSelection();
  };

  const handleStatusFilterChange = (value: AbsenceStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    resetSelection();
  };

  const selectAbsence = (item: AbsenceRequestResponseDto) => {
    if (!item.id) return;
    setSelectedAbsenceId(item.id);
    setRejectNote("");
  };

  const goToPrevPage = () => {
    setPage((current) => Math.max(1, current - 1));
    resetSelection();
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
    resetSelection();
  };

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
    resetSelection();
  };

  const handleApprove = () => {
    const requestId = selectedAbsence?.id;
    if (!requestId || approveMutation.isPending) return;
    approveMutation.mutate(requestId);
  };

  const handleReject = () => {
    const requestId = selectedAbsence?.id;
    if (!requestId || rejectMutation.isPending) return;

    const note = rejectNote.trim();
    if (!note) return;

    rejectMutation.mutate({ requestId, note });
  };

  const isActionPending =
    pendingActionId === selectedAbsenceId && (approveMutation.isPending || rejectMutation.isPending);

  return {
    statusFilter,
    keywordInput,
    handleKeywordInputChange,
    handleSearch,
    handleStatusFilterChange,
    absenceRequestsQuery,
    sortedRequests,
    selectedAbsenceId,
    selectedAbsence,
    selectAbsence,
    resetSelection,
    currentPage,
    totalPages,
    goToPrevPage,
    goToNextPage,
    goToPage,
    rejectNote,
    setRejectNote,
    handleApprove,
    handleReject,
    isActionPending,
  };
}

export type AdminAbsenceRequestsViewModel = ReturnType<typeof useAdminAbsenceRequests>;
