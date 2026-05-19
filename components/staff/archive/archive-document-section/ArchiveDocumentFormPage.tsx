"use client";

import { useState } from "react";
import { IconPaperclip } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getChannels } from "@/api/channel/channel.api";
import {
  attachPostAttachment,
  createPost,
  getPost,
  updatePost,
} from "@/api/post/post.api";
import { resolveArchiveChannel } from "@/components/staff/archive/archive-document-section/ArchiveDocumentListPage";
import {
  ActionButton,
  DocumentSection,
  FileSelectLabel,
  FileUploadPanel,
  Form,
  HiddenFileInput,
  Input,
  Label,
  PageTitle,
  StateMessage,
  Textarea,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import type { ArchiveDocumentConfig } from "@/mocks/archiveDocuments";

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
    queryFn: () => getChannels({ channelType: "CUSTOM", isActive: true }),
    enabled: !isEditMode,
    retry: false,
  });

  const channel = resolveArchiveChannel(channelsQuery.data, config);
  const channelId = isEditMode ? editChannelId : (channel?.id ?? config.channelId);

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

      const post = isEditMode
        ? await updatePost(
            { channelId, postId: editPostId },
            {
              title: visibleTitle.trim(),
              contentHtml: visibleDescription.trim(),
              status: "PUBLISHED",
              allowComment: false,
            },
          )
        : await createPost(
            { channelId },
            {
              title: visibleTitle.trim(),
              contentHtml: visibleDescription.trim(),
              status: "PUBLISHED",
              allowComment: false,
            },
          );

      if (typeof post.id === "number") {
        await Promise.all(
          files.map((file) =>
            attachPostAttachment({ channelId, postId: post.id as number }, file, file.name),
          ),
        );
      }

      return post;
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

      router.push(config.listPath);
    },
  });

  const canSubmit =
    visibleTitle.trim().length > 0 &&
    visibleDescription.trim().length > 0 &&
    Boolean(channelId) &&
    canManagePost &&
    !isPending;

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
        <Input
          id={`${config.category}-title`}
          name="title"
          placeholder="제목"
          value={visibleTitle}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Label as="label" htmlFor={`${config.category}-author`}>
          작성자
        </Label>
        <Input
          id={`${config.category}-author`}
          name="author"
          placeholder="홍길동"
          value={visibleAuthor}
          readOnly
        />

        <Label as="label" htmlFor={`${config.category}-description`}>
          설명
        </Label>
        <Textarea
          id={`${config.category}-description`}
          name="description"
          placeholder="설명"
          value={visibleDescription}
          onChange={(event) => setDescription(event.target.value)}
        />

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
        {!canManagePost ? (
          <StateMessage>이 글을 수정할 권한이 없습니다.</StateMessage>
        ) : null}
        {isError ? (
          <StateMessage>
            {isEditMode ? `${config.title} 수정에 실패했습니다.` : `${config.title} 작성에 실패했습니다.`}
          </StateMessage>
        ) : null}
      </Form>
    </DocumentSection>
  );
}
