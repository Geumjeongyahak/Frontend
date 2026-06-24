"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LessonExchangeProposalDto,
  LessonExchangeProposalRequestDto,
  UpdateLessonExchangeRequestDto,
} from "@/api/lessonExchange/lessonExchange.dto";
import {
  acceptLessonExchangeProposal,
  cancelLessonExchangeRequest,
  createLessonExchangeProposal,
  getLessonExchangeRequestDetail,
  getLessonExchangeProposals,
  updateLessonExchangeProposal,
  updateLessonExchangeRequest,
  withdrawLessonExchangeProposal,
} from "@/api/lessonExchange/lessonExchange.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";
import {
  normalizeLessonExchangeExpiresAtForApi,
  parseKoreanShortDateToIsoDate,
} from "@/utils/kstShortDate";

function toIsoDateOnly(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return date.toISOString().slice(0, 10);
}

function normalizeLessonDateForApi(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return parseKoreanShortDateToIsoDate(trimmed) ?? trimmed;
}

interface ProposalFormValues {
  className: string;
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
      className: "",
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
  const [isChangingExchangeTarget, setIsChangingExchangeTarget] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<number | null>(null);
  const [editingProposalValues, setEditingProposalValues] = useState<ProposalFormValues>({
    className: "",
    lessonDate: "",
    content: "",
  });

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

  const acceptProposalMutation = useMutation({
    mutationFn: (proposalId: number) =>
      acceptLessonExchangeProposal({ requestId: postId, proposalId }),
    onSuccess: async () => {
      setIsChangingExchangeTarget(false);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "교환 제안 수락에 실패했습니다.");
    },
  });

  const updateProposalMutation = useMutation({
    mutationFn: ({
      proposalId,
      body,
    }: {
      proposalId: number;
      body: LessonExchangeProposalRequestDto;
    }) => updateLessonExchangeProposal({ requestId: postId, proposalId }, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      setEditingProposalId(null);
      setEditingProposalValues({
        className: "",
        lessonDate: "",
        content: "",
      });
      window.alert("교환 제안이 수정되었습니다.");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "교환 제안 수정에 실패했습니다.");
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: (proposalId: number) =>
      withdrawLessonExchangeProposal({ requestId: postId, proposalId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      setEditingProposalId(null);
      setEditingProposalValues({
        className: "",
        lessonDate: "",
        content: "",
      });
      window.alert("교환 제안이 삭제되었습니다.");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "교환 제안 삭제에 실패했습니다.");
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
      router.push("/staff/class-management/exchange-request");
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
      lessonDate: normalizeLessonDateForApi(data.lessonDate),
      expiresAt,
    });
  });

  const submitProposal = proposalForm.handleSubmit((data) => {
    const content = data.content.trim();
    const lessonDate = normalizeLessonDateForApi(data.lessonDate);

    if (!lessonDate) {
      window.alert("수업 일자를 입력해 주세요.");
      return;
    }

    if (!content) {
      window.alert("내용을 입력해 주세요.");
      return;
    }

    createProposalMutation.mutate({
      lessonDate,
      content,
    });
  });

  const deleteRequest = () => {
    if (!isValidPostId) return;
    if (!window.confirm("수업 교환 신청을 취소할까요?")) return;

    cancelRequestMutation.mutate();
  };

  const backToList = () => {
    router.push("/staff/class-management/exchange-request");
  };

  const acceptProposal = (proposalId: number) => {
    if (!Number.isInteger(proposalId) || proposalId <= 0) return;
    if (!window.confirm("이 교환 제안을 수락할까요?")) return;

    acceptProposalMutation.mutate(proposalId);
  };

  const canManageProposal = (proposal: LessonExchangeProposalDto) =>
    isAuthenticated &&
    typeof user?.id === "number" &&
    typeof proposal.proposedById === "number" &&
    user.id === proposal.proposedById &&
    (proposal.status === "ACTIVE" || proposal.status == null);

  const startProposalEdit = (proposal: LessonExchangeProposalDto) => {
    if (!proposal.id || !canManageProposal(proposal)) {
      return;
    }

    setEditingProposalId(proposal.id);
    setEditingProposalValues({
      className: proposal.classroomName ?? "",
      lessonDate: formatUtcToKstShortDate(proposal.lessonDate) || "",
      content: proposal.content ?? "",
    });
  };

  const cancelProposalEdit = () => {
    if (updateProposalMutation.isPending) {
      return;
    }

    setEditingProposalId(null);
    setEditingProposalValues({
      className: "",
      lessonDate: "",
      content: "",
    });
  };

  const saveProposalEdit = (proposalId: number) => {
    const lessonDate = normalizeLessonDateForApi(editingProposalValues.lessonDate);
    const content = editingProposalValues.content.trim();

    if (!lessonDate) {
      window.alert("수업 일자를 입력해 주세요.");
      return;
    }

    if (!content) {
      window.alert("내용을 입력해 주세요.");
      return;
    }

    updateProposalMutation.mutate({
      proposalId,
      body: {
        lessonDate,
        content,
      },
    });
  };

  const deleteProposal = (proposalId: number) => {
    if (!window.confirm("이 교환 제안을 삭제할까요?")) return;

    deleteProposalMutation.mutate(proposalId);
  };

  const changeExchangeTarget = () => {
    if (!window.confirm("교환 대상을 변경할까요?")) return;

    setIsChangingExchangeTarget(true);
  };

  const request = requestQuery.data;
  const requestStatus = request?.status;
  const teacherAssignments = user?.teacherAssignments ?? [];
  const assignmentClassNames = Array.from(
    new Set(
      teacherAssignments
        .map((assignment) => assignment.classroomName?.trim() ?? "")
        .filter((name) => name.length > 0),
    ),
  );
  const hasMultipleProposalClassNames = assignmentClassNames.length > 1;
  const proposalClassName = assignmentClassNames.length === 1 ? assignmentClassNames[0] : "";
  const matchesApplicantId =
    typeof user?.id === "number" &&
    typeof request?.requestedById === "number" &&
    user.id === request.requestedById;
  const matchesApplicantName = Boolean(
    request?.requestedByName &&
      [user?.name, user?.nickname, user?.email].some(
        (candidate) => candidate != null && candidate === request.requestedByName,
      ),
  );
  const isApplicant =
    (matchesApplicantId && (!request?.requestedByName || matchesApplicantName)) ||
    (request?.requestedById == null && matchesApplicantName);

  const uiStatus =
    isChangingExchangeTarget && requestStatus === "COMPLETED" ? "APPROVED" : requestStatus;

  const showProposalMessage =
    uiStatus === "PENDING" || uiStatus === "CANCELLED" || uiStatus === "REJECTED";
  const proposalMessage =
    uiStatus === "REJECTED"
      ? "관리자에 의해 거절된 제안서입니다."
      : uiStatus === "PENDING" || uiStatus === "CANCELLED"
        ? "관리자 승인 후 교환 제안서 작성이 가능합니다"
        : null;

  const showProposalForm = uiStatus === "APPROVED" && !isApplicant;
  const showProposalList = uiStatus === "APPROVED" || uiStatus === "COMPLETED";
  const showProposalSection = showProposalMessage || showProposalForm || showProposalList;

  const visibleProposals = useMemo(() => {
    const all = proposalsQuery.data ?? [];

    if (uiStatus === "COMPLETED") {
      return all.filter((proposal) => proposal.status === "ACCEPTED");
    }

    return all;
  }, [proposalsQuery.data, uiStatus]);

  const canDelete =
    isAuthenticated && isValidPostId && isApplicant && (uiStatus === "PENDING" || uiStatus === "CANCELLED");
  const canEdit =
    isAuthenticated && isValidPostId && !requestQuery.isError && isApplicant && uiStatus === "PENDING";
  const canAcceptProposal = isApplicant && uiStatus === "APPROVED";
  const canChangeExchangeTarget = isApplicant && uiStatus === "COMPLETED";
  const proposalListTitle = uiStatus === "COMPLETED" ? "교환 대상" : "교환 제안서";

  return {
    postId,
    isAuthenticated,
    isValidPostId,

    user,

    request,
    requestError: requestQuery.isError,

    isApplicant,
    assignmentClassNames,
    hasMultipleProposalClassNames,
    proposalClassName,
    showProposalSection,
    showProposalMessage,
    proposalMessage,
    showProposalForm,
    showProposalList,
    proposalListTitle,
    canDelete,
    canEdit,
    canAcceptProposal,
    canChangeExchangeTarget,

    proposals: visibleProposals,
    proposalsLoading: proposalsQuery.isLoading,
    proposalsError: proposalsQuery.isError,

    isEditing,
    editForm,
    proposalForm,

    isUpdating: updateRequestMutation.isPending,
    isCreatingProposal: createProposalMutation.isPending,
    isAcceptingProposal: acceptProposalMutation.isPending,
    isUpdatingProposal: updateProposalMutation.isPending,
    isDeletingProposal: deleteProposalMutation.isPending,
    editingProposalId,
    editingProposalValues,

    startEdit,
    cancelEdit,
    saveEdit,
    submitProposal,
    acceptProposal,
    canManageProposal,
    startProposalEdit,
    cancelProposalEdit,
    saveProposalEdit,
    deleteProposal,
    setEditingProposalValues,
    changeExchangeTarget,
    deleteRequest,
    backToList,
  };
}
