"use client";

import { useState } from "react";
import { IconPaperclip } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { createPost, getPost, updatePost } from "@/api/post/post.api";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import { resolveArchiveChannel } from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import {
  ActionButton,
  DocumentSection,
  Form,
  HiddenFileInput,
  Label,
  PageTitle,
  StateMessage,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  getUploadArchiveDocument,
  publishArchivePostWithNewFiles,
} from "@/components/staff/archive/archive-document-section/archiveDocumentUpload";
import { queryKeys } from "@/lib/queryKeys";
import type { ArchiveDocumentConfig } from "@/mocks/archiveDocuments";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

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
  const [files, setFiles] = useState<File[]>([]);

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
  const existingAttachments = postDetailQuery.data?.attachments ?? [];
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
      const allowComment = false;
      const uploadArchiveDocument = getUploadArchiveDocument(config.category);
      const sortOrderStart = isEditMode ? existingAttachments.length : 0;

      if (uploadArchiveDocument && files.length > 0) {
        return publishArchivePostWithNewFiles({
          channelId,
          title,
          contentHtml,
          allowComment,
          files,
          uploadDocument: uploadArchiveDocument,
          sortOrderStart,
          errorLabel: config.title,
          ...(isEditMode
            ? { mode: "update", postId: editPostId }
            : { mode: "create" }),
        });
      }

      return isEditMode
        ? updatePost(
            { channelId, postId: editPostId },
            { title, contentHtml, status: "PUBLISHED", allowComment },
          )
        : createPost({ channelId }, { title, contentHtml, status: "PUBLISHED", allowComment });
    },
    onSuccess: async (post) => {
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
  });

  const canSubmit =
    visibleTitle.trim().length > 0 &&
    visibleDescription.trim().length > 0 &&
    Boolean(channelId) &&
    canManagePost &&
    !isPending;
  const canShowDescriptionEditor =
    !isEditMode || Boolean(postDetailQuery.data) || postDetailQuery.isError;

  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>{isEditMode ? `${config.title} 수정하기` : config.writeTitle}</PageTitle>
        <ActionButton type="submit" form={`${config.category}-form`} disabled={!canSubmit}>
          {isEditMode ? "수정 완료" : "작성 완료"}
        </ActionButton>
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
        <FileUploadPanel>
          {existingAttachments.map((file, index) => (
            <span key={`${file.fileId ?? file.originalName}-${index}`}>
              {file.originalName ?? file.fileId ?? `자료 ${index + 1}`}
            </span>
          ))}
          {files.length > 0 ? (
            files.map((file) => <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>)
          ) : existingAttachments.length === 0 ? (
            <span>선택된 파일이 없습니다.</span>
          ) : null}
          <FileSelectLabel>
            <IconPaperclip aria-hidden="true" size={16} stroke={2.25} />
            <span>파일 선택</span>
            <HiddenFileInput
              type="file"
              name="files"
              multiple
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
              }}
            />
          </FileSelectLabel>
        </FileUploadPanel>

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

const EditorBox = styled.div`
  width: 100%;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};

  .toastui-editor-defaultUI {
    border: 0;
  }
`;

const FileUploadPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space20};
  width: 100%;
  min-height: 6.875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: ${spacing.space20};

  > span {
    color: ${colors.text};
    font-size: ${typography.fontSize14};
    font-weight: 500;
    line-height: ${typography.lineHeight130};
    text-decoration: underline;
    text-underline-position: from-font;
  }

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    gap: 1.875rem;

    > span {
      font-size: ${typography.fontSize20};
    }
  }
`;

const FileSelectLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space4};
  min-height: 1.9375rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.pointSoft};
  padding: 0.5rem 0.625rem;
  color: ${colors.point};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    background-color: #e5f5db;
  }

  @media (min-width: 120rem) {
    min-height: 2.75rem;
    padding: 0.625rem 0.9375rem;
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;
