"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { deleteAttachment } from "@/api/file/file.api";
import { createPost, getPost, pinPost, updatePost } from "@/api/post/post.api";
import type { PostAttachmentInfoDto } from "@/api/post/post.dto";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import { AttachmentEditorPanel } from "@/components/common/AttachmentField";
import { FileUploadProgressNotice } from "@/components/common/FileUploadProgress";
import { resolveArchiveChannel } from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import {
  ActionButton,
  CheckboxInput,
  CheckboxLabel,
  DocumentSection,
  Form,
  Label,
  OptionRow,
  PageTitle,
  StateMessage,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  getUploadArchiveDocument,
  publishArchivePostWithNewFiles,
} from "@/components/staff/archive/archive-document-section/archiveDocumentUpload";
import type { ArchiveDocumentConfig } from "@/config/archiveDocuments";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type ArchiveDocumentFormPageProps = {
  config: ArchiveDocumentConfig;
  editPostId?: number;
  editChannelId?: number;
};

export default function ArchiveDocumentFormPage({
  config,
  editPostId,
  editChannelId,
}: ArchiveDocumentFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const isEditMode = typeof editPostId === "number" && typeof editChannelId === "number";
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isPinned, setIsPinned] = useState<boolean | undefined>(undefined);
  const [allowComment, setAllowComment] = useState<boolean | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [editableAttachments, setEditableAttachments] = useState<PostAttachmentInfoDto[] | null>(
    null,
  );
  const shouldShowUploadToastRef = useRef(false);

  const channelsQuery = useQuery({
    queryKey: ["staff", "archive", "channels"],
    queryFn: () => getChannels({ isActive: true }),
    enabled: !isEditMode,
    retry: false,
  });

  const channel = resolveArchiveChannel(channelsQuery.data, config);
  const channelId = isEditMode
    ? editChannelId
    : (channel?.id ?? (channelsQuery.isError ? config.channelId : undefined));

  const postDetailQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(editChannelId ?? 0, editPostId ?? 0),
    queryFn: () => getPost({ channelId: editChannelId ?? 0, postId: editPostId ?? 0 }),
    enabled: isEditMode,
    retry: false,
  });

  const currentUserName = user?.name ?? user?.nickname ?? user?.email ?? "";
  const visibleTitle = title ?? postDetailQuery.data?.title ?? "";
  const visibleAuthor = postDetailQuery.data?.authorName ?? currentUserName;
  const visibleDescription = description ?? postDetailQuery.data?.contentHtml ?? "";
  const visibleIsPinned = isPinned ?? postDetailQuery.data?.isPinned ?? false;
  const visibleAllowComment = allowComment ?? postDetailQuery.data?.allowComment ?? true;
  const existingAttachments = postDetailQuery.data?.attachments ?? [];
  const visibleExistingAttachments = editableAttachments ?? existingAttachments;

  const canManagePost =
    !isEditMode ||
    user?.role === "ADMIN" ||
    (typeof user?.id === "number" && postDetailQuery.data?.authorId === user.id) ||
    Boolean(
      postDetailQuery.data?.authorName &&
      (postDetailQuery.data.authorName === user?.name ||
        postDetailQuery.data.authorName === user?.nickname ||
        postDetailQuery.data.authorName === user?.email),
    );

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      if (!channelId) {
        throw new Error(`${config.title} 채널을 찾을 수 없습니다.`);
      }

      const title = visibleTitle.trim();
      const contentHtml = visibleDescription.trim();
      const uploadArchiveDocument = getUploadArchiveDocument(config.category);
      const sortOrderStart = isEditMode ? visibleExistingAttachments.length : 0;
      const hasFileUpload = Boolean(uploadArchiveDocument) && files.length > 0;
      shouldShowUploadToastRef.current = hasFileUpload;

      if (hasFileUpload && uploadArchiveDocument) {
        return publishArchivePostWithNewFiles({
          channelId,
          title,
          contentHtml,
          allowComment: visibleAllowComment,
          isPinned: visibleIsPinned,
          files,
          uploadDocument: uploadArchiveDocument,
          sortOrderStart,
          errorLabel: config.title,
          ...(isEditMode
            ? {
                mode: "update",
                postId: editPostId,
                initialPinned: postDetailQuery.data?.isPinned ?? false,
              }
            : { mode: "create" }),
        });
      }

      if (isEditMode) {
        const updatedPost = await updatePost(
          { channelId, postId: editPostId },
          { title, contentHtml, status: "PUBLISHED", allowComment: visibleAllowComment },
        );

        if (visibleIsPinned !== (postDetailQuery.data?.isPinned ?? false)) {
          await pinPost({ channelId, postId: editPostId }, { isPinned: visibleIsPinned });
        }

        return updatedPost;
      }

      return createPost(
        {
          channelId,
        },
        {
          title,
          contentHtml,
          status: "PUBLISHED",
          allowComment: visibleAllowComment,
          isPinned: visibleIsPinned,
        },
      );
    },
    onSuccess: async (post) => {
      if (shouldShowUploadToastRef.current) {
        toast.success("파일 업로드가 완료되었습니다.");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) }),
        typeof post.channelId === "number" && typeof post.id === "number"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(post.channelId, post.id),
            })
          : Promise.resolve(),
      ]);

      if (typeof post.id === "number" && typeof post.channelId === "number") {
        router.push(`${config.listPath}/${post.id}?channelId=${post.channelId}`);
        return;
      }

      router.push(config.listPath);
    },
    onError: () => {
      shouldShowUploadToastRef.current = false;
    },
  });

  const canSubmit =
    visibleTitle.trim().length > 0 &&
    visibleDescription.trim().length > 0 &&
    Boolean(channelId) &&
    canManagePost &&
    !isPending;
  const canShowDescriptionEditor =
    !isEditMode || Boolean(postDetailQuery.data) || postDetailQuery.isError;

  async function handleRemoveExistingAttachment(fileId: string) {
    const currentAttachments = visibleExistingAttachments;
    await deleteAttachment({ fileId });
    setEditableAttachments(currentAttachments.filter((file) => file.fileId !== fileId));
  }

  function handleRemoveSelectedFile(file: File) {
    setFiles((current) =>
      current.filter(
        (item) => !(item.name === file.name && item.lastModified === file.lastModified),
      ),
    );
  }

  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>{isEditMode ? `${config.title} 수정하기` : config.writeTitle}</PageTitle>
        <ToolbarActions>
          {isPending && files.length > 0 ? <FileUploadProgressNotice /> : null}
          <ActionButton type="submit" form={`${config.category}-form`} disabled={!canSubmit}>
            {isEditMode ? "수정 완료" : "작성 완료"}
          </ActionButton>
        </ToolbarActions>
      </Toolbar>

      <Form
        id={`${config.category}-form`}
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) mutate();
        }}
      >
        <Label as="label" htmlFor={`${config.category}-title`}>
          제목
        </Label>
        <ArchiveInput
          id={`${config.category}-title`}
          name="title"
          placeholder="제목"
          value={visibleTitle}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Label as="label" htmlFor={`${config.category}-author`}>
          작성자
        </Label>
        <ArchiveInput
          id={`${config.category}-author`}
          name="author"
          placeholder="홍길동"
          value={visibleAuthor}
          readOnly
        />

        <OptionRow>
          <CheckboxLabel>
            <CheckboxInput
              type="checkbox"
              checked={visibleIsPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
            />
            <span>게시물 고정</span>
          </CheckboxLabel>
          <CheckboxLabel>
            <CheckboxInput
              type="checkbox"
              checked={visibleAllowComment}
              onChange={(event) => setAllowComment(event.target.checked)}
            />
            <span>댓글 허용</span>
          </CheckboxLabel>
        </OptionRow>

        <Label as="label" htmlFor={`${config.category}-description`}>
          설명
        </Label>
        {canShowDescriptionEditor ? (
          <EditorBox>
            <ToastEditorField
              initialValue={visibleDescription}
              onChange={(contentHtml) => setDescription(contentHtml)}
            />
          </EditorBox>
        ) : (
          <StateMessage>본문 편집기를 불러오는 중입니다.</StateMessage>
        )}

        <Label>자료</Label>
        <AttachmentEditorPanel
          existingAttachments={visibleExistingAttachments.map((file, index) => ({
            id: file.fileId ?? `existing-${index}`,
            label: file.originalName ?? file.fileId ?? `자료 ${index + 1}`,
          }))}
          selectedFiles={files}
          onSelectFiles={(nextFiles) => setFiles((current) => [...current, ...nextFiles])}
          onRemoveExisting={handleRemoveExistingAttachment}
          onRemoveSelected={handleRemoveSelectedFile}
          disabled={isPending}
        />

        {postDetailQuery.isError ? (
          <StateMessage>수정할 {config.title} 내용을 불러오지 못했습니다.</StateMessage>
        ) : null}
        {!canManagePost ? <StateMessage>이 글을 수정할 권한이 없습니다.</StateMessage> : null}
        {isError ? (
          <StateMessage>
            {isEditMode
              ? `${config.title} 수정에 실패했습니다.`
              : `${config.title} 작성에 실패했습니다.`}
          </StateMessage>
        ) : null}
      </Form>
    </DocumentSection>
  );
}

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

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:read-only {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

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

const EditorBox = styled.div`
  width: 100%;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};

  .toastui-editor-defaultUI {
    border: 0;
  }
`;
