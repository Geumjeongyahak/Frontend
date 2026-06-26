"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled, { css } from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { deleteAttachment } from "@/api/file/file.api";
import { deletePost, getPost, pinPost, updatePost } from "@/api/post/post.api";
import type { PostAttachmentInfoDto } from "@/api/post/post.dto";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import {
  AttachmentDownloadList,
  AttachmentEditorPanel,
} from "@/components/common/AttachmentField";
import { FileUploadProgressNotice } from "@/components/common/FileUploadProgress";
import { resolveArchiveChannel } from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import BoardCommentSection from "@/components/staff/board/BoardCommentSection";
import {
  ActionLink,
  CheckboxInput,
  CheckboxLabel,
  ContentStack,
  DocumentSection,
  FieldBox,
  Label,
  MetaBar,
  OptionRow,
  StateMessage,
  Toolbar,
  ToolbarRight,
  ViewerBox,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  getUploadArchiveDocument,
  publishArchivePostWithNewFiles,
} from "@/components/staff/archive/archive-document-section/archiveDocumentUpload";
import { handlePostDeleteSuccess } from "@/lib/post/postDeleteCache";
import { queryKeys } from "@/lib/queryKeys";
import type { ArchiveDocumentConfig } from "@/mocks/archiveDocuments";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type ArchiveDocumentDetailPageProps = {
  config: ArchiveDocumentConfig;
  postId: number;
  channelId?: number;
};

export default function ArchiveDocumentDetailPage({
  config,
  postId,
  channelId: initialChannelId,
}: ArchiveDocumentDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAllowComment, setEditAllowComment] = useState(true);
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editableAttachments, setEditableAttachments] = useState<PostAttachmentInfoDto[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const shouldShowUploadToastRef = useRef(false);

  const channelsQuery = useQuery({
    queryKey: ["staff", "archive", "channels"],
    queryFn: () => getChannels({ isActive: true }),
    enabled: typeof initialChannelId !== "number",
    retry: false,
  });

  const channel = resolveArchiveChannel(channelsQuery.data, config);
  const channelId =
    initialChannelId ?? channel?.id ?? (channelsQuery.isError ? config.channelId : undefined);
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
        redirect: () => router.replace(config.listPath),
      });
    },
  });

  const isDeletingPost = deletePostMutation.isPending || deletePostMutation.isSuccess;

  const postQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(channelId ?? 0, postId),
    queryFn: () => getPost({ channelId: channelId ?? 0, postId }),
    enabled: hasChannelId && !isDeletingPost,
    retry: false,
  });

  const visiblePost = postQuery.data;
  const date = formatUtcToKstShortDate(visiblePost?.createdAt ?? visiblePost?.updatedAt);
  const title = visiblePost?.title ?? "제목";
  const author = visiblePost?.authorName ?? "홍길동";
  const content = visiblePost?.contentHtml?.trim() || "설명";
  const attachments = visiblePost?.attachments ?? [];
  useEffect(() => {
    setEditableAttachments(attachments);
  }, [attachments]);
  const canManagePost =
    user?.role === "ADMIN" ||
    (typeof user?.id === "number" && visiblePost?.authorId === user.id) ||
    Boolean(
      visiblePost?.authorName &&
      (visiblePost.authorName === user?.name ||
        visiblePost.authorName === user?.nickname ||
        visiblePost.authorName === user?.email),
    );

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      if (!hasChannelId) {
        throw new Error(`${config.title} 채널 정보를 찾지 못했습니다.`);
      }

      const title = editTitle.trim();
      const contentHtml = editContent.trim();
      const uploadArchiveDocument = getUploadArchiveDocument(config.category);
      const hasFileUpload = Boolean(uploadArchiveDocument) && editFiles.length > 0;
      shouldShowUploadToastRef.current = hasFileUpload;
      setIsUploadingFiles(hasFileUpload);

      if (hasFileUpload && uploadArchiveDocument) {
        return publishArchivePostWithNewFiles({
          mode: "update",
          postId,
          channelId,
          title,
          contentHtml,
          allowComment: editAllowComment,
          isPinned: editIsPinned,
          files: editFiles,
          uploadDocument: uploadArchiveDocument,
          sortOrderStart: editableAttachments.length,
          errorLabel: config.title,
          initialPinned: visiblePost?.isPinned ?? false,
        });
      }

      const updatedPost = await updatePost(
        { channelId, postId },
        { title, contentHtml, status: "PUBLISHED", allowComment: editAllowComment },
      );

      if (editIsPinned !== (visiblePost?.isPinned ?? false)) {
        await pinPost({ channelId, postId }, { isPinned: editIsPinned });
      }

      return updatedPost;
    },
    onSuccess: async (updatedPost) => {
      if (shouldShowUploadToastRef.current) {
        toast.success("파일 업로드가 완료되었습니다.");
      }

      setIsUploadingFiles(false);
      setIsEditing(false);
      setEditFiles([]);
      queryClient.setQueryData(queryKeys.posts.boardDetail(channelId ?? 0, postId), updatedPost);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        hasChannelId
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(channelId ?? 0, postId),
            })
          : Promise.resolve(),
      ]);
    },
    onError: () => {
      shouldShowUploadToastRef.current = false;
      setIsUploadingFiles(false);
    },
  });

  const stateMessage = !hasChannelId
    ? `${config.title} 채널 정보를 찾지 못했습니다.`
    : deletePostMutation.isPending
      ? `${config.title}를 삭제하는 중입니다.`
      : postQuery.isLoading
        ? `${config.title}를 불러오는 중입니다.`
        : postQuery.isError && !visiblePost && !isDeletingPost
          ? `${config.title}를 불러오지 못했습니다.`
          : deletePostMutation.isError
            ? `${config.title} 삭제에 실패했습니다.`
            : updatePostMutation.isError
              ? `${config.title} 수정에 실패했습니다.`
              : "";
  const canSubmitEdit =
    isEditing &&
    hasChannelId &&
    canManagePost &&
    editTitle.trim().length > 0 &&
    editContent.trim().length > 0 &&
    !updatePostMutation.isPending;

  function startEditing() {
    if (!visiblePost) return;

    setEditTitle(visiblePost.title ?? "");
    setEditContent(visiblePost.contentHtml ?? "");
    setEditAllowComment(visiblePost.allowComment ?? true);
    setEditIsPinned(visiblePost.isPinned ?? false);
    setEditFiles([]);
    setEditableAttachments(visiblePost.attachments ?? []);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
    setEditAllowComment(true);
    setEditIsPinned(false);
    setEditFiles([]);
    shouldShowUploadToastRef.current = false;
    setIsUploadingFiles(false);
    setEditableAttachments(attachments);
  }

  async function handleRemoveExistingAttachment(fileId: string) {
    await deleteAttachment({ fileId });
    setEditableAttachments((current) => current.filter((file) => file.fileId !== fileId));
  }

  function handleRemoveSelectedFile(file: File) {
    setEditFiles((current) =>
      current.filter((item) => !(item.name === file.name && item.lastModified === file.lastModified)),
    );
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmitEdit) {
      updatePostMutation.mutate();
    }
  }

  return (
    <DocumentSection>
      <ActionToolbar>
        <ToolbarRight>
          {isEditing ? (
            <>
              {updatePostMutation.isPending && isUploadingFiles ? <FileUploadProgressNotice /> : null}
              <ArchiveActionButton
                type="submit"
                form={`${config.category}-detail-edit-form`}
                $tone="edit"
                disabled={!canSubmitEdit}
              >
                {updatePostMutation.isPending ? "수정 중" : "수정 완료"}
              </ArchiveActionButton>
              <ArchiveMutedButton type="button" onClick={cancelEditing}>
                취소
              </ArchiveMutedButton>
            </>
          ) : (
            <>
              {canManagePost ? (
                <>
                  <ArchiveActionButton
                    type="button"
                    $tone="danger"
                    disabled={!hasChannelId || deletePostMutation.isPending}
                    onClick={() => deletePostMutation.mutate()}
                  >
                    삭제
                  </ArchiveActionButton>
                  <ArchiveActionButton
                    type="button"
                    $tone="edit"
                    disabled={!visiblePost}
                    onClick={startEditing}
                  >
                    수정
                  </ArchiveActionButton>
                </>
              ) : null}
              <ActionLink href={config.listPath} $variant="muted">
                목록
              </ActionLink>
            </>
          )}
        </ToolbarRight>
      </ActionToolbar>

      {stateMessage ? <StateMessage>{stateMessage}</StateMessage> : null}

      <ContentStack
        as={isEditing ? "form" : "article"}
        id={isEditing ? `${config.category}-detail-edit-form` : undefined}
        onSubmit={isEditing ? handleEditSubmit : undefined}
      >
        <MetaBar>
          <span />
          <span>{date}</span>
        </MetaBar>

        <Label>제목</Label>
        {isEditing ? (
          <ArchiveInput
            name="title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
          />
        ) : (
          <FieldBox>{title}</FieldBox>
        )}

        <Label>작성자</Label>
        {isEditing ? (
          <ArchiveInput name="author" value={author} readOnly />
        ) : (
          <FieldBox>{author}</FieldBox>
        )}

        {isEditing ? (
          <OptionRow>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={editIsPinned}
                onChange={(event) => setEditIsPinned(event.target.checked)}
              />
              <span>게시물 고정</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={editAllowComment}
                onChange={(event) => setEditAllowComment(event.target.checked)}
              />
              <span>댓글 허용</span>
            </CheckboxLabel>
          </OptionRow>
        ) : null}

        <Label>설명</Label>
        {isEditing ? (
          <EditorBox>
            <ToastEditorField initialValue={editContent} onChange={setEditContent} />
          </EditorBox>
        ) : (
          <ViewerBox>
            <ToastViewerField value={content} />
          </ViewerBox>
        )}

        <Label>자료</Label>
        {isEditing ? (
          <AttachmentEditorPanel
            existingAttachments={editableAttachments.map((file, index) => ({
              id: file.fileId ?? `existing-${index}`,
              label: file.originalName ?? file.fileId ?? `자료 ${index + 1}`,
            }))}
            selectedFiles={editFiles}
            onSelectFiles={(files) => setEditFiles((current) => [...current, ...files])}
            onRemoveExisting={handleRemoveExistingAttachment}
            onRemoveSelected={handleRemoveSelectedFile}
            disabled={updatePostMutation.isPending}
          />
        ) : (
          <AttachmentDownloadList
            attachments={attachments.map((file, index) => ({
              id: file.fileId ?? `${file.originalName}-${index}`,
              fileId: file.fileId,
              label: file.originalName ?? file.fileId ?? `자료 ${index + 1}`,
              href: file.downloadUrl ?? "#",
            }))}
          />
        )}

        {hasChannelId && visiblePost?.allowComment !== false ? (
          <BoardCommentSection channelId={channelId} postId={postId} />
        ) : null}
      </ContentStack>
    </DocumentSection>
  );
}

const archiveActionStyle = css<{ $tone: "danger" | "edit" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid ${({ $tone }) => ($tone === "danger" ? colors.notice : colors.point)};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space20};
  color: ${({ $tone }) => ($tone === "danger" ? colors.notice : colors.point)};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${({ $tone }) => ($tone === "danger" ? colors.noticeSoft : colors.pointSoft)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ArchiveActionButton = styled.button<{ $tone: "danger" | "edit" }>`
  ${archiveActionStyle}
`;

const ActionToolbar = styled(Toolbar)`
  justify-content: flex-end;
`;

const ArchiveMutedButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background-color: ${colors.background};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ArchiveInput = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: 0.8125rem ${spacing.space12};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const EditorBox = styled.div`
  width: 100%;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};

  .toastui-editor-defaultUI {
    border: 0;
  }
`;

