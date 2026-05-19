"use client";

import { IconDownload } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled, { css } from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { deletePost, getPost } from "@/api/post/post.api";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import { resolveArchiveChannel } from "@/components/staff/archive/archive-document-section/ArchiveDocumentListPage";
import {
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
import { queryKeys } from "@/lib/queryKeys";
import type { ArchiveDocumentConfig } from "@/mocks/archiveDocuments";
import { colors, radii, spacing, typography } from "@/styles/tokens";
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
  const { user } = useAuthSession();

  const channelsQuery = useQuery({
    queryKey: ["staff", "archive", "channels"],
    queryFn: () => getChannels({ channelType: "CUSTOM", isActive: true }),
    enabled: typeof initialChannelId !== "number",
    retry: false,
  });

  const channel = resolveArchiveChannel(channelsQuery.data, config);
  const channelId = initialChannelId ?? channel?.id ?? config.channelId;
  const hasChannelId = typeof channelId === "number" && Number.isFinite(channelId);

  const postQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(channelId ?? 0, postId),
    queryFn: () => getPost({ channelId: channelId ?? 0, postId }),
    enabled: hasChannelId,
    retry: false,
  });

  const visiblePost = postQuery.data;
  const date = formatUtcToKstShortDate(visiblePost?.createdAt ?? visiblePost?.updatedAt);
  const title = visiblePost?.title ?? "제목";
  const author = visiblePost?.authorName ?? "홍길동";
  const content = visiblePost?.contentHtml?.trim() || "설명";
  const attachments = visiblePost?.attachments ?? [];
  const editHref =
    hasChannelId && visiblePost?.id
      ? `${config.listPath}/new?postId=${visiblePost.id}&channelId=${channelId}`
      : `${config.listPath}/new`;
  const canManagePost =
    user?.role === "ADMIN" ||
    (typeof user?.id === "number" && visiblePost?.authorId === user.id) ||
    Boolean(
      visiblePost?.authorName &&
        (visiblePost.authorName === user?.name ||
          visiblePost.authorName === user?.nickname ||
          visiblePost.authorName === user?.email),
    );

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost({ channelId: channelId ?? 0, postId }),
    onSuccess: () => {
      router.push(config.listPath);
    },
  });

  const stateMessage = !hasChannelId
    ? `${config.title} 채널 정보를 찾지 못했습니다.`
    : postQuery.isLoading
      ? `${config.title}를 불러오는 중입니다.`
      : postQuery.isError && !visiblePost
        ? `${config.title}를 불러오지 못했습니다.`
        : deletePostMutation.isError
          ? `${config.title} 삭제에 실패했습니다.`
          : "";

  return (
    <DocumentSection>
      <Toolbar>
        <ActionLink href={config.listPath} $variant="muted">
          목록
        </ActionLink>

        {canManagePost ? (
          <ToolbarRight>
            <ArchiveActionButton
              type="button"
              $tone="danger"
              disabled={!hasChannelId || deletePostMutation.isPending}
              onClick={() => deletePostMutation.mutate()}
            >
              삭제
            </ArchiveActionButton>
            <ArchiveActionLink href={editHref} $tone="edit">
              수정
            </ArchiveActionLink>
          </ToolbarRight>
        ) : null}
      </Toolbar>

      {stateMessage ? <StateMessage>{stateMessage}</StateMessage> : null}

      <ContentStack>
        <MetaBar>
          <span />
          <span>{date}</span>
        </MetaBar>

        <Label>제목</Label>
        <FieldBox>{title}</FieldBox>

        <Label>작성자</Label>
        <FieldBox>{author}</FieldBox>

        <Label>설명</Label>
        <ViewerBox>
          <ToastViewerField value={content} />
        </ViewerBox>

        <Label>자료</Label>
        <FileList>
          {attachments.length > 0 ? (
            attachments.map((file, index) => {
              const fileName = file.originalName ?? file.fileId ?? `자료 ${index + 1}`;
              const fileUrl = file.downloadUrl ?? file.url ?? "#";

              return (
                <FileLink key={`${file.fileId ?? fileName}-${index}`} href={fileUrl}>
                  <span>{fileName}</span>
                  <DownloadBadge aria-hidden="true">
                    <IconDownload size={16} stroke={2.25} />
                  </DownloadBadge>
                </FileLink>
              );
            })
          ) : (
            <FileLink href="#" aria-disabled="true">
              <span>첨부된 자료가 없습니다.</span>
            </FileLink>
          )}
        </FileList>
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

const ArchiveActionLink = styled(Link)<{ $tone: "danger" | "edit" }>`
  ${archiveActionStyle}
`;
