"use client";

import { type FormEvent, useMemo, useState } from "react";
import { IconEdit, IconPhoto, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getPosts } from "@/api/post/post.api";
import type { PostSummaryResponseDto } from "@/api/post/post.dto";
import EventInfoLayout from "@/components/info/events/EventInfoLayout";
import {
  EVENT_CHANNEL_TYPE,
  EVENT_FETCH_SIZE,
  EVENTS_PER_PAGE,
  findEventChannel,
} from "@/components/info/events/eventUtils";
import { ActionLink } from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type EventListPageClientProps = {
  initialPage: number;
};

function getPostTime(post: PostSummaryResponseDto) {
  const dateValue = post.createdAt ?? post.updatedAt;
  if (!dateValue) return 0;

  const time = new Date(dateValue).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortEventPosts(posts: PostSummaryResponseDto[]) {
  return [...posts].sort((a, b) => getPostTime(b) - getPostTime(a));
}

export default function EventListPageClient({ initialPage }: EventListPageClientProps) {
  const router = useRouter();
  const { status } = useAuthSession();
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const requestedPage = Number.isInteger(initialPage) && initialPage >= 1 ? initialPage : 1;

  const channelsQuery = useQuery({
    queryKey: ["info", "events", "channels"],
    queryFn: () => getChannels({ channelType: EVENT_CHANNEL_TYPE, isActive: true }),
    retry: false,
  });

  const eventChannel = findEventChannel(channelsQuery.data);

  const postsQuery = useQuery({
    queryKey: ["info", "events", "posts", eventChannel?.id, searchKeyword],
    queryFn: () =>
      getPosts({
        channelType: EVENT_CHANNEL_TYPE,
        channelId: eventChannel?.id,
        title: searchKeyword.trim() || undefined,
        status: "PUBLISHED",
        page: 0,
        size: EVENT_FETCH_SIZE,
      }),
    enabled: typeof eventChannel?.id === "number",
    retry: false,
  });

  const sortedPosts = useMemo(
    () => sortEventPosts(postsQuery.data?.content ?? []),
    [postsQuery.data?.content],
  );
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / EVENTS_PER_PAGE));
  const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  const pagedPosts = sortedPosts.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE,
  );
  const canWrite = status === "authenticated";
  const isLoading = channelsQuery.isLoading || postsQuery.isLoading;
  const isError = channelsQuery.isError || postsQuery.isError;
  const emptyMessage = isLoading
    ? "행사 정보를 불러오는 중입니다."
    : isError
      ? "행사 정보를 불러오지 못했습니다."
      : "등록된 행사 정보가 없습니다.";

  function moveToPage(page: number) {
    if (page === currentPage) return;
    router.push(`/info/events?page=${page}`);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchKeyword(searchInput);
    if (currentPage > 1) {
      router.replace("/info/events", { scroll: false });
    }
  }

  return (
    <EventInfoLayout>
      <Content>
        <HeaderRow>
          <Title>행사 정보</Title>
          {canWrite ? (
            <WriteLink href="/info/events/new" $variant="edit">
              <span>행사 정보 추가하기</span>
              <IconEdit aria-hidden="true" size={16} stroke={2} />
            </WriteLink>
          ) : null}
        </HeaderRow>

        <CardsSection>
          {pagedPosts.length > 0 ? (
            <EventGrid aria-label="행사 정보 목록">
              {pagedPosts.map((post, index) => {
                const postId = post.id ?? index;
                const href = `/info/events/${postId}${
                  typeof post.channelId === "number" ? `?channelId=${post.channelId}` : ""
                }`;

                return (
                  <EventCard key={`${postId}-${post.channelId ?? "event"}`} href={href}>
                    {post.thumbnailUrl ? (
                      <ThumbnailImage src={post.thumbnailUrl} alt="" />
                    ) : (
                      <ThumbnailPlaceholder aria-hidden="true">
                        <IconPhoto size={28} stroke={1.8} />
                      </ThumbnailPlaceholder>
                    )}
                    <CardMeta>
                      <CardTitle>{post.title ?? "제목 없음"}</CardTitle>
                      <CardInfo>
                        <Author>{post.authorName ?? "-"}</Author>
                        <DateText>
                          {formatUtcToKstShortDate(post.createdAt ?? post.updatedAt)}
                        </DateText>
                      </CardInfo>
                    </CardMeta>
                  </EventCard>
                );
              })}
            </EventGrid>
          ) : (
            <EmptyState>{emptyMessage}</EmptyState>
          )}
        </CardsSection>

        <FooterBar>
          <Pagination aria-label="행사 정보 페이지">
            <PageButton
              type="button"
              disabled={currentPage <= 1}
              onClick={() => moveToPage(currentPage - 1)}
              aria-label="이전 페이지"
            >
              ◀
            </PageButton>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 5)
              .map((page) => (
                <PageNumber
                  key={page}
                  type="button"
                  $isCurrent={page === currentPage}
                  onClick={() => moveToPage(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </PageNumber>
              ))}
            <PageButton
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => moveToPage(currentPage + 1)}
              aria-label="다음 페이지"
            >
              ▶
            </PageButton>
          </Pagination>

          <SearchForm role="search" onSubmit={handleSearch}>
            <SearchInput
              aria-label="행사 정보 검색"
              placeholder="검색어를 입력해주세요"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <SearchButton type="submit" aria-label="검색">
              <IconSearch size={18} stroke={2.25} />
            </SearchButton>
          </SearchForm>
        </FooterBar>
      </Content>
    </EventInfoLayout>
  );
}

const Content = styled.section`
  flex: 1;
  min-width: 0;
  padding: 2.1875rem 3.125rem 4rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 2.75rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.5rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

const WriteLink = styled(ActionLink)`
  gap: ${spacing.space8};
`;

const CardsSection = styled.section`
  width: 100%;
  min-height: 25rem;

  @media (min-width: 120rem) {
    min-height: 39.75rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    min-height: 32rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    min-height: 42rem;
  }
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem 2.75rem;

  @media (min-width: 120rem) {
    gap: 3.75rem 3.875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const EventCard = styled(Link)`
  display: grid;
  gap: 0.875rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;

  &:hover h3 {
    color: ${colors.point};
  }
`;

const ThumbnailImage = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 160 / 90;
  object-fit: cover;
  background-color: #d9d9d9;
`;

const ThumbnailPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 160 / 90;
  background-color: #d9d9d9;
  color: ${colors.placeholder};
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  min-width: 0;
`;

const CardTitle = styled.h3`
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #000000;
  font-size: ${typography.fontSize16};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space12};
  flex: 0 0 auto;
  min-width: 0;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const Author = styled.span`
  color: #000000;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const DateText = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const EmptyState = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  min-height: 25rem;
  color: ${colors.placeholder};
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight150};
  text-align: center;

  @media (min-width: 120rem) {
    min-height: 39.75rem;
    font-size: ${typography.fontSize20};
  }
`;

const FooterBar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: ${spacing.space24};
  margin-top: 2.75rem;

  @media (min-width: 120rem) {
    margin-top: 4rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
    justify-items: start;
  }
`;

const Pagination = styled.nav`
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};

  @media (max-width: ${layout.breakpointTablet}) {
    grid-column: auto;
  }
`;

const PageButton = styled.button`
  border: 0;
  background: transparent;
  color: ${colors.muted};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight100};
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const PageNumber = styled.button<{ $isCurrent: boolean }>`
  border: 0;
  background: transparent;
  color: ${({ $isCurrent }) => ($isCurrent ? "#000000" : colors.muted)};
  font-family: inherit;
  font-size: ${typography.fontSize16};
  font-weight: ${({ $isCurrent }) => ($isCurrent ? 600 : 400)};
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const SearchForm = styled.form`
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  @media (max-width: ${layout.breakpointTablet}) {
    grid-column: auto;
    justify-self: stretch;
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

  @media (max-width: ${layout.breakpointTablet}) {
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
