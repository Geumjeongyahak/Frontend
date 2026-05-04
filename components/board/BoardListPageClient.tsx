"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getPosts } from "@/api/post/post.api";
import BoardDropdown from "@/components/board/BoardDropdown";
import BoardShell from "@/components/board/BoardShell";
import {
  BOARD_TYPE_OPTIONS,
  type BoardType,
  getBoardScopeOptions,
} from "@/components/board/boardOptions";
import ListPanel, { type ListPanelRow } from "@/components/staff/ListPanel";
import { queryKeys } from "@/lib/queryKeys";
import { layout, spacing } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const POSTS_PER_PAGE = 8;
type OpenDropdown = "type" | "scope" | null;

type BoardListPageClientProps = {
  initialPage: number;
};

export default function BoardListPageClient({ initialPage }: BoardListPageClientProps) {
  const [boardType, setBoardType] = useState<BoardType>("all");
  const [boardScope, setBoardScope] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  const currentPage = Number.isInteger(initialPage) && initialPage >= 1 ? initialPage : 1;
  const scopeOptions = getBoardScopeOptions(boardType);
  const isScopeDisabled = boardType === "all";

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.boardList(currentPage, boardType, boardScope),
    queryFn: () =>
      getPosts({
        channelType: boardType === "all" ? undefined : boardType,
        page: currentPage - 1,
        size: POSTS_PER_PAGE,
      }),
    retry: false,
  });

  const posts = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const rows: ListPanelRow[] = posts.map((post, index) => {
    const isNotice = Boolean(post.isPinned) || post.postType === "NOTICE";

    return {
      id: post.id ?? index + 1,
      no: isNotice
        ? "공지"
        : String((currentPage - 1) * POSTS_PER_PAGE + index + 1).padStart(2, "0"),
      className: post.channelName ?? "-",
      title: post.title ?? "제목 없음",
      author: post.authorName ?? "-",
      date: formatUtcToKstShortDate(post.createdAt ?? post.updatedAt),
      status: "",
      detailHref: `/board/${post.id ?? ""}${
        typeof post.channelId === "number" ? `?channelId=${post.channelId}` : ""
      }`,
      isNotice,
    };
  });

  const emptyMessage = isLoading
    ? "게시글을 불러오는 중입니다."
    : isError
      ? "게시글을 불러오지 못했습니다."
      : "게시글이 없습니다.";

  return (
    <BoardShell>
      <ListPanel
        title="게시판"
        writeLabel="글쓰기"
        writeHref="/board/new"
        listPath="/board"
        rows={rows}
        currentPage={Math.min(currentPage, totalPages)}
        totalPages={totalPages}
        showMineOnlyToggle={false}
        showStatusColumn={false}
        classHeader="부서"
        emptyMessage={emptyMessage}
        headerTone="archive"
        filterSlot={
          <FilterBar aria-label="게시판 필터">
            <BoardDropdown
              label="게시판 유형"
              options={BOARD_TYPE_OPTIONS}
              value={boardType}
              isOpen={openDropdown === "type"}
              onToggle={() => setOpenDropdown((current) => (current === "type" ? null : "type"))}
              onSelect={(nextValue) => {
                setBoardType(nextValue);
                setBoardScope("all");
                setOpenDropdown(null);
              }}
              width="compact"
            />

            <BoardDropdown
              label="게시판 선택"
              options={scopeOptions}
              value={boardScope}
              disabled={isScopeDisabled}
              isOpen={openDropdown === "scope"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "scope" || isScopeDisabled ? null : "scope",
                )
              }
              onSelect={(nextValue) => {
                setBoardScope(nextValue);
                setOpenDropdown(null);
              }}
              width="compact"
            />
          </FilterBar>
        }
      />
    </BoardShell>
  );
}

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;
