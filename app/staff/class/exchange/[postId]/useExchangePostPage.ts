"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LessonExchangeProposalRequestDto,
  UpdateLessonExchangeRequestDto,
} from "@/api/lessonExchange/lessonExchange.dto";
import {
  cancelLessonExchangeRequest,
  createLessonExchangeProposal,
  getLessonExchangeRequestDetail,
  getLessonExchangeProposals,
  updateLessonExchangeRequest,
} from "@/api/lessonExchange/lessonExchange.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { normalizeLessonExchangeExpiresAtForApi } from "@/utils/kstShortDate";

function toIsoDateOnly(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return date.toISOString().slice(0, 10);
}

interface ProposalFormValues {
  lessonDate: string;
  content: string;
}

interface EditFormValues {
  title: string;
  lessonDate: string;
  content: string;
  expiresAt: string;
}

export function useExchangePostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { status: authStatus, user } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";

  const postId = Number(params.postId);
  const isValidPostId = Number.isInteger(postId) && postId > 0;

  const editForm = useForm<EditFormValues>({
    defaultValues: {
      title: "",
      lessonDate: "",
      content: "",
      expiresAt: "",
    },
  });

  const proposalForm = useForm<ProposalFormValues>({
    defaultValues: {
      lessonDate: "",
      content: "",
    },
  });

  const requestQuery = useQuery({
    queryKey: queryKeys.requests.lessonExchangeDetail(postId),
    queryFn: () => getLessonExchangeRequestDetail({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
  });

  const proposalsQuery = useQuery({
    queryKey: queryKeys.requests.lessonExchangeProposals(postId),
    queryFn: () => getLessonExchangeProposals({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
    select: (payload) => (Array.isArray(payload) ? payload : []),
  });

  const [isEditing, setIsEditing] = useState(false);

  const createProposalMutation = useMutation({
    mutationFn: (body: LessonExchangeProposalRequestDto) =>
      createLessonExchangeProposal({ requestId: postId }, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });

      proposalForm.reset();

      window.alert("교환 제안이 등록되었습니다.");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "교환 제안 등록에 실패했습니다.");
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: (body: UpdateLessonExchangeRequestDto) =>
      updateLessonExchangeRequest({ requestId: postId }, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });

      setIsEditing(false);
      window.alert("수업 교환 신청이 수정되었습니다.");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 교환 신청 수정에 실패했습니다.");
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: () => cancelLessonExchangeRequest({ requestId: postId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(postId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });

      window.alert("수업 교환 신청이 취소되었습니다.");
      router.push("/staff/class/exchange");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 교환 신청 취소에 실패했습니다.");
    },
  });

  const startEdit = () => {
    const request = requestQuery.data;

    if (!request || requestQuery.isError) {
      window.alert("신청 정보를 불러온 뒤 수정할 수 있습니다.");
      return;
    }

    editForm.reset({
      title: request.title ?? "",
      lessonDate: toIsoDateOnly(request.lessonDate),
      content: request.content ?? "",
      expiresAt: toIsoDateOnly(request.expiresAt),
    });

    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!updateRequestMutation.isPending) {
      setIsEditing(false);
    }
  };

  const saveEdit = editForm.handleSubmit((data) => {
    const title = data.title.trim();
    const content = data.content.trim();
    const expiresAt = normalizeLessonExchangeExpiresAtForApi(data.expiresAt);

    if (!title) {
      window.alert("제목을 입력해 주세요.");
      return;
    }

    if (!content) {
      window.alert("교환 신청 사유를 입력해 주세요.");
      return;
    }

    if (!expiresAt) {
      window.alert("만료일 시각을 입력해 주세요.");
      return;
    }

    updateRequestMutation.mutate({
      title,
      content,
      lessonDate: data.lessonDate.trim() || undefined,
      expiresAt,
    });
  });

  const submitProposal = proposalForm.handleSubmit((data) => {
    const content = data.content.trim();

    if (!content) {
      window.alert("내용을 입력해 주세요.");
      return;
    }

    createProposalMutation.mutate({
      lessonDate: data.lessonDate.trim() || undefined,
      content,
    });
  });

  const deleteRequest = () => {
    if (!isValidPostId) return;
    if (!window.confirm("수업 교환 신청을 취소할까요?")) return;

    cancelRequestMutation.mutate();
  };

  const backToList = () => {
    router.push("/staff/class/exchange");
  };

  return {
    postId,
    isAuthenticated,
    isValidPostId,

    user,

    request: requestQuery.data,
    requestError: requestQuery.isError,

    proposals: proposalsQuery.data ?? [],
    proposalsLoading: proposalsQuery.isLoading,
    proposalsError: proposalsQuery.isError,

    isEditing,
    editForm,
    proposalForm,

    isUpdating: updateRequestMutation.isPending,
    isCreatingProposal: createProposalMutation.isPending,

    startEdit,
    cancelEdit,
    saveEdit,
    submitProposal,
    deleteRequest,
    backToList,
  };
}
