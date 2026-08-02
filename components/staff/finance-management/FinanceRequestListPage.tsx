"use client";

import { useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { getPurchaseRequests } from "@/api/request/request.api";
import type { PaymentType, PurchaseRequestStatus } from "@/api/request/request.dto";
import BoardDropdown, { type DropdownOption } from "@/components/staff/board/BoardDropdown";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { FINANCE_REQUESTS_PER_PAGE } from "@/components/staff/finance-management/financeRequestConstants";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestListPageProps = {
  currentPage: number;
  initialKeyword: string;
  initialPaymentType?: PaymentType;
};

type PaymentTypeFilter = "all" | PaymentType;
type OpenDropdown = "paymentType" | null;

const paymentTypeFilterOptions: readonly DropdownOption<PaymentTypeFilter>[] = [
  { label: "전체", value: "all" },
  { label: "선금 결제", value: "PREPAID" },
  { label: "실 결제", value: "ACTUAL" },
] as const;

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

function getAffiliationLabel(request: {
  departmentName?: string | null;
  classroomName?: string | null;
}) {
  return request.classroomName ?? request.departmentName ?? "-";
}

function getPaymentTypeLabel(paymentType?: PaymentType) {
  if (paymentType === "PREPAID") return "선금 결제";
  if (paymentType === "ACTUAL") return "실 결제";
  return "-";
}

function getListPaymentType(request: {
  paymentType?: PaymentType;
  items?: { paymentType?: PaymentType }[];
  content?: string;
}) {
  if (request.paymentType) {
    return request.paymentType;
  }

  const itemPaymentType = request.items?.find((item) => item.paymentType)?.paymentType;
  if (itemPaymentType) {
    return itemPaymentType;
  }

  if (request.content?.includes("결제 유형: 선금 결제")) {
    return "PREPAID";
  }

  if (request.content?.includes("결제 유형: 실 결제")) {
    return "ACTUAL";
  }

  return undefined;
}

function buildFinanceListUrl(keyword: string, paymentType: PaymentTypeFilter) {
  const trimmedKeyword = keyword.trim();
  const params = new URLSearchParams();

  if (trimmedKeyword) params.set("keyword", trimmedKeyword);
  if (paymentType !== "all") params.set("paymentType", paymentType);

  const query = params.toString();
  return query ? `/staff/finance-management?${query}` : "/staff/finance-management";
}

export default function FinanceRequestListPage({
  currentPage,
  initialKeyword,
  initialPaymentType,
}: FinanceRequestListPageProps) {
  const router = useRouter();
  const { status: authStatus } = useAuthSession();
  const [mineOnly, setMineOnly] = useState(false);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentTypeFilter>(
    initialPaymentType ?? "all",
  );
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const isAuthenticated = authStatus === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());
  const trimmedKeyword = searchKeyword.trim();
  const requestListParams = {
    mine: mineOnly || undefined,
    paymentType: paymentTypeFilter === "all" ? undefined : paymentTypeFilter,
    keyword: trimmedKeyword || undefined,
    page: currentPage - 1,
    size: FINANCE_REQUESTS_PER_PAGE,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.purchaseList(requestListParams),
    queryFn: () => getPurchaseRequests(requestListParams),
    enabled: hasStoredToken,
    retry: false,
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[1] as
        | Omit<typeof requestListParams, "page">
        | undefined;

      return previousQuery?.queryKey[0] === "purchase-requests" &&
        previousParams?.mine === requestListParams.mine &&
        previousParams?.paymentType === requestListParams.paymentType &&
        previousParams?.keyword === requestListParams.keyword &&
        previousParams?.size === requestListParams.size
        ? previousData
        : undefined;
    },
  });

  const requests = (isAuthenticated ? (data?.content ?? []) : []).sort(
    (a, b) => getRequestTime(b.createdAt) - getRequestTime(a.createdAt),
  );
  const totalPages = Math.max(1, isAuthenticated ? (data?.totalPages ?? 1) : 1);
  const totalCount = isAuthenticated ? (data?.totalElements ?? requests.length) : 0;
  const safeCurrentPage =
    Number.isInteger(currentPage) && currentPage >= 1 && currentPage <= totalPages
      ? currentPage
      : 1;

  const rows: ListPanelRow[] = requests.map((request, index) => ({
    id: request.id ?? index,
    no: String(
      Math.max(1, totalCount - ((safeCurrentPage - 1) * FINANCE_REQUESTS_PER_PAGE + index)),
    ).padStart(2, "0"),
    className: getAffiliationLabel(request),
    title: request.title ?? "제목 없음",
    author: request.requestedByName ?? "-",
    date: formatUtcToKstShortDate(request.createdAt),
    extra: getPaymentTypeLabel(getListPaymentType(request as never)),
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
            persistentQuery={{
              keyword: trimmedKeyword || undefined,
              paymentType: paymentTypeFilter === "all" ? undefined : paymentTypeFilter,
            }}
            showExtraColumn
            extraHeader="결제 유형"
            classHeader="소속"
            showMineOnlyToggle
            toggleLabel="내가 작성한 글만 보기"
            toggleAriaLabel="내가 작성한 글만 보기"
            onMineOnlyToggle={() => {
              setMineOnly((current) => !current);
            }}
            emptyMessage={emptyMessage}
            headerTone="archive"
            writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
            filterSlot={
              <FilterBar aria-label="결제 신청 필터">
                <BoardDropdown
                  label="결제 유형"
                  options={paymentTypeFilterOptions}
                  value={paymentTypeFilter}
                  isOpen={openDropdown === "paymentType"}
                  onToggle={() =>
                    setOpenDropdown((current) =>
                      current === "paymentType" ? null : "paymentType",
                    )
                  }
                  onSelect={(nextValue) => {
                    setPaymentTypeFilter(nextValue);
                    setOpenDropdown(null);
                    router.replace(buildFinanceListUrl(trimmedKeyword, nextValue), { scroll: false });
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
                  const nextKeyword = searchInput.trim();
                  setSearchKeyword(nextKeyword);
                  router.replace(buildFinanceListUrl(nextKeyword, paymentTypeFilter), { scroll: false });
                }}
              >
                <SearchInput
                  aria-label="결제 신청 검색"
                  placeholder="소속 or 제목 or 작성자 검색"
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

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (max-width: ${layout.breakpointMobile}) {
    align-items: stretch;
    flex-direction: column;
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
