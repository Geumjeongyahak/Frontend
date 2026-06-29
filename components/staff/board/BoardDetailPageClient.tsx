"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { deletePost, getPost, getPublicPost } from "@/api/post/post.api";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import BoardCommentSection from "@/components/staff/board/BoardCommentSection";
import { AttachmentDownloadList } from "@/components/common/AttachmentField";
import BoardShell from "@/components/staff/board/BoardShell";
import {
  ActionButton,
  ActionLink,
  ContentStack,
  DocumentSection,
  FieldBox,
  Label,
  MetaBar,
  StateMessage,
  Toolbar,
  ToolbarRight,
  ViewerBox,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { handlePostDeleteSuccess } from "@/lib/post/postDeleteCache";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type BoardDetailPageClientProps = {
  postId: number;
  channelId?: number;
  allowPublicNotice?: boolean;
};

export default function BoardDetailPageClient({
  postId,
  channelId,
  allowPublicNotice = false,
}: BoardDetailPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const isAuthPending = status === "loading";
  const canReadPublicNotice = status === "unauthenticated" && allowPublicNotice;
  const hasChannelId = typeof channelId === "number" && Number.isFinite(channelId);
  const requestMode = isAuthenticated ? "authenticated" : canReadPublicNotice ? "public" : "blocked";

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost({ channelId: channelId ?? 0, postId }),
    onMutate: async () => {
      if (!hasChannelId) return;

      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.boardDetail(channelId, postId),
      });
    },
    onSuccess: () => {
      if (!hasChannelId) return;

      handlePostDeleteSuccess(queryClient, {
        channelId,
        postId,
        redirect: () => router.replace("/staff/board"),
        extraInvalidateKeys: [["staff", "board", "notices"]],
      });
    },
  });

  const isDeletingPost = deletePostMutation.isPending || deletePostMutation.isSuccess;

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKeys.posts.boardDetail(channelId ?? 0, postId), requestMode],
    queryFn: () =>
      requestMode === "public"
        ? getPublicPost({ channelId: channelId ?? 0, postId })
        : getPost({ channelId: channelId ?? 0, postId }),
    enabled:
      hasChannelId &&
      !isDeletingPost &&
      !isAuthPending &&
      requestMode !== "blocked",
    retry: false,
  });

  const visiblePost = data;
  const metaLabel = visiblePost?.channelName ?? "교무기획부";
  const date = formatUtcToKstShortDate(visiblePost?.createdAt ?? visiblePost?.updatedAt);
  const title = visiblePost?.title ?? "제목";
  const author = visiblePost?.authorName ?? "홍길동";
  const content = visiblePost?.contentHtml?.trim() || "내용";
  const attachments = visiblePost?.attachments ?? [];
  const editHref =
    hasChannelId && visiblePost?.id
      ? `/staff/board/new?postId=${visiblePost.id}&channelId=${channelId}`
      : "/staff/board/new";
  const canManagePost =
    user?.role === "ADMIN" ||
    (typeof user?.id === "number" && visiblePost?.authorId === user.id) ||
    Boolean(
      visiblePost?.authorName &&
      (visiblePost.authorName === user?.name ||
        visiblePost.authorName === user?.nickname ||
        visiblePost.authorName === user?.email),
    );
  const stateMessage =
    !visiblePost && !hasChannelId
      ? "게시글 채널 정보가 없어 상세 내용을 불러오지 못했습니다."
      : isAuthPending
        ? "사용자 정보를 확인하는 중입니다."
      : deletePostMutation.isPending
        ? "게시글을 삭제하는 중입니다."
        : isLoading
          ? "게시글을 불러오는 중입니다."
          : isError && !visiblePost && !isDeletingPost
            ? requestMode === "blocked"
              ? "로그인이 필요한 게시글입니다."
              : "게시글을 불러오지 못했습니다."
            : deletePostMutation.isError
              ? "게시글 삭제에 실패했습니다."
              : "";

  return (
    <BoardShell>
      <DocumentSection>
        <ActionToolbar>
          <ToolbarRight>
            {canManagePost ? (
              <>
                <ActionButton
                  type="button"
                  $variant="danger"
                  disabled={!hasChannelId || deletePostMutation.isPending}
                  onClick={() => deletePostMutation.mutate()}
                >
                  삭제
                </ActionButton>
                <ActionLink href={editHref} $variant="edit">
                  수정
                </ActionLink>
              </>
            ) : null}
            <ActionLink href="/staff/board" $variant="muted">
              목록
            </ActionLink>
          </ToolbarRight>
        </ActionToolbar>

        {stateMessage ? <StateMessage>{stateMessage}</StateMessage> : null}

        <ContentStack>
          <MetaBar>
            <span>{metaLabel}</span>
            <span>{date}</span>
          </MetaBar>

          <Label>제목</Label>
          <FieldBox>{title}</FieldBox>

          <Label>작성자</Label>
          <FieldBox>{author}</FieldBox>

          <Label>내용</Label>
          <ViewerBox>
            <ToastViewerField value={content} />
          </ViewerBox>

          <Label>자료</Label>
          <AttachmentDownloadList
            attachments={attachments.map((file, index) => ({
              id: file.fileId ?? `${file.originalName}-${index}`,
              fileId: file.fileId,
              label: file.originalName ?? file.fileId ?? `자료 ${index + 1}`,
              href: file.downloadUrl ?? "#",
            }))}
          />

          {isAuthenticated && hasChannelId && visiblePost?.allowComment !== false ? (
            <BoardCommentSection channelId={channelId} postId={postId} />
          ) : null}
        </ContentStack>
      </DocumentSection>
    </BoardShell>
  );
}

const ActionToolbar = styled(Toolbar)`
  justify-content: flex-end;
`;
