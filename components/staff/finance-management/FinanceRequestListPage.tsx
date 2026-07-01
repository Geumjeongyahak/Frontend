"use client";

import { useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { getPurchaseRequests } from "@/api/request/request.api";
import type { PurchaseRequestStatus } from "@/api/request/request.dto";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { FINANCE_REQUESTS_PER_PAGE } from "@/components/staff/finance-management/financeRequestConstants";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestListPageProps = {
  currentPage: number;
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  PENDING: "대기 중",
  APPROVED: "승인 완료",
  PURCHASED: "구매 완료",
  CONFIRMED: "결재 확인",
  REJECTED: "거절",
};

function getStatusLabel(status?: PurchaseRequestStatus) {
  return status ? (statusLabels[status] ?? status) : "-";
}

function getRequestTime(createdAt?: string) {
  if (!createdAt) return 0;

  const time = new Date(createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getAffiliationLabel(request: { departmentName?: string; classroomName?: string }) {
  return request.departmentName ?? request.classroomName ?? "-";
}

export default function FinanceRequestListPage({ currentPage }: FinanceRequestListPageProps) {
  const router = useRouter();
  const { user, status: authStatus } = useAuthSession();
  const [mineOnly, setMineOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const isAuthenticated = authStatus === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.purchaseList(),
    queryFn: () => getPurchaseRequests(),
    enabled: hasStoredToken,
    retry: false,
  });

  const resetToFirstPage = () => {
    if (currentPage > 1) {
      router.replace("/staff/finance-management", { scroll: false });
    }
  };

  const currentAuthor = user?.name ?? user?.nickname ?? user?.email;
  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const requests = (isAuthenticated ? (data ?? []) : [])
    .filter((request) => {
      const matchesMine =
        !mineOnly ||
        Boolean(
          currentAuthor &&
          (request.requestedByName === user?.name ||
            request.requestedByName === user?.nickname ||
            request.requestedByName === user?.email),
        );
      const statusLabel = getStatusLabel(request.status);
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        [
          request.title,
          getAffiliationLabel(request),
          request.requestedByName,
          statusLabel,
          formatUtcToKstShortDate(request.createdAt),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedKeyword));

      return matchesMine && matchesKeyword;
    })
    .sort((a, b) => getRequestTime(b.createdAt) - getRequestTime(a.createdAt));
  const totalPages = Math.max(1, Math.ceil(requests.length / FINANCE_REQUESTS_PER_PAGE));
  const safeCurrentPage =
    Number.isInteger(currentPage) && currentPage >= 1 && currentPage <= totalPages
      ? currentPage
      : 1;
  const startIndex = (safeCurrentPage - 1) * FINANCE_REQUESTS_PER_PAGE;
  const visibleRequests = requests.slice(startIndex, startIndex + FINANCE_REQUESTS_PER_PAGE);

  const rows: ListPanelRow[] = visibleRequests.map((request, index) => ({
    id: request.id ?? index,
    no: String(Math.max(1, requests.length - (startIndex + index))).padStart(2, "0"),
    className: getAffiliationLabel(request),
    title: request.title ?? "제목 없음",
    author: request.requestedByName ?? "-",
    date: formatUtcToKstShortDate(request.createdAt),
    status: getStatusLabel(request.status),
    statusType: request.status,
    detailHref: `/staff/finance-management/${request.id}`,
  }));

  const emptyMessage =
    authStatus === "loading"
      ? "사용자 정보를 확인하는 중입니다."
      : !hasStoredToken
        ? "로그인이 필요합니다."
        : isLoading
          ? "결제 신청 내역을 불러오는 중입니다."
          : isError
            ? "결제 신청 내역을 불러오지 못했습니다."
            : "결제 신청 내역이 없습니다.";

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <ListPanel
            title="결제 신청"
            writeLabel="결제 신청 하기"
            writeHref="/staff/finance-management/new"
            showWriteButton={isAuthenticated}
            listPath="/staff/finance-management"
            rows={isAuthenticated ? rows : []}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            stableTableRows={FINANCE_REQUESTS_PER_PAGE}
            mineOnly={mineOnly}
            classHeader="소속"
            showMineOnlyToggle
            toggleLabel="내가 작성한 글만 보기"
            toggleAriaLabel="내가 작성한 글만 보기"
            onMineOnlyToggle={() => {
              resetToFirstPage();
              setMineOnly((current) => !current);
            }}
            emptyMessage={emptyMessage}
            headerTone="archive"
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
                  aria-label="결제 신청 검색"
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
        </Content>
      </Stage>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const Stage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
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
