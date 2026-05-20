import type { ChannelResponseDto, ChannelType } from "@/api/channel/channel.dto";
import type { PostSummaryResponseDto } from "@/api/post/post.dto";
import type { ArchiveDocumentConfig } from "@/mocks/archiveDocuments";

export const ARCHIVE_DOCUMENT_CHANNEL_TYPES = ["CUSTOM", "RESOURCE"] as const;

export type ArchiveDocumentChannelType = (typeof ARCHIVE_DOCUMENT_CHANNEL_TYPES)[number];

export function isArchiveDocumentChannelType(
  channelType: ChannelType | null | undefined,
): channelType is ArchiveDocumentChannelType {
  return ARCHIVE_DOCUMENT_CHANNEL_TYPES.includes(channelType as ArchiveDocumentChannelType);
}

export function isArchiveDocumentPost(post: PostSummaryResponseDto) {
  return isArchiveDocumentChannelType(post.channelType);
}

export function resolveArchiveChannel(
  channels: ChannelResponseDto[] | undefined,
  config: ArchiveDocumentConfig,
) {
  const archiveChannels = channels?.filter((channel) =>
    isArchiveDocumentChannelType(channel.channelType),
  );

  return (
    archiveChannels?.find((channel) => channel.name?.trim() === config.title) ??
    archiveChannels?.find((channel) => channel.name?.includes(config.title)) ??
    archiveChannels?.find((channel) => channel.id === config.channelId)
  );
}
