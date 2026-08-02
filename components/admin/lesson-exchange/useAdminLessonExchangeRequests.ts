"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveLessonExchangeRequest,
  getLessonExchangeRequestDetail,
  getLessonExchangeRequests,
  rejectLessonExchangeRequest,
} from "@/api/lessonExchange/lessonExchange.api";
import type {
  LessonExchangeListQueryParamsDto,
  LessonExchangeRequestListItemDto,
} from "@/api/lessonExchange/lessonExchange.dto";
import {
  canProcessLessonExchangeRequest,
  LESSON_EXCHANGE_ITEMS_PER_PAGE,
  type LessonExchangeStatusFilter,
} from "@/components/admin/lesson-exchange/lessonExchangeRequestConstants";
import { queryKeys } from "@/lib/queryKeys";

export function useAdminLessonExchangeRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<LessonExchangeStatusFilter>("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const lessonExchangeRequestsQuery = useQuery({
    queryKey: [
      ...queryKeys.requests.lessonExchangeList(),
      "admin",
      statusFilter,
      keyword,
      page,
      LESSON_EXCHANGE_ITEMS_PER_PAGE,
    ],
    queryFn: () => {
      const query: LessonExchangeListQueryParamsDto = {
        keyword: keyword.trim() || undefined,
        page: page - 1,
        size: LESSON_EXCHANGE_ITEMS_PER_PAGE,
      };

      if (statusFilter) {
        query.status = statusFilter;
      }

      return getLessonExchangeRequests(query);
    },
    placeholderData: (previousData, previousQuery) => {
      if (!previousQuery) {
        return undefined;
      }

      return previousQuery.queryKey[0] === "lesson-exchange-requests" &&
      previousQuery.queryKey[1] === "admin" &&
      previousQuery.queryKey[2] === statusFilter &&
      previousQuery.queryKey[3] === keyword &&
      previousQuery.queryKey[5] === LESSON_EXCHANGE_ITEMS_PER_PAGE
        ? previousData
        : undefined;
    },
  });

  const totalPages = Math.max(1, lessonExchangeRequestsQuery.data?.totalPages ?? 1);
  const currentPage = page <= totalPages ? page : totalPages;

  const lessonExchangeDetailQuery = useQuery({
    queryKey: queryKeys.requests.lessonExchangeDetail(selectedRequestId ?? 0),
    queryFn: () => getLessonExchangeRequestDetail({ requestId: selectedRequestId! }),
    enabled: selectedRequestId !== null,
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.lessonExchangeList() });
    if (selectedRequestId !== null) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(selectedRequestId),
      });
    }
  };

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => approveLessonExchangeRequest({ requestId }),
    onMutate: (requestId) => {
      setPendingActionId(requestId);
    },
    onSuccess: () => {
      invalidateQueries();
      setRejectNote("");
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, note }: { requestId: number; note: string }) =>
      rejectLessonExchangeRequest({ requestId }, { note }),
    onMutate: ({ requestId }) => {
      setPendingActionId(requestId);
    },
    onSuccess: () => {
      invalidateQueries();
      setRejectNote("");
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const sortedRequests = useMemo(
    () => {
      const lessonExchangeRequests = lessonExchangeRequestsQuery.data?.content ?? [];

      return [...lessonExchangeRequests].sort((a, b) => {
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();
        return bTime - aTime;
      });
    },
    [lessonExchangeRequestsQuery.data?.content],
  );

  const resetSelection = () => {
    setSelectedRequestId(null);
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

  const handleStatusFilterChange = (value: LessonExchangeStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    resetSelection();
  };

  const selectLessonExchangeRequest = (item: LessonExchangeRequestListItemDto) => {
    setSelectedRequestId(item.id);
    setRejectNote("");
  };

  const handleApprove = () => {
    const detail = lessonExchangeDetailQuery.data;
    if (!selectedRequestId || approveMutation.isPending || !canProcessLessonExchangeRequest(detail)) {
      return;
    }

    approveMutation.mutate(selectedRequestId);
  };

  const handleReject = () => {
    const detail = lessonExchangeDetailQuery.data;
    if (!selectedRequestId || rejectMutation.isPending || !canProcessLessonExchangeRequest(detail)) {
      return;
    }

    const note = rejectNote.trim();
    if (!note) return;

    rejectMutation.mutate({ requestId: selectedRequestId, note });
  };

  const isActionPending =
    pendingActionId === selectedRequestId &&
    (approveMutation.isPending || rejectMutation.isPending);

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

  return {
    statusFilter,
    keywordInput,
    handleKeywordInputChange,
    handleSearch,
    handleStatusFilterChange,
    lessonExchangeRequestsQuery,
    sortedRequests,
    selectedRequestId,
    lessonExchangeDetailQuery,
    selectLessonExchangeRequest,
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

export type AdminLessonExchangeRequestsViewModel = ReturnType<typeof useAdminLessonExchangeRequests>;
