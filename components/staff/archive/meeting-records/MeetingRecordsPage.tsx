"use client";

import { useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getMeetingRecords } from "@/api/meetingRecord/meetingRecord.api";
import type { MeetingRecordStatus } from "@/api/meetingRecord/meetingRecord.dto";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type MeetingRecordsPageProps = {
  initialPage: number;
  initialMineOnly: boolean;
};

const MEETING_RECORDS_PER_PAGE = 10;

function getStatusLabel(status?: MeetingRecordStatus) {
  if (status === "AFTER_MEETING") return "회의 후";
  return "회의 전";
}

export default function MeetingRecordsPage({
  initialPage,
  initialMineOnly,
}: MeetingRecordsPageProps) {
  const router = useRouter();
  const { status: authStatus } = useAuthSession();
  const [mineOnly, setMineOnly] = useState(initialMineOnly);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const isAuthenticated = authStatus === "authenticated";

  const requestedPage = Number.isInteger(initialPage) && initialPage >= 1 ? initialPage : 1;
  const resetToFirstPage = () => {
    if (requestedPage > 1) {
      router.replace("/staff/archive/meeting-records", { scroll: false });
    }
  };

  const queryParams = {
    page: Math.max(0, requestedPage - 1),
    size: MEETING_RECORDS_PER_PAGE,
    keyword: searchKeyword.trim() || undefined,
    mineOnly,
  };
  const { data, isError, isLoading } = useQuery({
    queryKey: queryKeys.meetingRecords.list(queryParams),
    queryFn: () => getMeetingRecords(queryParams),
    enabled: isAuthenticated,
    retry: false,
    placeholderData: (previousData, previousQuery) => {
      if (!previousQuery) {
        return undefined;
      }

      const previousParams = previousQuery?.queryKey[2] as
        | Omit<typeof queryParams, "page">
        | undefined;

      return previousQuery?.queryKey[0] === "meeting-records" &&
        previousQuery.queryKey[1] === "list" &&
        previousParams?.size === queryParams.size &&
        previousParams?.keyword === queryParams.keyword &&
        previousParams?.mineOnly === queryParams.mineOnly
        ? previousData
        : undefined;
    },
  });

  const totalElements = isAuthenticated ? (data?.totalElements ?? data?.content?.length ?? 0) : 0;
  const totalPages = Math.max(1, isAuthenticated ? (data?.totalPages ?? 1) : 1);
  const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  const records = isAuthenticated ? (data?.content ?? []) : [];

  const rows: ListPanelRow[] = records.map((minute, index) => ({
    id: minute.id ?? index,
    no: String(Math.max(1, totalElements - ((currentPage - 1) * MEETING_RECORDS_PER_PAGE + index))).padStart(
      2,
      "0",
    ),
    className: "",
    title: minute.title ?? "-",
    author: minute.author ?? "-",
    date: formatUtcToKstShortDate(minute.createdAt),
    status: getStatusLabel(minute.status),
    statusType: minute.status,
    detailHref: `/staff/archive/meeting-records/${minute.id}`,
  }));

  return (
    <ListPanel
      title="교학 회의록"
      writeLabel="교학 회의록 작성하기"
      writeHref="/staff/archive/meeting-records/new"
      showWriteButton={isAuthenticated}
      listPath="/staff/archive/meeting-records"
      rows={isLoading || isError ? [] : rows}
      currentPage={currentPage}
      totalPages={totalPages}
      stableTableRows={MEETING_RECORDS_PER_PAGE}
      mineOnly={mineOnly}
      showMineOnlyToggle
      toggleLabel="내가 작성한 글만 보기"
      toggleAriaLabel="내가 작성한 글만 보기"
      onMineOnlyToggle={() => {
        resetToFirstPage();
        setMineOnly((current) => !current);
      }}
      emptyMessage={
        authStatus === "loading"
          ? "사용자 정보를 확인하는 중입니다."
          : !isAuthenticated
            ? "로그인이 필요합니다."
            : isLoading
              ? "교학 회의록을 불러오는 중입니다."
              : isError
                ? "교학 회의록을 불러오지 못했습니다."
                : "교학 회의록이 없습니다."
      }
      headerTone="archive"
      showClassColumn={false}
      statusHeader="구분"
      writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
      searchSlot={
        <SearchForm
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            resetToFirstPage();
            setSearchKeyword(searchInput);
          }}
        >
          <SearchInput
            aria-label="교학 회의록 검색"
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
