"use client";

import { useMemo, useState } from "react";
import { IconPaperclip } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getChannels } from "@/api/channel/channel.api";
import { createPost, getPost, updatePost } from "@/api/post/post.api";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
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
  FileSelectLabel,
  FileUploadPanel,
  Form,
  HiddenFileInput,
  Input,
  Label,
  PageTitle,
  StateMessage,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { boardFileToGoogleDrive } from "@/lib/googleDrive/boardFileToGoogleDrive";
import { queryKeys } from "@/lib/queryKeys";

type EventFormPageClientProps = {
  editPostId?: number;
  editChannelId?: number;
};

export default function EventFormPageClient({ editPostId, editChannelId }: EventFormPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status, user } = useAuthSession();
  const isEditMode = typeof editPostId === "number" && typeof editChannelId === "number";
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [contentHtml, setContentHtml] = useState<string | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
  const canManagePost =
    !isEditMode ? status === "authenticated" : canManageEventPost(user, postDetailQuery.data);

  const uploadEventFiles = async (files: File[]) => {
    if (files.length === 0) return;

    await Promise.all(files.map((file) => boardFileToGoogleDrive(file)));
  };

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

      if (isEditMode) {
        const updated = await updatePost(
          { channelId, postId: editPostId },
          {
            title: visibleTitle.trim(),
            contentHtml: visibleContentHtml.trim(),
            status: "PUBLISHED",
            allowComment: true,
            thumbnailUrl,
          },
        );

        await uploadEventFiles(selectedFiles);

        return updated;
      }

      const created = await createPost(
        { channelId },
        {
          title: visibleTitle.trim(),
          contentHtml: visibleContentHtml.trim(),
          status: "PUBLISHED",
          allowComment: true,
          thumbnailUrl: thumbnailUrl || undefined,
        },
      );

      await uploadEventFiles(selectedFiles);

      return created;
    },
    onSuccess: async (post) => {
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
  });

  const canSubmit =
    status === "authenticated" &&
    visibleTitle.trim().length > 0 &&
    visibleContentHtml.trim().length > 0 &&
    Boolean(isEditMode ? editChannelId : eventChannel?.id) &&
    canManagePost &&
    !isPending;

  return (
    <EventDocumentLayout>
      <DocumentSection>
        <Toolbar>
          <PageTitle>{isEditMode ? "행사 정보 수정" : "행사 정보 작성"}</PageTitle>
          <ActionButton type="submit" form="event-form" disabled={!canSubmit}>
            {isEditMode ? "수정 완료" : "작성 완료"}
          </ActionButton>
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
          <ToastEditorField initialValue={visibleContentHtml} onChange={setContentHtml} />

          <Label>자료</Label>
          <FileUploadPanel>
            {selectedFiles.length > 0 ? (
              selectedFiles.map((file, index) => (
                <span key={`${file.name}-${index}`}>{file.name}</span>
              ))
            ) : (
              <span>선택된 파일이 없습니다.</span>
            )}
            <FileSelectLabel>
              <IconPaperclip aria-hidden="true" size={16} stroke={2.25} />
              <span>파일 선택</span>
              <HiddenFileInput
                type="file"
                name="files"
                multiple
                onChange={(event) => {
                  setSelectedFiles(Array.from(event.target.files ?? []));
                }}
              />
            </FileSelectLabel>
          </FileUploadPanel>

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
