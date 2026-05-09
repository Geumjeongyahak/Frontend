"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LessonExchangeProposalRequestDto,
  LessonExchangeRequestStatus,
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
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import {
  formatUtcToKstDatetimeLocalInput,
  formatUtcToKstShortDate,
  formatUtcToKstShortDateTime,
} from "@/utils/formatUtcToKstShortDate";
import { normalizeLessonExchangeExpiresAtForApi } from "@/utils/kstShortDate";

function normalizeRequestStatusTone(
  status: LessonExchangeRequestStatus | undefined,
): "PENDING" | "APPROVED" | "REJECTED" {
  if (status === "APPROVED") return "APPROVED";
  if (status === "REJECTED") return "REJECTED";
  return "PENDING";
}

function toIsoDateOnly(value?: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed.length >= 10 ? trimmed.slice(0, 10) : "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useExchangePostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const postId = Number(params.postId);
  const isValidPostId = Number.isInteger(postId) && postId > 0;

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.lessonExchangeDetail(postId),
    queryFn: () => getLessonExchangeRequestDetail({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
  });

  const {
    data: proposalList = [],
    isLoading: proposalsLoading,
    isError: proposalsIsError,
  } = useQuery({
    queryKey: queryKeys.requests.lessonExchangeProposals(postId),
    queryFn: () => getLessonExchangeProposals({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
    select: (payload) => (Array.isArray(payload) ? payload : []),
  });

  const [proposalClassroomNameDraft, setProposalClassroomNameDraft] = useState("");
  const [proposalLessonDate, setProposalLessonDate] = useState("");
  const [proposalWriterDraft, setProposalWriterDraft] = useState("");
  const [proposalContent, setProposalContent] = useState("");

  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLessonDate, setEditLessonDate] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");

  const createProposalMutation = useMutation({
    mutationFn: (body: LessonExchangeProposalRequestDto) =>
      createLessonExchangeProposal({ requestId: postId }, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      setProposalContent("");
      setProposalLessonDate("");
      setProposalClassroomNameDraft("");
      setProposalWriterDraft("");
      window.alert("교환 제안이 등록되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "교환 제안 등록에 실패했습니다.";
      window.alert(message);
    },
  });

  const handleProposalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = proposalContent.trim();
    if (!content) {
      window.alert("내용을 입력해 주세요.");
      return;
    }
    createProposalMutation.mutate({
      lessonDate: proposalLessonDate.trim() || undefined,
      content,
    });
  };

  const cancelRequestMutation = useMutation({
    mutationFn: () => cancelLessonExchangeRequest({ requestId: postId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      await queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(postId),
      });
      await queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      window.alert("수업 교환 신청이 취소되었습니다.");
      router.push("/staff/class/exchange");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "수업 교환 신청 취소에 실패했습니다.";
      window.alert(message);
    },
  });

  const handleDeleteClick = () => {
    if (!isValidPostId) return;
    if (!window.confirm("수업 교환 신청을 취소할까요?")) return;
    cancelRequestMutation.mutate();
  };

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
      setIsEditingRequest(false);
      window.alert("수업 교환 신청이 수정되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "수업 교환 신청 수정에 실패했습니다.";
      window.alert(message);
    },
  });

  const handleStartEdit = () => {
    if (!data || isError) {
      window.alert("신청 정보를 불러온 뒤 수정할 수 있습니다.");
      return;
    }
    setEditTitle(data.title ?? "");
    setEditLessonDate(toIsoDateOnly(data.lessonDate));
    setEditContent(data.content ?? "");
    setEditExpiresAt(formatUtcToKstDatetimeLocalInput(data.expiresAt));
    setIsEditingRequest(true);
  };

  const handleCancelEdit = () => {
    if (updateRequestMutation.isPending) return;
    setIsEditingRequest(false);
  };

  const handleSaveEdit = () => {
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title) {
      window.alert("제목을 입력해 주세요.");
      return;
    }
    if (!content) {
      window.alert("교환 신청 사유를 입력해 주세요.");
      return;
    }

    const expiresAt = normalizeLessonExchangeExpiresAtForApi(editExpiresAt);
    if (!expiresAt) {
      window.alert("만료일 시각을 입력해 주세요.");
      return;
    }

    updateRequestMutation.mutate({
      title,
      content,
      lessonDate: editLessonDate.trim() || undefined,
      expiresAt,
    });
  };

  const detailTitle = isLoading
    ? "불러오는 중..."
    : isError
      ? "수업 교환 신청을 불러오지 못했습니다."
      : data?.title ?? "제목";
  const detailWriter = data?.requestedByName ?? "";
  const detailClassName = data?.classroomName ?? "";
  const detailLessonDate = formatUtcToKstShortDate(data?.lessonDate);
  const detailContent = isError ? "교환 신청 사유를 불러오지 못했습니다." : data?.content ?? "";
  const detailStatusTone = isError
    ? ("PENDING" as const)
    : normalizeRequestStatusTone(data?.status);
  const detailStatus = isError ? "확인 불가" : formatRequestStatus(data?.status);
  const detailCreatedDate = formatUtcToKstShortDate(data?.createdAt);
  const detailExpiresAtDisplay = formatUtcToKstShortDateTime(data?.expiresAt);

  const acceptedHref = `/staff/class/exchange/${postId}/accepted`;

  return {
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
  };
}
