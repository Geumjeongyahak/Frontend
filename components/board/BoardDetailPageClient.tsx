"use client";

import { IconDownload } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/api/post/post.api";
import BoardShell from "@/components/board/BoardShell";
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
  TextBox,
  Toolbar,
  ToolbarRight,
} from "@/components/board/BoardDocument.styles";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type BoardDetailPageClientProps = {
  postId: number;
  channelId?: number;
};

function toPlainText(contentHtml?: string) {
  if (!contentHtml) return "내용";

  return contentHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export default function BoardDetailPageClient({ postId, channelId }: BoardDetailPageClientProps) {
  const hasChannelId = typeof channelId === "number" && Number.isFinite(channelId);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.boardDetail(channelId ?? 0, postId),
    queryFn: () => getPost({ channelId: channelId ?? 0, postId }),
    enabled: hasChannelId,
    retry: false,
  });

  const metaLabel = data?.channelName ?? "교무기획부";
  const date = formatUtcToKstShortDate(data?.createdAt ?? data?.updatedAt);
  const title = data?.title ?? "제목";
  const author = data?.authorName ?? "홍길동";
  const content = toPlainText(data?.contentHtml);
  const stateMessage = !hasChannelId
    ? "게시글 채널 정보가 없어 상세 내용을 불러오지 못했습니다."
    : isLoading
      ? "게시글을 불러오는 중입니다."
      : isError
        ? "게시글을 불러오지 못했습니다."
        : "";

  return (
    <BoardShell>
      <DocumentSection>
        <Toolbar>
          <ActionLink href="/board" $variant="muted">
            목록
          </ActionLink>

          <ToolbarRight>
            <ActionButton type="button" $variant="danger">
              삭제
            </ActionButton>
            <ActionLink href="/board/new">수정</ActionLink>
          </ToolbarRight>
        </Toolbar>

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
          <TextBox>{content}</TextBox>

          <Label>자료</Label>
          <FileList>
            <FileLink href="#" aria-label="자료.pdf 다운로드">
              <span>자료.pdf</span>
              <DownloadBadge aria-hidden="true">
                <IconDownload size={16} stroke={2.25} />
              </DownloadBadge>
            </FileLink>
          </FileList>
        </ContentStack>
      </DocumentSection>
    </BoardShell>
  );
}
