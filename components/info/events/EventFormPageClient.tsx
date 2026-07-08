"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { deleteAttachment } from "@/api/file/file.api";
import {
  attachPostAttachment,
  createPost,
  getPost,
  publishPost,
  updatePost,
} from "@/api/post/post.api";
import type { PostAttachmentInfoDto } from "@/api/post/post.dto";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import { AttachmentEditorPanel } from "@/components/common/AttachmentField";
import { FileUploadProgressNotice } from "@/components/common/FileUploadProgress";
import EventDocumentLayout from "@/components/info/events/EventDocumentLayout";
import {
  EVENT_CHANNEL_TYPE,
  canManageEventPost,
  extractFirstImageUrl,
  findEventChannel,
} from "@/components/info/events/eventUtils";
import {
  ActionButton,
  DocumentSection,
  Form,
  Input,
  Label,
  PageTitle,
  StateMessage,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { layout, spacing } from "@/styles/tokens";

type EventFormPageClientProps = {
  editPostId?: number;
  editChannelId?: number;
};

export default function EventFormPageClient({
  editPostId,
  editChannelId,
}: EventFormPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const isEditMode = typeof editPostId === "number" && typeof editChannelId === "number";
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [contentHtml, setContentHtml] = useState<string | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editableAttachments, setEditableAttachments] = useState<PostAttachmentInfoDto[] | null>(
    null,
  );
  const shouldShowUploadToastRef = useRef(false);

  const channelsQuery = useQuery({
    queryKey: ["info", "events", "channels"],
    queryFn: () => getChannels({ channelType: EVENT_CHANNEL_TYPE, isActive: true }),
    retry: false,
  });
  const postDetailQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(editChannelId ?? 0, editPostId ?? 0),
    queryFn: () => getPost({ channelId: editChannelId ?? 0, postId: editPostId ?? 0 }),
    enabled: isEditMode,
    retry: false,
  });

  const eventChannel = useMemo(() => findEventChannel(channelsQuery.data), [channelsQuery.data]);
  const currentUserName = user?.name ?? user?.nickname ?? user?.email ?? "";
  const visibleTitle = title ?? postDetailQuery.data?.title ?? "";
  const visibleAuthor = postDetailQuery.data?.authorName ?? currentUserName;
  const visibleContentHtml = contentHtml ?? postDetailQuery.data?.contentHtml ?? "";
  const existingAttachments = postDetailQuery.data?.attachments ?? [];
  const visibleExistingAttachments = editableAttachments ?? existingAttachments;
  const isEditorReady = !isEditMode || Boolean(postDetailQuery.data);
  const canManagePost = !isEditMode
    ? status === "authenticated"
    : canManageEventPost(user, postDetailQuery.data);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      const channelId = isEditMode ? editChannelId : eventChannel?.id;

      if (!channelId) {
        throw new Error("행사 정보를 등록할 채널을 찾을 수 없습니다.");
      }

      if (!canManagePost) {
        throw new Error("행사 정보를 저장할 권한이 없습니다.");
      }

      const thumbnailUrl = extractFirstImageUrl(visibleContentHtml);
      const title = visibleTitle.trim();
      const contentHtml = visibleContentHtml.trim();
      const hasFileUpload = selectedFiles.length > 0;
      shouldShowUploadToastRef.current = hasFileUpload;
      const publishBody = {
        title,
        contentHtml,
        allowComment: true,
        thumbnailUrl: thumbnailUrl || undefined,
      };

      if (hasFileUpload) {
        const draftPost = isEditMode
          ? await updatePost({ channelId, postId: editPostId }, { ...publishBody, status: "DRAFT" })
          : await createPost({ channelId }, { ...publishBody, status: "DRAFT" });

        if (typeof draftPost.id !== "number") {
          throw new Error("행사 정보 초안을 저장하지 못했습니다.");
        }

        for (const file of selectedFiles) {
          await attachPostAttachment(
            { channelId, postId: draftPost.id },
            file,
            file.name,
          );
        }

        return publishPost({ channelId, postId: draftPost.id }, publishBody);
      }

      if (isEditMode) {
        return updatePost(
          { channelId, postId: editPostId },
          { ...publishBody, status: "PUBLISHED" },
        );
      }

      return createPost({ channelId }, { ...publishBody, status: "PUBLISHED" });
    },
    onSuccess: async (post) => {
      if (shouldShowUploadToastRef.current) {
        toast.success("파일 업로드가 완료되었습니다.");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["info", "events"] }),
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        typeof post.channelId === "number" && typeof post.id === "number"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(post.channelId, post.id),
            })
          : Promise.resolve(),
      ]);

      router.push(
        typeof post.id === "number" && typeof post.channelId === "number"
          ? `/info/events/${post.id}?channelId=${post.channelId}`
          : "/info/events",
      );
    },
    onError: () => {
      shouldShowUploadToastRef.current = false;
    },
  });

  const canSubmit =
    status === "authenticated" &&
    visibleTitle.trim().length > 0 &&
    visibleContentHtml.trim().length > 0 &&
    Boolean(isEditMode ? editChannelId : eventChannel?.id) &&
    canManagePost &&
    !isPending;

  async function handleRemoveExistingAttachment(fileId: string) {
    const currentAttachments = visibleExistingAttachments;
    await deleteAttachment({ fileId });
    setEditableAttachments(currentAttachments.filter((file) => file.fileId !== fileId));
  }

  function handleRemoveSelectedFile(file: File) {
    setSelectedFiles((current) =>
      current.filter(
        (item) => !(item.name === file.name && item.lastModified === file.lastModified),
      ),
    );
  }

  return (
    <EventDocumentLayout>
      <DocumentSection>
        <Toolbar>
          <PageTitle>{isEditMode ? "행사 정보 수정" : "행사 정보 작성"}</PageTitle>
          <ToolbarActions>
            {isPending && selectedFiles.length > 0 ? <FileUploadProgressNotice /> : null}
            <ActionButton type="submit" form="event-form" disabled={!canSubmit}>
              {isEditMode ? "수정 완료" : "작성 완료"}
            </ActionButton>
          </ToolbarActions>
        </Toolbar>

        <Form
          id="event-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) mutate();
          }}
        >
          <Label as="label" htmlFor="event-title">
            제목
          </Label>
          <Input
            id="event-title"
            name="title"
            placeholder="제목"
            value={visibleTitle}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Label as="label" htmlFor="event-author">
            작성자
          </Label>
          <Input id="event-author" name="author" value={visibleAuthor} readOnly />

          <Label as="label" htmlFor="event-content">
            내용
          </Label>
          {isEditorReady ? (
            <ToastEditorField
              key={isEditMode ? `${editChannelId}-${editPostId}` : "new-event-post"}
              initialValue={visibleContentHtml}
              onChange={setContentHtml}
            />
          ) : (
            <StateMessage>행사 정보를 불러오는 중입니다.</StateMessage>
          )}

          <Label>자료</Label>
          <AttachmentEditorPanel
            existingAttachments={visibleExistingAttachments.map((file, index) => ({
              id: file.fileId ?? `existing-${index}`,
              label: file.originalName ?? file.fileId ?? `자료 ${index + 1}`,
            }))}
            selectedFiles={selectedFiles}
            onSelectFiles={(files) => setSelectedFiles((current) => [...current, ...files])}
            onRemoveExisting={handleRemoveExistingAttachment}
            onRemoveSelected={handleRemoveSelectedFile}
            disabled={isPending}
          />

          {status === "unauthenticated" ? (
            <StateMessage>로그인 후 행사 정보를 작성할 수 있습니다.</StateMessage>
          ) : null}
          {channelsQuery.isError ? (
            <StateMessage>행사 정보 채널을 불러오지 못했습니다.</StateMessage>
          ) : null}
          {postDetailQuery.isError ? (
            <StateMessage>수정할 행사 정보를 불러오지 못했습니다.</StateMessage>
          ) : null}
          {!canManagePost && status === "authenticated" ? (
            <StateMessage>이 행사 정보를 수정할 권한이 없습니다.</StateMessage>
          ) : null}
          {isError ? (
            <StateMessage>
              {isEditMode ? "행사 정보 수정에 실패했습니다." : "행사 정보 작성에 실패했습니다."}
            </StateMessage>
          ) : null}
        </Form>
      </DocumentSection>
    </EventDocumentLayout>
  );
}

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;
