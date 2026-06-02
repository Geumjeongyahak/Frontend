"use client";

import { IconDownload } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deletePost, getPost } from "@/api/post/post.api";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import EventDocumentLayout from "@/components/info/events/EventDocumentLayout";
import { canManageEventPost } from "@/components/info/events/eventUtils";
import {
  ActionButton,
  ActionLink,
  ContentStack,
  DocumentSection,
  DownloadBadge,
  FieldBox,
  FileLink,
  FileList,
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

type EventDetailPageClientProps = {
  postId: number;
  channelId?: number;
};

export default function EventDetailPageClient({ postId, channelId }: EventDetailPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const hasChannelId = typeof channelId === "number" && Number.isFinite(channelId);

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
        redirect: () => router.replace("/info/events"),
        extraInvalidateKeys: [["info", "events"]],
      });
    },
  });

  const isDeletingPost = deletePostMutation.isPending || deletePostMutation.isSuccess;

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.boardDetail(channelId ?? 0, postId),
    queryFn: () => getPost({ channelId: channelId ?? 0, postId }),
    enabled: hasChannelId && !isDeletingPost,
    retry: false,
  });

  const visiblePost = data;
  const date = formatUtcToKstShortDate(visiblePost?.createdAt ?? visiblePost?.updatedAt);
  const title = visiblePost?.title ?? "제목";
  const author = visiblePost?.authorName ?? "홍길동";
  const content = visiblePost?.contentHtml?.trim() || "내용";
  const canManagePost = canManageEventPost(user, visiblePost);
  const editHref =
    hasChannelId && visiblePost?.id
      ? `/info/events/new?postId=${visiblePost.id}&channelId=${channelId}`
      : "/info/events/new";
  const attachments = visiblePost?.attachments ?? [];

  const stateMessage =
    !visiblePost && !hasChannelId
      ? "게시글 채널 정보가 없어 상세 내용을 불러오지 못했습니다."
      : deletePostMutation.isPending
        ? "게시글을 삭제하는 중입니다."
        : isLoading
          ? "게시글을 불러오는 중입니다."
          : isError && !visiblePost && !isDeletingPost
            ? "게시글을 불러오지 못했습니다."
            : deletePostMutation.isError
              ? "게시글 삭제에 실패했습니다."
              : "";

  return (
    <EventDocumentLayout>
      <DocumentSection>
        <Toolbar>
          <ActionLink href="/info/events" $variant="muted">
            목록
          </ActionLink>

          {canManagePost ? (
            <ToolbarRight>
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
            </ToolbarRight>
          ) : null}
        </Toolbar>

        {stateMessage ? <StateMessage>{stateMessage}</StateMessage> : null}

        <ContentStack>
          <MetaBar>
            <span>행사 정보</span>
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
          <FileList>
            {attachments.length > 0 ? (
              attachments.map((file) => {
                const href = file.downloadUrl ?? "#";
                const label = file.originalName ?? file.fileId ?? "첨부파일";
                return (
                  <FileLink key={`${file.fileId ?? label}-${file.sortOrder ?? 0}`} href={href}>
                    <span>{label}</span>
                    <DownloadBadge aria-hidden="true">
                      <IconDownload size={16} stroke={2.25} />
                    </DownloadBadge>
                  </FileLink>
                );
              })
            ) : (
              <StateMessage>등록된 자료가 없습니다.</StateMessage>
            )}
          </FileList>
        </ContentStack>
      </DocumentSection>
    </EventDocumentLayout>
  );
}
