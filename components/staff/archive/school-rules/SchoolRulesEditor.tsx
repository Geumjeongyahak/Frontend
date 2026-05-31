"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getChannels } from "@/api/channel/channel.api";
import { createPost, deletePost, getChannelPosts, getPost, updatePost } from "@/api/post/post.api";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import {
  CompleteEditButton,
  EditButton,
  RulesEditorBox,
  RulesPanel,
  RulesViewerBox,
  StateMessage,
} from "@/components/staff/archive/school-rules/SchoolRulesPage.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";

const SCHOOL_RULES_CHANNEL_NAME = "교칙";
const SCHOOL_RULES_CHANNEL_TYPE = "GUIDE";
const SCHOOL_RULES_POST_TITLE = "교칙";

type SchoolRulesEditorContextValue = {
  canEdit: boolean;
  contentHtml: string;
  isEditing: boolean;
  isLoading: boolean;
  stateMessage: string;
  startEditing: () => void;
  cancelEditing: () => void;
  saveEditing: () => void;
  deleteEditing: () => void;
  updateDraftContent: (value: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  hasPost: boolean;
};

const SchoolRulesEditorContext = createContext<SchoolRulesEditorContextValue | null>(null);

function useSchoolRulesEditor() {
  const context = useContext(SchoolRulesEditorContext);

  if (!context) {
    throw new Error("SchoolRulesEditor components must be used within SchoolRulesEditorProvider.");
  }

  return context;
}

function findSchoolRulesChannel(channels: Awaited<ReturnType<typeof getChannels>> | undefined) {
  return channels?.find(
    (channel) =>
      channel.channelType === SCHOOL_RULES_CHANNEL_TYPE &&
      channel.name?.trim() === SCHOOL_RULES_CHANNEL_NAME,
  );
}

type SchoolRulesEditorProviderProps = {
  children: ReactNode;
};

export function SchoolRulesEditorProvider({ children }: SchoolRulesEditorProviderProps) {
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [draftContentHtml, setDraftContentHtml] = useState<string | undefined>(undefined);

  const channelsQuery = useQuery({
    queryKey: ["staff", "archive", "school-rules", "channels"],
    queryFn: () =>
      getChannels({
        channelType: SCHOOL_RULES_CHANNEL_TYPE,
        name: SCHOOL_RULES_CHANNEL_NAME,
        isActive: true,
      }),
    retry: false,
  });

  const channel = useMemo(() => findSchoolRulesChannel(channelsQuery.data), [channelsQuery.data]);
  const channelId = channel?.id;

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.boardList({
      page: 0,
      channelType: SCHOOL_RULES_CHANNEL_TYPE,
      boardScope: String(channelId ?? ""),
    }),
    queryFn: () =>
      getChannelPosts(
        { channelId: channelId ?? 0 },
        { status: "PUBLISHED", page: 0, size: 1 },
      ),
    enabled: typeof channelId === "number",
    retry: false,
  });

  const post = postsQuery.data?.content?.[0];
  const postId = post?.id;

  const postDetailQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(channelId ?? 0, postId ?? 0),
    queryFn: () => getPost({ channelId: channelId ?? 0, postId: postId ?? 0 }),
    enabled: typeof channelId === "number" && typeof postId === "number",
    retry: false,
  });

  const postDetail = postDetailQuery.data;
  const contentHtml = postDetail?.contentHtml?.trim() ?? "";
  const visibleContentHtml = draftContentHtml ?? contentHtml;
  const canEdit = status === "authenticated" && user?.role === "ADMIN";

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!channelId) {
        throw new Error("교칙 채널을 찾을 수 없습니다.");
      }

      const nextContentHtml = visibleContentHtml.trim();

      if (typeof postId === "number") {
        return updatePost(
          { channelId, postId },
          {
            title: postDetail?.title ?? post?.title ?? SCHOOL_RULES_POST_TITLE,
            contentHtml: nextContentHtml,
            status: "PUBLISHED",
            allowComment: false,
          },
        );
      }

      return createPost(
        { channelId },
        {
          title: SCHOOL_RULES_POST_TITLE,
          contentHtml: nextContentHtml,
          status: "PUBLISHED",
          allowComment: false,
        },
      );
    },
    onSuccess: async (savedPost) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({
          queryKey: ["staff", "archive", "school-rules", "channels"],
        }),
        typeof savedPost.channelId === "number" && typeof savedPost.id === "number"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(savedPost.channelId, savedPost.id),
            })
          : Promise.resolve(),
      ]);

      setDraftContentHtml(undefined);
      setIsEditing(false);
      toast.success("교칙을 저장했습니다.");
    },
    onError: () => {
      toast.error("교칙 저장에 실패했습니다.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!channelId || typeof postId !== "number") {
        throw new Error("삭제할 교칙 게시글을 찾을 수 없습니다.");
      }

      await deletePost({ channelId, postId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      setDraftContentHtml(undefined);
      setIsEditing(false);
      toast.success("교칙을 삭제했습니다.");
    },
    onError: () => {
      toast.error("교칙 삭제에 실패했습니다.");
    },
  });

  const stateMessage =
    channelsQuery.isLoading || postsQuery.isLoading || postDetailQuery.isLoading
      ? "교칙을 불러오는 중입니다."
      : channelsQuery.isError || postsQuery.isError || postDetailQuery.isError
        ? "교칙을 불러오지 못했습니다."
        : !channelId
          ? "교칙 채널을 찾을 수 없습니다."
          : !contentHtml && !isEditing
            ? "등록된 교칙이 없습니다."
            : "";

  const startEditing = () => {
    if (!canEdit) return;
    setDraftContentHtml(contentHtml);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftContentHtml(undefined);
    setIsEditing(false);
  };

  const saveEditing = () => {
    if (!canEdit || saveMutation.isPending || visibleContentHtml.trim().length === 0) return;
    saveMutation.mutate();
  };

  const deleteEditing = () => {
    if (!canEdit || deleteMutation.isPending || typeof postId !== "number") return;
    deleteMutation.mutate();
  };

  return (
    <SchoolRulesEditorContext.Provider
      value={{
        canEdit,
        cancelEditing,
        contentHtml: visibleContentHtml,
        deleteEditing,
        hasPost: typeof postId === "number",
        isDeleting: deleteMutation.isPending,
        isEditing,
        isLoading: channelsQuery.isLoading || postsQuery.isLoading || postDetailQuery.isLoading,
        isSaving: saveMutation.isPending,
        saveEditing,
        startEditing,
        stateMessage,
        updateDraftContent: setDraftContentHtml,
      }}
    >
      {children}
    </SchoolRulesEditorContext.Provider>
  );
}

export function SchoolRulesEditAction() {
  const {
    canEdit,
    contentHtml,
    isEditing,
    isLoading,
    isSaving,
    saveEditing,
    startEditing,
  } = useSchoolRulesEditor();

  if (!canEdit) return null;

  return isEditing ? (
    <CompleteEditButton
      type="button"
      onClick={saveEditing}
      disabled={isSaving || contentHtml.trim().length === 0}
    >
      {isSaving ? "저장 중..." : "수정 완료"}
    </CompleteEditButton>
  ) : (
    <EditButton type="button" onClick={startEditing} disabled={isLoading}>
      편집
    </EditButton>
  );
}

export function SchoolRulesContentPanel() {
  const {
    cancelEditing,
    contentHtml,
    deleteEditing,
    hasPost,
    isDeleting,
    isEditing,
    stateMessage,
    updateDraftContent,
  } = useSchoolRulesEditor();

  return (
    <RulesPanel aria-label="교칙 본문">
      {stateMessage ? <StateMessage>{stateMessage}</StateMessage> : null}
      {isEditing ? (
        <RulesEditorBox>
          <ToastEditorField initialValue={contentHtml} onChange={updateDraftContent} />
          <div>
            {hasPost ? (
              <CompleteEditButton
                type="button"
                $variant="danger"
                onClick={deleteEditing}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </CompleteEditButton>
            ) : null}
            <CompleteEditButton type="button" $variant="muted" onClick={cancelEditing}>
              취소
            </CompleteEditButton>
          </div>
        </RulesEditorBox>
      ) : contentHtml ? (
        <RulesViewerBox>
          <ToastViewerField value={contentHtml} />
        </RulesViewerBox>
      ) : null}
    </RulesPanel>
  );
}
