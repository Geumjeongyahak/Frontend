"use client";

import { useMemo, useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getPosts } from "@/api/post/post.api";
import type { PostSummaryResponseDto } from "@/api/post/post.dto";
import { resolveArchiveChannel } from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import {
  ARCHIVE_DOCUMENTS_PER_PAGE,
  type ArchiveDocumentConfig,
} from "@/mocks/archiveDocuments";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type ArchiveDocumentListPageProps = {
  config: ArchiveDocumentConfig;
  initialPage: number;
};

function getPostTime(post: PostSummaryResponseDto) {
  const dateValue = post.createdAt ?? post.updatedAt;
  if (!dateValue) return 0;

  const time = new Date(dateValue).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function isPinnedPost(post: PostSummaryResponseDto) {
  return Boolean(post.isPinned);
}

export default function ArchiveDocumentListPage({
  config,
  initialPage,
}: ArchiveDocumentListPageProps) {
  const router = useRouter();
  const { user, status: authStatus } = useAuthSession();
  const [mineOnly, setMineOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);

  const requestedPage = Number.isInteger(initialPage) && initialPage >= 1 ? initialPage : 1;
  const isAuthenticated = authStatus === "authenticated";
  const currentAuthor = user?.name ?? user?.nickname ?? user?.email;
  const resetToFirstPage = () => {
    if (requestedPage > 1) {
      router.replace(config.listPath, { scroll: false });
    }
  };

  const channelsQuery = useQuery({
    queryKey: ["staff", "archive", "channels"],
    queryFn: () => getChannels({ isActive: true }),
    enabled: isAuthenticated,
    retry: false,
  });

  const channel = useMemo(
    () => (isAuthenticated ? resolveArchiveChannel(channelsQuery.data, config) : undefined),
    [channelsQuery.data, config, isAuthenticated],
  );
  const channelId = channel?.id ?? (channelsQuery.isError ? config.channelId : undefined);
  const channelType = channel?.channelType;

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.boardList({
      page: requestedPage,
      channelType: channelType ?? "RESOURCE",
      boardScope: String(channelId),
      searchKeyword,
      mineOnly,
      author: currentAuthor,
      refreshNonce,
    }),
    queryFn: () =>
      getPosts({
        channelType,
        channelId,
        title: searchKeyword.trim() || undefined,
        page: Math.max(0, requestedPage - 1),
        size: ARCHIVE_DOCUMENTS_PER_PAGE,
    }),
    enabled: isAuthenticated && Boolean(channelId),
    retry: false,
  });

  const filteredPosts = (isAuthenticated ? (postsQuery.data?.content ?? []) : [])
    .filter((post) => {
      if (!mineOnly) return true;
      if (typeof user?.id === "number" && post.authorId === user.id) return true;
      return Boolean(
        currentAuthor &&
          (post.authorName === user?.name ||
            post.authorName === user?.nickname ||
            post.authorName === user?.email),
      );
    })
    .sort((a, b) => {
      const pinnedDiff = Number(isPinnedPost(b)) - Number(isPinnedPost(a));
      if (pinnedDiff !== 0) return pinnedDiff;
      return getPostTime(b) - getPostTime(a);
    });

  // ponytail: mine-only stays page-local until the archive API has a confirmed author filter.
  const totalPages = mineOnly
    ? Math.max(1, Math.ceil(filteredPosts.length / ARCHIVE_DOCUMENTS_PER_PAGE))
    : Math.max(1, postsQuery.data?.totalPages ?? 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const pagedPosts = filteredPosts;
  const totalCount = mineOnly ? filteredPosts.length : (postsQuery.data?.totalElements ?? filteredPosts.length);

  const rows: ListPanelRow[] = pagedPosts.map((post, index) => ({
    id: post.id ?? index + 1,
    no: String(
      Math.max(1, totalCount - ((currentPage - 1) * ARCHIVE_DOCUMENTS_PER_PAGE + index)),
    ).padStart(2, "0"),
    className: "",
    title: post.title ?? "제목 없음",
    author: post.authorName ?? "-",
    date: formatUtcToKstShortDate(post.createdAt ?? post.updatedAt),
    status: "",
    detailHref: `${config.listPath}/${post.id ?? ""}?channelId=${post.channelId ?? channelId}`,
    isPinned: post.isPinned,
  }));

  const emptyMessage = postsQuery.isLoading
    ? `${config.title}를 불러오는 중입니다.`
    : postsQuery.isError
      ? `${config.title}를 불러오지 못했습니다.`
      : config.emptyMessage;

  return (
    <ListPanel
      title={config.title}
      writeLabel={config.writeLabel}
      writeHref={`${config.listPath}/new`}
      showWriteButton={isAuthenticated}
      listPath={config.listPath}
      rows={isAuthenticated ? rows : []}
      currentPage={currentPage}
      totalPages={totalPages}
      stableTableRows={ARCHIVE_DOCUMENTS_PER_PAGE}
      mineOnly={mineOnly}
      showMineOnlyToggle
      toggleLabel="내가 작성한 글만 보기"
      toggleAriaLabel="내가 작성한 글만 보기"
      onMineOnlyToggle={() => setMineOnly((current) => !current)}
      emptyMessage={
        authStatus === "loading"
          ? "사용자 정보를 확인하는 중입니다."
          : !isAuthenticated
            ? "로그인이 필요합니다."
            : emptyMessage
      }
      headerTone="archive"
      writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
      showClassColumn={false}
      showStatusColumn={false}
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
            aria-label={`${config.title} 검색`}
            placeholder="검색어를 입력해주세요"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <SearchButton type="submit" aria-label="검색">
            <IconSearch size={18} stroke={2.25} />
          </SearchButton>
        </SearchForm>
      }
    />
  );
}

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
  border: 0;
  border-bottom: 1px solid ${colors.muted};
  background: ${colors.white};
  padding: 0.5rem 0;
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};

  &::placeholder {
    color: ${colors.muted};
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
  border-radius: ${radii.radius30};
  background: ${colors.text};
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3.25rem;
    height: 3.25rem;
  }
`;
