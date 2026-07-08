"use client";

import { useEffect, useMemo, useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { getPosts } from "@/api/post/post.api";
import type { PostSummaryResponseDto } from "@/api/post/post.dto";
import BoardDropdown, { type DropdownOption } from "@/components/staff/board/BoardDropdown";
import {
  CLASSROOM_WRITE_SCOPE_OPTIONS,
  DEPARTMENT_WRITE_SCOPE_OPTIONS,
} from "@/components/staff/board/boardOptions";
import {
  ARCHIVE_DOCUMENTS_PER_PAGE,
  type ArchiveDocumentConfig,
} from "@/config/archiveDocuments";
import {
  resolveArchiveChannel,
  resolveArchiveChannelByName,
} from "@/components/staff/archive/archive-document-section/archiveDocumentChannels";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type ArchiveDocumentListPageProps = {
  config: ArchiveDocumentConfig;
  initialPage: number;
};

type ArchiveScopeType = "CLASSROOM" | "DEPARTMENT";
type OpenDropdown = "type" | "scope" | null;

const ARCHIVE_SCOPE_TYPE_OPTIONS = [
  { label: "반별", value: "CLASSROOM" },
  { label: "부서별", value: "DEPARTMENT" },
] as const satisfies readonly DropdownOption<ArchiveScopeType>[];
const EMPTY_SCOPE_OPTION: DropdownOption<string> = { label: "선택", value: "__empty__" };

const CLASSROOM_SCOPE_ORDER = CLASSROOM_WRITE_SCOPE_OPTIONS.map((option) => option.label);
const DEPARTMENT_SCOPE_ORDER = DEPARTMENT_WRITE_SCOPE_OPTIONS.map((option) => option.label);

function sortOptionsByReference(
  options: DropdownOption<string>[],
  referenceOrder: readonly string[],
) {
  const orderMap = new Map(referenceOrder.map((label, index) => [label, index]));

  return [...options].sort((a, b) => {
    const aIndex = orderMap.get(a.label) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.get(b.label) ?? Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    return a.label.localeCompare(b.label, "ko");
  });
}

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
  const isHandoverPage = config.category === "handover";
  const [mineOnly, setMineOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [scopeType, setScopeType] = useState<ArchiveScopeType>("CLASSROOM");
  const [scopeValue, setScopeValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

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
  const classroomsQuery = useQuery({
    queryKey: ["staff", "archive", "handover", "classrooms"],
    queryFn: () => getClassrooms({ size: 100 }),
    enabled: isAuthenticated && isHandoverPage,
    retry: false,
  });
  const departmentsQuery = useQuery({
    queryKey: ["staff", "archive", "handover", "departments"],
    queryFn: () => getDepartments(),
    enabled: isAuthenticated && isHandoverPage,
    retry: false,
  });

  const scopeOptions = useMemo<readonly DropdownOption<string>[]>(() => {
    if (!isHandoverPage) return [];

    if (scopeType === "CLASSROOM") {
      const options =
        classroomsQuery.data?.content
          ?.filter((classroom) => typeof classroom.id === "number")
          .map((classroom) => ({
            label: classroom.name ?? `반 ${classroom.id}`,
            value: String(classroom.id),
          })) ?? [];

      return sortOptionsByReference(options, CLASSROOM_SCOPE_ORDER);
    }

    const options =
      departmentsQuery.data?.departments
        ?.filter((department) => typeof department.id === "number")
        .map((department) => ({
          label: department.name ?? `부서 ${department.id}`,
          value: String(department.id),
        })) ?? [];

    return sortOptionsByReference(options, DEPARTMENT_SCOPE_ORDER);
  }, [classroomsQuery.data, departmentsQuery.data, isHandoverPage, scopeType]);
  const scopeDropdownOptions =
    scopeOptions.length > 0 ? scopeOptions : [EMPTY_SCOPE_OPTION];

  useEffect(() => {
    if (!isHandoverPage) return;
    if (scopeOptions.length === 0) {
      setScopeValue("");
      return;
    }

    const currentScopeExists = scopeOptions.some((option) => option.value === scopeValue);
    if (currentScopeExists) return;

    const firstMatchedOption = scopeOptions.find((option) =>
      resolveArchiveChannelByName(channelsQuery.data, `${option.label} ${config.title}`),
    );

    setScopeValue(firstMatchedOption?.value ?? scopeOptions[0]?.value ?? "");
  }, [channelsQuery.data, config.title, isHandoverPage, scopeOptions, scopeValue]);

  const selectedScopeOption = scopeOptions.find((option) => option.value === scopeValue);
  const targetChannelName =
    isHandoverPage && selectedScopeOption ? `${selectedScopeOption.label} ${config.title}` : config.title;
  const channel = useMemo(
    () =>
      isAuthenticated
        ? isHandoverPage
          ? resolveArchiveChannelByName(channelsQuery.data, targetChannelName)
          : resolveArchiveChannel(channelsQuery.data, config)
        : undefined,
    [channelsQuery.data, config, isAuthenticated, isHandoverPage, targetChannelName],
  );
  const channelId = channel?.id ?? (!isHandoverPage && channelsQuery.isError ? config.channelId : undefined);
  const channelType = channel?.channelType;

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.boardList({
      page: requestedPage,
      channelType: channelType ?? "RESOURCE",
      boardScope: `${channelId ?? ""}:${scopeType}:${scopeValue}:${targetChannelName}`,
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
    enabled:
      isAuthenticated &&
      Boolean(channelId) &&
      (!isHandoverPage || Boolean(scopeValue && selectedScopeOption)),
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
    : isHandoverPage && selectedScopeOption && !channel
      ? `${targetChannelName} 채널을 찾지 못했습니다.`
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
      filterSlot={
        isHandoverPage ? (
          <FilterBar aria-label="인수인계서 필터">
            <BoardDropdown
              label="인수인계서 분류 유형"
              options={ARCHIVE_SCOPE_TYPE_OPTIONS}
              value={scopeType}
              isOpen={openDropdown === "type"}
              onToggle={() => setOpenDropdown((current) => (current === "type" ? null : "type"))}
              onSelect={(nextValue) => {
                resetToFirstPage();
                setScopeType(nextValue);
                setScopeValue("");
                setOpenDropdown(null);
                setRefreshNonce((current) => current + 1);
              }}
              width="compact"
            />
            <BoardDropdown
              label="인수인계서 분류 선택"
              options={scopeDropdownOptions}
              value={scopeValue || scopeDropdownOptions[0]?.value || EMPTY_SCOPE_OPTION.value}
              disabled={scopeOptions.length === 0}
              isOpen={openDropdown === "scope"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "scope" || scopeOptions.length === 0 ? null : "scope",
                )
              }
              onSelect={(nextValue) => {
                resetToFirstPage();
                setScopeValue(nextValue);
                setOpenDropdown(null);
                setRefreshNonce((current) => current + 1);
              }}
              width="compact"
            />
          </FilterBar>
        ) : null
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
            aria-label={`${config.title} 검색`}
            placeholder="제목 검색"
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
  border: 0;
  border-bottom: 1px solid #c0c0c0;
  border-radius: 0;
  background: ${colors.white};
  padding: 0.5rem ${spacing.space16};
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};
  outline: none;

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
  background: #414141;
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3rem;
    height: 3rem;
  }
`;
