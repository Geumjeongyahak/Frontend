import { notFound } from "next/navigation";
import BoardDetailPageClient from "@/components/staff/board/BoardDetailPageClient";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    channelId?: string;
    public?: string;
  }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { postId } = await params;
  const resolvedSearchParams = await searchParams;
  const parsedPostId = Number(postId);
  const rawChannelId = resolvedSearchParams?.channelId;
  const parsedChannelId = rawChannelId ? Number(rawChannelId) : undefined;
  const allowPublicNotice = resolvedSearchParams?.public === "1";

  if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
    notFound();
  }

  return (
    <BoardDetailPageClient
      postId={parsedPostId}
      allowPublicNotice={allowPublicNotice}
      channelId={
        Number.isInteger(parsedChannelId) && parsedChannelId && parsedChannelId > 0
          ? parsedChannelId
          : undefined
      }
    />
  );
}
