import { notFound } from "next/navigation";
import BoardDetailPageClient from "@/components/board/BoardDetailPageClient";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    channelId?: string;
  }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { postId } = await params;
  const resolvedSearchParams = await searchParams;
  const parsedPostId = Number(postId);
  const rawChannelId = resolvedSearchParams?.channelId;
  const parsedChannelId = rawChannelId ? Number(rawChannelId) : undefined;

  if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
    notFound();
  }

  return (
    <BoardDetailPageClient
      postId={parsedPostId}
      channelId={
        Number.isInteger(parsedChannelId) && parsedChannelId && parsedChannelId > 0
          ? parsedChannelId
          : undefined
      }
    />
  );
}
