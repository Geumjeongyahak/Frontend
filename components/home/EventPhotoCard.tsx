"use client";

import { useMemo } from "react";
import { IconPhoto } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getPosts } from "@/api/post/post.api";
import type { PostSummaryResponseDto } from "@/api/post/post.dto";
import HomeCard from "@/components/home/HomeCard";
import {
  EVENT_CHANNEL_TYPE,
  EVENT_FETCH_SIZE,
  findEventChannel,
  sortEventPosts,
} from "@/components/info/events/eventUtils";
import { queryKeys } from "@/lib/queryKeys";
import { colors, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const HOME_EVENT_PHOTO_LIMIT = 3;

function buildEventHref(post: PostSummaryResponseDto, fallbackChannelId?: number) {
  const postId = post.id;
  if (typeof postId !== "number") return "/info/events";

  const channelId = typeof post.channelId === "number" ? post.channelId : fallbackChannelId;
  return typeof channelId === "number"
    ? `/info/events/${postId}?channelId=${channelId}`
    : `/info/events/${postId}`;
}

export default function EventPhotoCard() {
  const channelsQuery = useQuery({
    queryKey: queryKeys.posts.eventChannels(),
    queryFn: () => getChannels({ channelType: EVENT_CHANNEL_TYPE, isActive: true }),
    retry: false,
  });

  const eventChannel = findEventChannel(channelsQuery.data);

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.eventHomePhotos(eventChannel?.id),
    queryFn: () =>
      getPosts({
        channelType: EVENT_CHANNEL_TYPE,
        channelId: eventChannel?.id,
        status: "PUBLISHED",
        page: 0,
        size: EVENT_FETCH_SIZE,
      }),
    enabled: typeof eventChannel?.id === "number",
    retry: false,
  });

  const photos = useMemo(
    () => sortEventPosts(postsQuery.data?.content ?? []).slice(0, HOME_EVENT_PHOTO_LIMIT),
    [postsQuery.data?.content],
  );
  const isLoading = channelsQuery.isLoading || postsQuery.isLoading;
  const isError = channelsQuery.isError || postsQuery.isError;
  const stateMessage = isLoading
    ? "행사 사진을 불러오는 중입니다."
    : isError
      ? "행사 사진을 불러오지 못했습니다."
      : "등록된 행사 사진이 없습니다.";

  return (
    <Card title="행사 사진" actionLabel="더보기" actionHref="/info/events">
      {photos.length > 0 ? (
        <PhotoGrid>
          {photos.map((photo, index) => {
            const title = photo.title ?? "제목 없음";
            const date = formatUtcToKstShortDate(photo.createdAt ?? photo.updatedAt);

            return (
              <PhotoItem
                key={`${photo.id ?? "event"}-${photo.channelId ?? "channel"}-${index}`}
                href={buildEventHref(photo, eventChannel?.id)}
              >
                <Thumbnail>
                  {photo.thumbnailUrl ? (
                    <PhotoImage src={photo.thumbnailUrl} alt={title} />
                  ) : (
                    <ThumbnailPlaceholder aria-hidden="true">
                      <IconPhoto size={28} stroke={1.8} />
                    </ThumbnailPlaceholder>
                  )}
                </Thumbnail>
                <PhotoTitle>{title}</PhotoTitle>
                <PhotoDate>{date}</PhotoDate>
              </PhotoItem>
            );
          })}
        </PhotoGrid>
      ) : (
        <Fallback>{stateMessage}</Fallback>
      )}
    </Card>
  );
}

const Card = styled(HomeCard)``;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space47};
  }

  @media (max-width: 37.5rem) {
    grid-template-columns: 1fr;
  }
`;

const PhotoItem = styled(Link)`
  display: block;
  min-width: 0;
  color: inherit;
  text-decoration: none;

  &:hover h3 {
    color: ${colors.point};
  }
`;

const Thumbnail = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1.56 / 1;
  margin-bottom: ${spacing.space12};
  border: 0;
  border-radius: 0;
  background-color: #d9d9d9;

  @media (min-width: 120rem) {
    margin-bottom: ${spacing.space16};
  }
`;

const PhotoImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${colors.placeholder};
`;

const PhotoTitle = styled.h3`
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const PhotoDate = styled.time`
  display: inline-block;
  margin-top: ${spacing.space4};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
  font-weight: 300;

  @media (min-width: 120rem) {
    margin-top: ${spacing.space8};
    font-size: ${typography.fontSize20};
  }
`;

const Fallback = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  padding: ${spacing.space8} 0;
`;
