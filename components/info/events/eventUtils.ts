import type { ChannelResponseDto } from "@/api/channel/channel.dto";
import type { PostDetailResponseDto, PostSummaryResponseDto } from "@/api/post/post.dto";

export const EVENT_CHANNEL_TYPE = "EVENT";
export const EVENT_FETCH_SIZE = 100;
export const EVENTS_PER_PAGE = 6;

export function getEventPostTime(post: PostSummaryResponseDto) {
  const dateValue = post.createdAt ?? post.updatedAt;
  if (!dateValue) return 0;

  const time = new Date(dateValue).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function sortEventPosts(posts: PostSummaryResponseDto[]) {
  return [...posts].sort((a, b) => getEventPostTime(b) - getEventPostTime(a));
}

export function findEventChannel(channels?: ChannelResponseDto[]) {
  return channels?.find((channel) => channel.channelType === EVENT_CHANNEL_TYPE && channel.isDefault)
    ?? channels?.find((channel) => channel.channelType === EVENT_CHANNEL_TYPE)
    ?? channels?.find((channel) => channel.name === "행사 정보");
}

export function canManageEventPost(
  user: {
    id?: number;
    role?: string;
    name?: string;
    nickname?: string;
    email?: string;
  } | null | undefined,
  post: Pick<PostDetailResponseDto | PostSummaryResponseDto, "authorId" | "authorName"> | null | undefined,
) {
  if (!user || !post) return false;
  if (user.role === "ADMIN") return true;
  if (typeof user.id === "number" && post.authorId === user.id) return true;

  return Boolean(
    post.authorName &&
      (post.authorName === user.name ||
        post.authorName === user.nickname ||
        post.authorName === user.email),
  );
}

export function extractFirstImageUrl(contentHtml: string) {
  if (!contentHtml.trim() || typeof window === "undefined") return "";

  const document = new DOMParser().parseFromString(contentHtml, "text/html");
  const image = document.querySelector("img[src]");
  return image?.getAttribute("src")?.trim() ?? "";
}
