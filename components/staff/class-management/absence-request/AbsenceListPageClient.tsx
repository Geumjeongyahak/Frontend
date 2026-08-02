"use client";

import { useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getAbsenceRequests } from "@/api/request/request.api";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatRequestStatus, normalizeRequestStatusTone } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const ITEMS_PER_PAGE = 9;
const STABLE_TABLE_ROWS = 9;

function getRequestTime(createdAt?: string) {
  if (!createdAt) return 0;

  const time = new Date(createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default function AbsenceListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus } = useAuthSession();
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const isAuthenticated = authStatus === "authenticated";
  const rawPage = searchParams.get("page");
  const mineOnly = searchParams.get("mineOnly") === "1";
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const requestedPage = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const {
    data: absenceRequestPage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      ...queryKeys.requests.absenceList(),
      requestedPage,
      ITEMS_PER_PAGE,
      mineOnly,
      searchKeyword,
    ],
    queryFn: () =>
      getAbsenceRequests({
        mine: mineOnly,
        keyword: searchKeyword.trim() || undefined,
        page: requestedPage - 1,
        size: ITEMS_PER_PAGE,
      }),
    enabled: isAuthenticated,
    retry: false,
    placeholderData: (previousData, previousQuery) => {
      if (!previousQuery) {
        return undefined;
      }

      return previousQuery.queryKey[0] === "absence-requests" &&
      previousQuery.queryKey[2] === ITEMS_PER_PAGE &&
      previousQuery.queryKey[3] === mineOnly &&
      previousQuery.queryKey[4] === searchKeyword
        ? previousData
        : undefined;
    },
  });

  const absenceRequests = [...(isAuthenticated ? (absenceRequestPage?.content ?? []) : [])].sort(
    (a, b) =>
      getRequestTime(b.createdAt ?? b.lessonDate) - getRequestTime(a.createdAt ?? a.lessonDate),
  );
  const totalPages = Math.max(1, isAuthenticated ? (absenceRequestPage?.totalPages ?? 1) : 1);
  const totalCount = isAuthenticated
    ? (absenceRequestPage?.totalElements ?? absenceRequests.length)
    : 0;

  const currentPage = requestedPage <= totalPages ? requestedPage : totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const rows: ListPanelRow[] = absenceRequests.map((item, index) => ({
    id: item.id ?? startIndex + index + 1,
    no: String(Math.max(1, totalCount - (startIndex + index))).padStart(2, "0"),
    className: item.classroomName ?? "-",
    title: item.title ?? item.reason ?? "제목 없음",
    author: item.requestedByName ?? "-",
    date: formatUtcToKstShortDate(item.createdAt ?? item.lessonDate),
    status: formatRequestStatus(item.status),
    statusType: normalizeRequestStatusTone(item.status),
    detailHref: `/staff/class-management/absence-request/${item.id ?? ""}`,
  }));

  const emptyMessage =
    authStatus === "loading"
      ? "사용자 정보를 확인하는 중입니다."
      : !isAuthenticated
        ? "로그인이 필요합니다."
        : isLoading
          ? "결강 신청 내역을 불러오는 중입니다."
          : isError
            ? "결강 신청 내역을 불러오지 못했습니다."
            : "결강 신청 내역이 없습니다.";

  return (
    <ListPanel
      title="수업 결강"
      writeLabel="수업 결강 신청하기"
      writeHref="/staff/class-management/absence-request/new"
      showWriteButton={isAuthenticated}
      listPath="/staff/class-management/absence-request"
      rows={isAuthenticated ? rows : []}
      currentPage={currentPage}
      totalPages={totalPages}
      stableTableRows={STABLE_TABLE_ROWS}
      mineOnly={mineOnly}
      emptyMessage={emptyMessage}
      headerTone="journal"
      lineTone="muted"
      writeTone="archive"
      writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
      searchSlot={
        <SearchForm
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setSearchKeyword(searchInput);
            if (requestedPage > 1) {
              router.replace("/staff/class-management/absence-request", { scroll: false });
            }
          }}
        >
          <SearchInput
            aria-label="수업 결강 신청 검색"
            placeholder="반 or 제목 or 내용 or 작성자 검색"
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
