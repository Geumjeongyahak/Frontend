"use client";

import { useMemo, useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import type { PostSummaryResponseDto } from "@/api/post/post.dto";
import { getPosts } from "@/api/post/post.api";
import BoardDropdown, { type DropdownOption } from "@/components/staff/board/BoardDropdown";
import BoardShell from "@/components/staff/board/BoardShell";
import {
  BOARD_TYPE_OPTIONS,
  type BoardType,
  getBoardScopeOptions,
} from "@/components/staff/board/boardOptions";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { isArchiveDocumentPost } from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const POSTS_PER_PAGE = 7;
const FETCH_SIZE = 100;
const NOTICE_LIMIT = 2;
const NOTICE_POSTS_PER_PAGE = POSTS_PER_PAGE + NOTICE_LIMIT;
const BOARD_STABLE_TABLE_ROWS = NOTICE_POSTS_PER_PAGE;
type OpenDropdown = "type" | "scope" | null;

type BoardListPageClientProps = {
  initialPage: number;
};

function isNoticePost(post: PostSummaryResponseDto) {
  return post.channelType === "NOTICE" || post.postType === "NOTICE";
}

function isPinnedPost(post: PostSummaryResponseDto) {
  return Boolean(post.isPinned);
}

function getPostTime(post: PostSummaryResponseDto) {
  const dateValue = post.createdAt ?? post.updatedAt;
  if (!dateValue) return 0;

  const time = new Date(dateValue).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortBoardPosts(posts: PostSummaryResponseDto[], pinnedChannelId?: number) {
  return [...posts].sort((a, b) => {
    const aIsNotice = isNoticePost(a);
    const bIsNotice = isNoticePost(b);

    if (aIsNotice !== bIsNotice) {
      return aIsNotice ? -1 : 1;
    }

    const aIsChannelPinned = isPinnedPost(a) && a.channelId === pinnedChannelId;
    const bIsChannelPinned = isPinnedPost(b) && b.channelId === pinnedChannelId;

    if (aIsChannelPinned !== bIsChannelPinned) {
      return aIsChannelPinned ? -1 : 1;
    }

    return getPostTime(b) - getPostTime(a);
  });
}

export default function BoardListPageClient({ initialPage }: BoardListPageClientProps) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [boardType, setBoardType] = useState<BoardType>("all");
  const [boardScope, setBoardScope] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [mineOnly, setMineOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);

  const requestedPage = Number.isInteger(initialPage) && initialPage >= 1 ? initialPage : 1;
  const isScopeDisabled = boardType === "all" || boardType === "NOTICE";
  const currentAuthor = user?.name ?? user?.nickname ?? user?.email;
  const resetToFirstPage = () => {
    if (requestedPage > 1) {
      router.replace("/staff/board", { scroll: false });
    }
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearchKeyword("");
  };

  const channelsQuery = useQuery({
    queryKey: ["staff", "board", "channels"],
    queryFn: () => getChannels(),
    retry: false,
  });
  const classroomsQuery = useQuery({
    queryKey: ["staff", "board", "classrooms"],
    queryFn: () => getClassrooms({ size: 100 }),
    retry: false,
  });
  const departmentsQuery = useQuery({
    queryKey: ["staff", "board", "departments"],
    queryFn: () => getDepartments(),
    retry: false,
  });

  const scopeOptions = useMemo<readonly DropdownOption<string>[]>(() => {
    if (boardType === "CLASSROOM") {
      const dynamicOptions =
        classroomsQuery.data?.content
          ?.filter((classroom) => typeof classroom.id === "number")
          .map((classroom) => ({
            label: classroom.name ?? `반 ${classroom.id}`,
            value: String(classroom.id),
          })) ?? [];

      return dynamicOptions.length > 0
        ? [{ label: "전체", value: "all" }, ...dynamicOptions]
        : getBoardScopeOptions(boardType);
    }

    if (boardType === "DEPARTMENT") {
      const dynamicOptions =
        departmentsQuery.data?.departments
          ?.filter((department) => typeof department.id === "number")
          .map((department) => ({
            label: department.name ?? `부서 ${department.id}`,
            value: String(department.id),
          })) ?? [];

      return dynamicOptions.length > 0
        ? [{ label: "전체", value: "all" }, ...dynamicOptions]
        : getBoardScopeOptions(boardType);
    }

    return getBoardScopeOptions(boardType);
  }, [boardType, classroomsQuery.data, departmentsQuery.data]);

  const selectedChannelId = useMemo(() => {
    if (boardScope === "all" || isScopeDisabled) return undefined;

    const refId = Number(boardScope);
    if (!Number.isInteger(refId)) return undefined;

    return channelsQuery.data?.find(
      (channel) => channel.channelType === boardType && channel.refId === refId,
    )?.id;
  }, [boardScope, boardType, channelsQuery.data, isScopeDisabled]);

  const noticePostsQuery = useQuery({
    queryKey: ["staff", "board", "notices", NOTICE_LIMIT, refreshNonce],
    queryFn: () =>
      getPosts({
        channelType: "NOTICE",
        page: 0,
        size: NOTICE_LIMIT,
      }),
    enabled: boardType !== "NOTICE",
    retry: false,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.boardList({
      page: requestedPage,
      channelType: boardType,
      boardScope,
      searchKeyword,
      mineOnly,
      author: currentAuthor,
      refreshNonce,
    }),
    queryFn: () =>
      getPosts({
        channelType: boardType === "all" ? undefined : boardType,
        channelId: selectedChannelId,
        title: searchKeyword.trim() || undefined,
        page: 0,
        size: FETCH_SIZE,
      }),
    enabled: boardScope === "all" || isScopeDisabled || typeof selectedChannelId === "number",
    retry: false,
  });

  const rawPosts = (data?.content ?? []).filter((post) => !isArchiveDocumentPost(post));
  const posts = rawPosts.filter((post) => {
    if (!mineOnly) return true;
    if (typeof user?.id === "number" && post.authorId === user.id) return true;
    return Boolean(
      currentAuthor &&
      (post.authorName === user?.name ||
        post.authorName === user?.nickname ||
        post.authorName === user?.email),
    );
  });
  const noticePosts =
    boardType === "NOTICE"
      ? []
      : (noticePostsQuery.data?.content ?? [])
          .filter((post) => isNoticePost(post))
          .slice(0, NOTICE_LIMIT);
  const noticeIds = new Set(noticePosts.map((post) => post.id).filter(Boolean));
  const basePosts = boardType === "NOTICE" ? posts : posts.filter((post) => !isNoticePost(post));
  const filteredPosts = basePosts.filter((post) => !noticeIds.has(post.id));
  const sortedGeneralPosts = sortBoardPosts(filteredPosts, selectedChannelId);
  const totalPages =
    boardType === "NOTICE"
      ? Math.max(1, Math.ceil(sortedGeneralPosts.length / NOTICE_POSTS_PER_PAGE))
      : Math.max(1, Math.ceil(sortedGeneralPosts.length / POSTS_PER_PAGE));
  const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  const pagedGeneralPosts =
    boardType === "NOTICE"
      ? sortedGeneralPosts.slice(
          (currentPage - 1) * NOTICE_POSTS_PER_PAGE,
          currentPage * NOTICE_POSTS_PER_PAGE,
        )
      : sortedGeneralPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  const sortedPosts = [...sortBoardPosts(noticePosts), ...pagedGeneralPosts];

  const generalPosts = sortedPosts.filter((post) => !isNoticePost(post));
  const numericTotal = sortedGeneralPosts.length;

  const rows: ListPanelRow[] = sortedPosts.map((post, index) => {
    const isNotice = isNoticePost(post);
    const generalIndex = generalPosts.findIndex((item) => item === post);
    const postsPerPage = boardType === "NOTICE" ? NOTICE_POSTS_PER_PAGE : POSTS_PER_PAGE;
    const generalPostNumber = Math.max(
      1,
      numericTotal - ((currentPage - 1) * postsPerPage + generalIndex),
    );

    return {
      id: post.id ?? index + 1,
      no: isNotice ? "공지" : String(generalPostNumber).padStart(2, "0"),
      className: post.channelName ?? "-",
      title: post.title ?? "제목 없음",
      author: post.authorName ?? "-",
      date: formatUtcToKstShortDate(post.createdAt ?? post.updatedAt),
      status: "",
      detailHref: `/staff/board/${post.id ?? ""}${
        typeof post.channelId === "number" ? `?channelId=${post.channelId}` : ""
      }`,
      isNotice,
      isPinned: post.isPinned,
    };
  });

  const isListLoading = isLoading;
  const isListError = isError;
  const emptyMessage = isListLoading
    ? "게시글을 불러오는 중입니다."
    : isListError
      ? "게시글을 불러오지 못했습니다."
      : "게시글이 없습니다.";

  return (
    <BoardShell>
      <ListPanel
        title="게시판"
        writeLabel="글쓰기"
        writeHref="/staff/board/new"
        listPath="/staff/board"
        rows={rows}
        currentPage={currentPage}
        totalPages={totalPages}
        stableTableRows={BOARD_STABLE_TABLE_ROWS}
        mineOnly={mineOnly}
        showMineOnlyToggle
        toggleLabel="내가 작성한 글만 보기"
        toggleAriaLabel="내가 작성한 글만 보기"
        onMineOnlyToggle={() => setMineOnly((current) => !current)}
        showStatusColumn={false}
        classHeader="부서"
        emptyMessage={emptyMessage}
        headerTone="archive"
        writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
        filterSlot={
          <FilterBar aria-label="게시판 필터">
            <BoardDropdown
              label="게시판 유형"
              options={BOARD_TYPE_OPTIONS}
              value={boardType}
              isOpen={openDropdown === "type"}
              onToggle={() => setOpenDropdown((current) => (current === "type" ? null : "type"))}
              onSelect={(nextValue) => {
                resetToFirstPage();
                clearSearch();
                setBoardType(nextValue);
                setBoardScope("all");
                setOpenDropdown(null);
                setRefreshNonce((current) => current + 1);
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
                resetToFirstPage();
                clearSearch();
                setBoardScope(nextValue);
                setOpenDropdown(null);
                setRefreshNonce((current) => current + 1);
              }}
              width="compact"
            />
          </FilterBar>
        }
        searchSlot={
          <SearchForm
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              resetToFirstPage();
              setSearchKeyword(searchInput);
              setRefreshNonce((current) => current + 1);
            }}
          >
            <SearchInput
              aria-label="게시글 검색"
              placeholder="검색어를 입력하세요"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <SearchButton type="submit" aria-label="검색">
              <IconSearch size={18} stroke={2.25} />
            </SearchButton>
          </SearchForm>
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

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 13.75rem;
  min-height: 2.25rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius15};
  background: ${colors.white};
  padding: 0.5rem ${spacing.space16};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};

  &::placeholder {
    color: ${colors.placeholder};
  }

  @media (min-width: 120rem) {
    width: 20.625rem;
    min-height: 3rem;
    font-size: ${typography.fontSize20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex: 1 1 auto;
    width: 100%;
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: ${colors.text};
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3rem;
    height: 3rem;
  }
`;
