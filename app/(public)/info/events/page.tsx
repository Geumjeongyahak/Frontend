import EventListPageClient from "@/components/info/events/EventListPageClient";
import { getChannels } from "@/api/channel/channel.api";
import { getPosts } from "@/api/post/post.api";
import type { ChannelResponseDto } from "@/api/channel/channel.dto";
import type { PostListResponseDto } from "@/api/post/post.dto";
import {
  EVENT_CHANNEL_TYPE,
  EVENTS_PER_PAGE,
  findEventChannel,
} from "@/components/info/events/eventUtils";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const initialPage = rawPage ? Number(rawPage) : 1;
  let initialChannels: ChannelResponseDto[] | undefined;
  let initialPosts: PostListResponseDto | undefined;

  try {
    initialChannels = await getChannels({ channelType: EVENT_CHANNEL_TYPE, isActive: true });
    const eventChannel = findEventChannel(initialChannels);

    if (typeof eventChannel?.id === "number") {
      initialPosts = await getPosts({
        channelType: EVENT_CHANNEL_TYPE,
        channelId: eventChannel.id,
        status: "PUBLISHED",
        page: Math.max(0, initialPage - 1),
        size: EVENTS_PER_PAGE,
      });
    }
  } catch {
    initialChannels = undefined;
    initialPosts = undefined;
  }

  return (
    <EventListPageClient
      initialPage={initialPage}
      initialChannels={initialChannels}
      initialPosts={initialPosts}
    />
  );
}
