"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import {
  IconCalendarMonth,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { getCurrentUser } from "@/api/user/user.api";
import { createAbsenceRequest, getAbsenceRequestDetail } from "@/api/request/request.api";
import {
  createLessonExchangeRequest,
  getLessonExchangeRequestDetail,
  getLessonExchangeRequests,
} from "@/api/lessonExchange/lessonExchange.api";
import { getAbsenceRequests } from "@/api/request/request.api";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import MobileRequestShell from "@/pwa/requests/components/MobileRequestShell";
import RequestStatusBadge from "@/pwa/requests/components/RequestStatusBadge";
import { getAssignmentClassNames, toExchangeExpiryAt } from "@/pwa/requests/requestFormUtils";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type RequestTab = "exchange" | "absence";
type RequestViewMode = "mine" | "all";
const REQUESTS_PER_PAGE = 10;

function getRequestTime(createdAt?: string, fallbackDate?: string) {
  const time = new Date(createdAt ?? fallbackDate ?? "").getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDetailDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YY.MM.DD") : "-";
}

function formatIsoDateToShort(value?: string) {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YY.MM.DD") : "";
}

function buildPageTokens(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

async function getAllFilteredAbsenceRequests(pageSize: number, keyword?: string) {
  const firstPage = await getAbsenceRequests({
    mine: true,
    keyword,
    page: 0,
    size: pageSize,
  });
  const totalPages = Math.max(firstPage.totalPages ?? 1, 1);

  if (totalPages <= 1) {
    return firstPage;
  }

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getAbsenceRequests({
        mine: true,
        keyword,
        page: index + 1,
        size: pageSize,
      }),
    ),
  );

  const content = [firstPage.content ?? [], ...restPages.map((page) => page.content ?? [])].flat();

  return {
    ...firstPage,
    content,
    page: 0,
    size: pageSize,
    totalElements: content.length,
    totalPages,
  };
}

function normalizeIdentity(value?: string) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

function isCurrentUserRequest(
  requestedById: number | undefined,
  requestedByName: string | undefined,
  user: {
    id?: number;
    name?: string;
    nickname?: string;
    email?: string;
  } | null,
) {
  if (!user) {
    return false;
  }

  if (typeof requestedById === "number" && typeof user.id === "number") {
    return requestedById === user.id;
  }

  if (!requestedByName) {
    return false;
  }

  const normalizedRequester = normalizeIdentity(requestedByName);
  const emailLocalPart =
    typeof user.email === "string" && user.email.includes("@")
      ? user.email.split("@")[0]
      : undefined;
  const candidates = [user.name, user.nickname, user.email, emailLocalPart]
    .map(normalizeIdentity)
    .filter((value) => value.length > 0);

  return candidates.some(
    (value) =>
      value === normalizedRequester ||
      normalizedRequester.includes(value) ||
      value.includes(normalizedRequester),
  );
}

export default function MobileClassRequestsPage() {
  const exchangeLessonDateInputRef = useRef<HTMLInputElement>(null);
  const exchangeExpireDateInputRef = useRef<HTMLInputElement>(null);
  const absenceLessonDateInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { status, user, refreshSession } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());
  const isAuthPending = status === "loading" || (status === "error" && hasStoredToken);
  const [activeTab, setActiveTab] = useState<RequestTab>("exchange");
  const [viewMode, setViewMode] = useState<RequestViewMode>("all");
  const [exchangePage, setExchangePage] = useState(1);
  const [absencePage, setAbsencePage] = useState(1);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ type: RequestTab; id: number } | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [exchangeForm, setExchangeForm] = useState({
    title: "",
    className: "",
    lessonDate: "",
    expiresOn: "",
    content: "",
  });
  const [absenceForm, setAbsenceForm] = useState({
    title: "",
    className: "",
    lessonDate: "",
    reason: "",
  });

  const currentUserQuery = useQuery({
    queryKey: [...queryKeys.user.me(), "class-request-mobile"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (status === "error" && hasStoredToken) {
      refreshSession().catch(() => undefined);
    }
  }, [hasStoredToken, refreshSession, status]);

  const exchangeListQuery = useQuery({
    queryKey: [
      ...queryKeys.requests.lessonExchangeList(),
      "mobile",
      viewMode,
      searchKeyword,
      exchangePage,
      REQUESTS_PER_PAGE,
    ],
    queryFn: () =>
      getLessonExchangeRequests({
        mine: viewMode === "mine" ? true : undefined,
        keyword: searchKeyword || undefined,
        page: exchangePage - 1,
        size: REQUESTS_PER_PAGE,
      }),
    enabled: isAuthenticated,
    retry: false,
  });

  const exchangeMineCountQuery = useQuery({
    queryKey: [...queryKeys.requests.lessonExchangeList(), "mobile", "mine-count"],
    queryFn: () =>
      getLessonExchangeRequests({
        mine: true,
        page: 0,
        size: 1,
      }),
    enabled: isAuthenticated,
    retry: false,
  });

  const absenceListQuery = useQuery({
    queryKey: [
      ...queryKeys.requests.absenceList(),
      "mobile",
      viewMode,
      searchKeyword,
      absencePage,
      REQUESTS_PER_PAGE,
    ],
    queryFn: () =>
      getAbsenceRequests({
        mine: viewMode === "mine" ? true : undefined,
        keyword: searchKeyword || undefined,
        page: absencePage - 1,
        size: REQUESTS_PER_PAGE,
      }),
    enabled: isAuthenticated,
    retry: false,
  });

  const absenceMineListQuery = useQuery({
    queryKey: [
      ...queryKeys.requests.absenceList(),
      "mobile",
      "mine-list",
      searchKeyword,
      REQUESTS_PER_PAGE,
    ],
    queryFn: () => getAllFilteredAbsenceRequests(REQUESTS_PER_PAGE, searchKeyword || undefined),
    enabled: isAuthenticated,
    retry: false,
  });

  const exchangeDetailQuery = useQuery({
    queryKey: queryKeys.requests.lessonExchangeDetail(
      selectedRequest?.type === "exchange" ? selectedRequest.id : 0,
    ),
    queryFn: () =>
      getLessonExchangeRequestDetail({
        requestId: selectedRequest?.id as number,
      }),
    enabled: isAuthenticated && selectedRequest?.type === "exchange",
    retry: false,
  });

  const absenceDetailQuery = useQuery({
    queryKey: queryKeys.requests.absenceDetail(
      selectedRequest?.type === "absence" ? selectedRequest.id : 0,
    ),
    queryFn: () =>
      getAbsenceRequestDetail({
        requestId: selectedRequest?.id as number,
      }),
    enabled: isAuthenticated && selectedRequest?.type === "absence",
    retry: false,
  });

  const exchangeCreateMutation = useMutation({
    mutationFn: createLessonExchangeRequest,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      toast.success("수업 교환 신청서를 제출했습니다.");
      setShowComposer(false);
      setExchangeForm({
        title: "",
        className: assignmentClassNames[0] ?? "",
        lessonDate: "",
        expiresOn: "",
        content: "",
      });

      if (typeof created.id === "number") {
        setSelectedRequest({ type: "exchange", id: created.id });
        setActiveTab("exchange");
      }
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "수업 교환 신청서 제출에 실패했습니다."));
    },
  });

  const absenceCreateMutation = useMutation({
    mutationFn: createAbsenceRequest,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.absenceList(),
      });
      toast.success("결강 신청서를 제출했습니다.");
      setShowComposer(false);
      setAbsenceForm({
        title: "",
        className: assignmentClassNames[0] ?? "",
        lessonDate: "",
        reason: "",
      });

      if (typeof created.id === "number") {
        setSelectedRequest({ type: "absence", id: created.id });
        setActiveTab("absence");
      }
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "결강 신청서 제출에 실패했습니다."));
    },
  });

  const currentUser = currentUserQuery.data ?? user;
  const assignmentClassNames = getAssignmentClassNames(currentUser?.teacherAssignments);
  const fallbackClassName = currentUser?.classroom?.name?.trim() || "";
  const resolvedExchangeClassName =
    exchangeForm.className || assignmentClassNames[0] || fallbackClassName || "담당 반 정보 없음";
  const resolvedAbsenceClassName =
    absenceForm.className || assignmentClassNames[0] || fallbackClassName || "담당 반 정보 없음";
  const hasCurrentUserIdentity = Boolean(
    typeof currentUser?.id === "number" ||
    typeof currentUser?.name === "string" ||
    typeof currentUser?.nickname === "string" ||
    typeof currentUser?.email === "string",
  );

  const exchangeRequests = [...(exchangeListQuery.data?.content ?? [])].sort(
    (left, right) => getRequestTime(right.createdAt) - getRequestTime(left.createdAt),
  );
  const absenceRequests = [...(absenceListQuery.data?.content ?? [])].sort(
    (left, right) =>
      getRequestTime(right.createdAt, right.lessonDate) -
      getRequestTime(left.createdAt, left.lessonDate),
  );
  const myAbsenceRequests = [...(absenceMineListQuery.data?.content ?? [])]
    .filter((request) =>
      isCurrentUserRequest(request.requestedById, request.requestedByName, currentUser),
    )
    .sort(
      (left, right) =>
        getRequestTime(right.createdAt, right.lessonDate) -
        getRequestTime(left.createdAt, left.lessonDate),
    );
  const paginatedMyAbsenceRequests = myAbsenceRequests.slice(
    (absencePage - 1) * REQUESTS_PER_PAGE,
    absencePage * REQUESTS_PER_PAGE,
  );
  const activeRequests =
    activeTab === "exchange"
      ? exchangeRequests
      : viewMode === "mine"
        ? paginatedMyAbsenceRequests
        : absenceRequests;
  const exchangeDetail =
    selectedRequest?.type === "exchange" ? exchangeDetailQuery.data : undefined;
  const absenceDetail = selectedRequest?.type === "absence" ? absenceDetailQuery.data : undefined;
  const activeDetail = exchangeDetail ?? absenceDetail;
  const activeDetailLoading =
    selectedRequest?.type === "exchange"
      ? exchangeDetailQuery.isLoading
      : absenceDetailQuery.isLoading;
  const activeLoading =
    activeTab === "exchange"
      ? exchangeListQuery.isLoading
      : viewMode === "mine"
        ? absenceMineListQuery.isLoading || currentUserQuery.isLoading || !hasCurrentUserIdentity
        : absenceListQuery.isLoading;
  const currentPage = activeTab === "exchange" ? exchangePage : absencePage;
  const totalPages =
    activeTab === "exchange"
      ? Math.max(1, exchangeListQuery.data?.totalPages ?? 1)
      : viewMode === "mine"
        ? Math.max(1, Math.ceil(myAbsenceRequests.length / REQUESTS_PER_PAGE))
        : Math.max(1, absenceListQuery.data?.totalPages ?? 1);
  const pageTokens = buildPageTokens(currentPage, totalPages);

  const canSubmitExchange =
    exchangeForm.title.trim().length > 0 &&
    exchangeForm.lessonDate.length > 0 &&
    exchangeForm.expiresOn.length > 0 &&
    exchangeForm.content.trim().length > 0 &&
    !exchangeCreateMutation.isPending;
  const canSubmitAbsence =
    absenceForm.title.trim().length > 0 &&
    absenceForm.lessonDate.length > 0 &&
    absenceForm.reason.trim().length > 0 &&
    !absenceCreateMutation.isPending;

  useEffect(() => {
    const nextClassName = assignmentClassNames[0] || fallbackClassName;

    if (!nextClassName) {
      return;
    }

    setExchangeForm((current) =>
      current.className ? current : { ...current, className: nextClassName },
    );
    setAbsenceForm((current) =>
      current.className ? current : { ...current, className: nextClassName },
    );
  }, [assignmentClassNames, fallbackClassName]);

  function handleSelectRequest(type: RequestTab, id?: number) {
    if (typeof id !== "number") {
      return;
    }

    setSelectedRequest((current) =>
      current?.type === type && current.id === id ? null : { type, id },
    );
  }

  function handleExchangeLessonDateChange(value: string) {
    const expiresOn = value ? dayjs(value).subtract(3, "day").format("YYYY-MM-DD") : "";

    setExchangeForm((current) => ({
      ...current,
      lessonDate: value,
      expiresOn,
    }));
  }

  function openDatePicker(inputRef: React.RefObject<HTMLInputElement | null>) {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function submitExchange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitExchange) {
      return;
    }

    exchangeCreateMutation.mutate({
      title: exchangeForm.title.trim(),
      content: exchangeForm.content.trim(),
      lessonDate: exchangeForm.lessonDate,
      expiresAt: toExchangeExpiryAt(exchangeForm.expiresOn),
    });
  }

  function submitAbsence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitAbsence) {
      return;
    }

    absenceCreateMutation.mutate({
      title: absenceForm.title.trim(),
      lessonDate: absenceForm.lessonDate,
      reason: absenceForm.reason.trim(),
    });
  }

  function handleChangeViewMode(nextMode: RequestViewMode) {
    setSelectedRequest(null);
    setViewMode(nextMode);
    setExchangePage(1);
    setAbsencePage(1);
  }

  function handleChangePage(nextPage: number) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setSelectedRequest(null);

    if (activeTab === "exchange") {
      setExchangePage(safePage);
      return;
    }

    setAbsencePage(safePage);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextKeyword = searchInput.trim();
    setSelectedRequest(null);
    setExchangePage(1);
    setAbsencePage(1);
    setSearchKeyword(nextKeyword);
  }

  return (
    <MobileRequestShell
      backHref="/"
      title="교환 · 결강 신청"
      action={
        <HeaderActionButton
          type="button"
          onClick={() => setShowComposer((current) => !current)}
          disabled={!isAuthenticated}
        >
          <IconPlus size={18} stroke={2.1} />
          <span>{showComposer ? "닫기" : "작성"}</span>
        </HeaderActionButton>
      }
    >
      {isAuthPending ? (
        <LoadingPanel>
          <AuthStatusSpinner />
          <LoadingText>로그인 상태를 확인하는 중입니다.</LoadingText>
        </LoadingPanel>
      ) : null}

      {!isAuthPending && !isAuthenticated ? (
        <StatePanel>
          <StateTitle>로그인이 필요한 메뉴입니다.</StateTitle>
          <StateDescription>
            교원 계정으로 로그인하면 교환/결강 신청과 진행 상태를 확인할 수 있습니다.
          </StateDescription>
          <PrimaryLink href="/login">로그인하기</PrimaryLink>
        </StatePanel>
      ) : null}

      {isAuthenticated ? (
        <>
          <SummaryPanel>
            <SummaryCard>
              <SummaryLabel>나의 교환 신청</SummaryLabel>
              <SummaryValue>
                {exchangeMineCountQuery.isLoading
                  ? "-"
                  : (exchangeMineCountQuery.data?.totalElements ?? 0)}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>나의 결강 신청</SummaryLabel>
              <SummaryValue>
                {absenceMineListQuery.isLoading ||
                currentUserQuery.isLoading ||
                !hasCurrentUserIdentity
                  ? "-"
                  : myAbsenceRequests.length}
              </SummaryValue>
            </SummaryCard>
          </SummaryPanel>

          <Panel>
            <TabRow>
              <TabButton
                type="button"
                $active={activeTab === "exchange"}
                onClick={() => {
                  setSelectedRequest(null);
                  setActiveTab("exchange");
                }}
              >
                교환 신청
              </TabButton>
              <TabButton
                type="button"
                $active={activeTab === "absence"}
                onClick={() => {
                  setSelectedRequest(null);
                  setActiveTab("absence");
                }}
              >
                결강 신청
              </TabButton>
            </TabRow>
          </Panel>

          {showComposer ? (
            <ComposerPanel>
              <PanelTitle>
                {activeTab === "exchange" ? "새 교환 신청서" : "새 결강 신청서"}
              </PanelTitle>

              {activeTab === "exchange" ? (
                <Form onSubmit={submitExchange}>
                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-exchange-title">제목</FieldLabel>
                    <TextInput
                      id="mobile-exchange-title"
                      placeholder="예: 7월 둘째 주 수업 교환 요청"
                      value={exchangeForm.title}
                      onChange={(event) =>
                        setExchangeForm((current) => ({ ...current, title: event.target.value }))
                      }
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-exchange-class">반 이름</FieldLabel>
                    {assignmentClassNames.length > 1 ? (
                      <Select
                        id="mobile-exchange-class"
                        value={exchangeForm.className || assignmentClassNames[0] || ""}
                        onChange={(event) =>
                          setExchangeForm((current) => ({
                            ...current,
                            className: event.target.value,
                          }))
                        }
                      >
                        {assignmentClassNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <ReadOnlyInput
                        id="mobile-exchange-class"
                        value={resolvedExchangeClassName}
                        readOnly
                      />
                    )}
                  </FieldGroup>

                  <TwoColumn>
                    <FieldGroup>
                      <FieldLabel htmlFor="mobile-exchange-lesson-date">수업 일자</FieldLabel>
                      <DateFieldRow>
                        <DateDisplayInput
                          id="mobile-exchange-lesson-date"
                          type="text"
                          inputMode="none"
                          placeholder="선택해 주세요"
                          value={formatIsoDateToShort(exchangeForm.lessonDate)}
                          readOnly
                          onClick={() => openDatePicker(exchangeLessonDateInputRef)}
                        />
                        <HiddenNativeDateInput
                          ref={exchangeLessonDateInputRef}
                          type="date"
                          value={exchangeForm.lessonDate}
                          onChange={(event) => handleExchangeLessonDateChange(event.target.value)}
                          aria-hidden="true"
                          tabIndex={-1}
                        />
                        <DatePickerButton
                          type="button"
                          aria-label="수업 일자 달력 열기"
                          onClick={() => openDatePicker(exchangeLessonDateInputRef)}
                        >
                          <IconCalendarMonth size={18} stroke={2} />
                        </DatePickerButton>
                      </DateFieldRow>
                    </FieldGroup>

                    <FieldGroup>
                      <FieldLabel htmlFor="mobile-exchange-expire-date">만료일</FieldLabel>
                      <DateFieldRow>
                        <DateDisplayInput
                          id="mobile-exchange-expire-date"
                          type="text"
                          inputMode="none"
                          placeholder="선택해 주세요"
                          value={formatIsoDateToShort(exchangeForm.expiresOn)}
                          readOnly
                          onClick={() => openDatePicker(exchangeExpireDateInputRef)}
                        />
                        <HiddenNativeDateInput
                          ref={exchangeExpireDateInputRef}
                          type="date"
                          value={exchangeForm.expiresOn}
                          max={
                            exchangeForm.lessonDate
                              ? dayjs(exchangeForm.lessonDate)
                                  .subtract(3, "day")
                                  .format("YYYY-MM-DD")
                              : undefined
                          }
                          onChange={(event) =>
                            setExchangeForm((current) => ({
                              ...current,
                              expiresOn: event.target.value,
                            }))
                          }
                          aria-hidden="true"
                          tabIndex={-1}
                        />
                        <DatePickerButton
                          type="button"
                          aria-label="만료일 달력 열기"
                          onClick={() => openDatePicker(exchangeExpireDateInputRef)}
                        >
                          <IconCalendarMonth size={18} stroke={2} />
                        </DatePickerButton>
                      </DateFieldRow>
                    </FieldGroup>
                  </TwoColumn>

                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-exchange-content">교환 사유</FieldLabel>
                    <TextArea
                      id="mobile-exchange-content"
                      placeholder="교환 신청 사유와 필요한 전달 사항을 적어 주세요."
                      value={exchangeForm.content}
                      onChange={(event) =>
                        setExchangeForm((current) => ({ ...current, content: event.target.value }))
                      }
                    />
                  </FieldGroup>

                  <PrimaryButton type="submit" disabled={!canSubmitExchange}>
                    {exchangeCreateMutation.isPending ? "제출 중..." : "교환 신청서 제출"}
                  </PrimaryButton>
                </Form>
              ) : (
                <Form onSubmit={submitAbsence}>
                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-absence-title">제목</FieldLabel>
                    <TextInput
                      id="mobile-absence-title"
                      placeholder="예: 개인 일정으로 인한 결강 신청"
                      value={absenceForm.title}
                      onChange={(event) =>
                        setAbsenceForm((current) => ({ ...current, title: event.target.value }))
                      }
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-absence-class">반 이름</FieldLabel>
                    {assignmentClassNames.length > 1 ? (
                      <Select
                        id="mobile-absence-class"
                        value={absenceForm.className || assignmentClassNames[0] || ""}
                        onChange={(event) =>
                          setAbsenceForm((current) => ({
                            ...current,
                            className: event.target.value,
                          }))
                        }
                      >
                        {assignmentClassNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <ReadOnlyInput
                        id="mobile-absence-class"
                        value={resolvedAbsenceClassName}
                        readOnly
                      />
                    )}
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-absence-lesson-date">수업 일자</FieldLabel>
                    <DateFieldRow>
                      <DateDisplayInput
                        id="mobile-absence-lesson-date"
                        type="text"
                        inputMode="none"
                        placeholder="선택해 주세요"
                        value={formatIsoDateToShort(absenceForm.lessonDate)}
                        readOnly
                        onClick={() => openDatePicker(absenceLessonDateInputRef)}
                      />
                      <HiddenNativeDateInput
                        ref={absenceLessonDateInputRef}
                        type="date"
                        value={absenceForm.lessonDate}
                        onChange={(event) =>
                          setAbsenceForm((current) => ({
                            ...current,
                            lessonDate: event.target.value,
                          }))
                        }
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <DatePickerButton
                        type="button"
                        aria-label="수업 일자 달력 열기"
                        onClick={() => openDatePicker(absenceLessonDateInputRef)}
                      >
                        <IconCalendarMonth size={18} stroke={2} />
                      </DatePickerButton>
                    </DateFieldRow>
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="mobile-absence-reason">결강 사유</FieldLabel>
                    <TextArea
                      id="mobile-absence-reason"
                      placeholder="결강이 필요한 이유를 적어 주세요."
                      value={absenceForm.reason}
                      onChange={(event) =>
                        setAbsenceForm((current) => ({ ...current, reason: event.target.value }))
                      }
                    />
                  </FieldGroup>

                  <PrimaryButton type="submit" disabled={!canSubmitAbsence}>
                    {absenceCreateMutation.isPending ? "제출 중..." : "결강 신청서 제출"}
                  </PrimaryButton>
                </Form>
              )}
            </ComposerPanel>
          ) : null}

          <Panel>
            <PanelTitleRow>
              <PanelTitle>
                {activeTab === "exchange" ? "교환 신청 내역" : "결강 신청 내역"}
              </PanelTitle>
              <ViewModeLabel>
                <span>{viewMode === "mine" ? "나의 신청 내역" : "전체 신청 내역"}</span>
                <SwitchInput
                  type="checkbox"
                  aria-label="나의 신청 내역만 보기"
                  checked={viewMode === "mine"}
                  onChange={(event) => handleChangeViewMode(event.target.checked ? "mine" : "all")}
                />
                <SwitchTrack aria-hidden="true">
                  <SwitchThumb />
                </SwitchTrack>
              </ViewModeLabel>
            </PanelTitleRow>
            <SearchForm role="search" onSubmit={handleSearch}>
              <SearchInput
                type="search"
                placeholder="반 or 제목 or 내용 or 작성자"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <SearchButton type="submit" aria-label="검색">
                <IconSearch size={18} stroke={2.25} />
              </SearchButton>
            </SearchForm>

            {activeLoading ? (
              <EmptyText>신청 내역을 불러오는 중입니다.</EmptyText>
            ) : activeRequests.length === 0 ? (
              <EmptyText>
                {activeTab === "exchange"
                  ? "아직 등록된 교환 신청이 없습니다."
                  : "아직 등록된 결강 신청이 없습니다."}
              </EmptyText>
            ) : (
              <RequestList>
                {activeRequests.map((request) => {
                  const isOpen =
                    selectedRequest?.type === activeTab && selectedRequest.id === request.id;

                  return (
                    <RequestCard key={`${activeTab}-${request.id}`}>
                      <RequestButton
                        type="button"
                        $expanded={isOpen}
                        onClick={() => handleSelectRequest(activeTab, request.id)}
                      >
                        <RequestMain>
                          <RequestTopRow>
                            <RequestStatusBadge
                              label={formatRequestStatus(request.status)}
                              status={request.status}
                            />
                            <RequestDate>
                              {formatUtcToKstShortDate(request.createdAt ?? request.lessonDate)}
                            </RequestDate>
                          </RequestTopRow>
                          <RequestTitle>{request.title ?? "제목 없음"}</RequestTitle>
                          <RequestMeta>
                            {request.classroomName ? <span>{request.classroomName}</span> : null}
                            {request.requestedByName ? (
                              <span>{request.requestedByName}</span>
                            ) : null}
                            {request.lessonDate ? <strong>{request.lessonDate}</strong> : null}
                          </RequestMeta>
                        </RequestMain>
                        <ChevronWrap $expanded={isOpen}>
                          <IconChevronDown size={18} stroke={2.1} />
                        </ChevronWrap>
                      </RequestButton>

                      {isOpen ? (
                        <RequestDetail>
                          {activeDetailLoading ? (
                            <DetailMuted>상세 정보를 불러오는 중입니다.</DetailMuted>
                          ) : activeDetail ? (
                            <>
                              <DetailGrid>
                                <DetailField>
                                  <DetailLabel>상태</DetailLabel>
                                  <DetailStatusText $status={activeDetail.status}>
                                    {formatRequestStatus(activeDetail.status)}
                                  </DetailStatusText>
                                </DetailField>
                                <DetailField>
                                  <DetailLabel>수업 일자</DetailLabel>
                                  <DetailValue>
                                    {formatDetailDate(activeDetail.lessonDate)}
                                  </DetailValue>
                                </DetailField>
                                <DetailField>
                                  <DetailLabel>반 이름</DetailLabel>
                                  <DetailValue>{activeDetail.classroomName ?? "-"}</DetailValue>
                                </DetailField>
                                <DetailField>
                                  <DetailLabel>신청 일시</DetailLabel>
                                  <DetailValue>
                                    {formatDetailDate(activeDetail.createdAt)}
                                  </DetailValue>
                                </DetailField>
                                {selectedRequest?.type === "exchange" ? (
                                  <DetailField>
                                    <DetailLabel>만료일</DetailLabel>
                                    <DetailValue>
                                      {selectedRequest?.type === "exchange"
                                        ? formatDetailDate(exchangeDetail?.expiresAt)
                                        : "-"}
                                    </DetailValue>
                                  </DetailField>
                                ) : null}
                              </DetailGrid>

                              <DetailBlock>
                                <DetailLabel>
                                  {selectedRequest?.type === "exchange" ? "교환 사유" : "결강 사유"}
                                </DetailLabel>
                                <DetailBody>
                                  {selectedRequest?.type === "exchange"
                                    ? (exchangeDetail?.content ?? "-")
                                    : (absenceDetail?.reason ?? "-")}
                                </DetailBody>
                              </DetailBlock>

                              {selectedRequest?.type === "exchange" &&
                              exchangeDetail?.status === "APPROVED" &&
                              typeof exchangeDetail.id === "number" ? (
                                <DetailActionRow>
                                  <DetailLinkButton
                                    href={`/requests/class/${exchangeDetail.id}/proposals`}
                                  >
                                    {isCurrentUserRequest(
                                      exchangeDetail.requestedById,
                                      exchangeDetail.requestedByName,
                                      currentUser,
                                    )
                                      ? "교환 제안 내역"
                                      : "교환 제안하기"}
                                  </DetailLinkButton>
                                </DetailActionRow>
                              ) : null}
                            </>
                          ) : (
                            <DetailMuted>상세 정보를 불러오지 못했습니다.</DetailMuted>
                          )}
                        </RequestDetail>
                      ) : null}
                    </RequestCard>
                  );
                })}
              </RequestList>
            )}

            {!activeLoading && activeRequests.length > 0 ? (
              <PaginationRow aria-label="페이지 이동">
                <PageArrowButton
                  type="button"
                  onClick={() => handleChangePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="이전 페이지"
                >
                  <IconChevronLeft size={18} stroke={2.1} />
                </PageArrowButton>
                {pageTokens.map((token, index) =>
                  token === "ellipsis" ? (
                    <PageEllipsis key={`ellipsis-${index}`}>...</PageEllipsis>
                  ) : (
                    <PageNumberButton
                      key={`${activeTab}-${viewMode}-${token}`}
                      type="button"
                      $active={token === currentPage}
                      onClick={() => handleChangePage(token as number)}
                    >
                      {token}
                    </PageNumberButton>
                  ),
                )}
                <PageArrowButton
                  type="button"
                  onClick={() => handleChangePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                >
                  <IconChevronRight size={18} stroke={2.1} />
                </PageArrowButton>
              </PaginationRow>
            ) : null}
          </Panel>
        </>
      ) : null}
    </MobileRequestShell>
  );
}

const HeaderActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.5rem;
  padding: 0 0.95rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
  }
`;

const StatePanel = styled.section`
  display: grid;
  gap: ${spacing.space12};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const LoadingPanel = styled(StatePanel)`
  justify-items: center;
  align-content: center;
  min-height: 16rem;
`;

const LoadingText = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const StateTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const StateDescription = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 ${spacing.space20};
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  text-decoration: none;
`;

const SummaryPanel = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const SummaryCard = styled.div`
  display: grid;
  gap: ${spacing.space8};
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0.75rem 1.75rem rgba(0, 0, 0, 0.05);
`;

const SummaryLabel = styled.span`
  color: #6b7665;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const SummaryValue = styled.strong`
  color: ${colors.text};
  font-size: ${typography.fontSize20};
  font-weight: 800;
  line-height: 1.2;
`;

const Panel = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const ComposerPanel = styled(Panel)`
  gap: ${spacing.space20};
`;

const PanelTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const PanelTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: ${spacing.space8};
  margin-top: -${spacing.space4};
`;

const TabRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const ViewModeLabel = styled.label`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${spacing.space8};
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const SwitchInput = styled.input`
  position: absolute;
  opacity: 0;

  &:checked + span {
    background-color: #eef9e6;
  }

  &:checked + span span {
    transform: translateX(1.125rem);
    background-color: ${colors.point};
  }

  &:focus-visible + span {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }
`;

const SwitchTrack = styled.span`
  position: relative;
  display: inline-flex;
  width: 2.625rem;
  height: 1.5rem;
  border-radius: ${radii.radius999};
  background-color: #d9d9d9;
  transition: background-color 0.2s ease;
`;

const SwitchThumb = styled.span`
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: #616161;
  transition: transform 0.2s ease;
`;

const TabButton = styled.button<{ $active: boolean }>`
  min-height: 3rem;
  border: 1px solid ${({ $active }) => ($active ? colors.point : "#d7ddd3")};
  border-radius: ${radii.radius15};
  background: ${({ $active }) => ($active ? colors.pointSoft : colors.white)};
  color: ${({ $active }) => ($active ? "#4f8f27" : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: 800;
`;

const Form = styled.form`
  display: grid;
  gap: ${spacing.space16};
`;

const FieldGroup = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const FieldLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const fieldStyle = `
  width: 100%;
  min-height: 3rem;
  padding: 0 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  outline: none;

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const TextInput = styled.input`
  ${fieldStyle}

  &::placeholder {
    color: ${colors.placeholder};
  }
`;

const SearchInput = styled(TextInput)`
  min-width: 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  padding: 0.875rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  outline: none;
  resize: vertical;

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const Select = styled.select`
  ${fieldStyle}
  appearance: none;
`;

const ReadOnlyInput = styled(TextInput)`
  color: #61705b;
`;

const DateInput = styled(TextInput)`
  cursor: pointer;
`;

const DateFieldRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
`;

const DateDisplayInput = styled(TextInput)`
  cursor: pointer;
`;

const HiddenNativeDateInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
`;

const DatePickerButton = styled.button`
  position: absolute;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: ${colors.point};
  cursor: pointer;
`;

const TwoColumn = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 26rem) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryButton = styled.button`
  min-height: 3.125rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  min-height: 3rem;
  border: 0;
  border-radius: ${radii.radius15};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
`;

const EmptyText = styled.p`
  color: #72806a;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  text-align: center;
  padding: ${spacing.space20} 0;
`;

const RequestList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const PaginationRow = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  margin-top: ${spacing.space8};
`;

const PageArrowButton = styled.button`
  border: 0;
  background: transparent;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;

  &:disabled {
    opacity: 0.35;
  }
`;

const PageNumberButton = styled.button<{ $active: boolean }>`
  min-width: 2rem;
  min-height: 2rem;
  border: 0;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? colors.pointSoft : "transparent")};
  color: ${({ $active }) => ($active ? "#4f8f27" : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
`;

const PageEllipsis = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const RequestCard = styled.article`
  border: 1px solid #e5e8e1;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fcfdfb;
`;

const RequestButton = styled.button<{ $expanded: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  width: 100%;
  padding: 1rem 2.75rem 1rem 1rem;
  border: 0;
  background: ${({ $expanded }) => ($expanded ? "#f7fbf2" : "transparent")};
  text-align: left;
`;

const RequestMain = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const RequestTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const RequestDate = styled.span`
  color: #80907a;
  font-size: ${typography.fontSize13};
  font-weight: 600;
`;

const RequestTitle = styled.h3`
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: 1.35;
  word-break: keep-all;
`;

const RequestMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: #6b7665;
  font-size: ${typography.fontSize13};

  strong {
    color: #4f8f27;
  }
`;

const ChevronWrap = styled.span<{ $expanded: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7665;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

const RequestDetail = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 1rem 1rem 1rem;
  border-top: 1px solid #eef1eb;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const DetailField = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const DetailLabel = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const DetailValue = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const DetailStatusText = styled.span<{ $status?: string }>`
  color: ${({ $status }) =>
    $status === "APPROVED" || $status === "COMPLETED"
      ? "#4f8f27"
      : $status === "REJECTED" || $status === "EXPIRED" || $status === "CANCELLED"
        ? colors.notice
        : "#7c866f"};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const DetailBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const DetailBody = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
`;

const DetailMuted = styled.p`
  color: #72806a;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const DetailActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DetailLinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  padding: 0 ${spacing.space20};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 800;
  text-decoration: none;
`;
