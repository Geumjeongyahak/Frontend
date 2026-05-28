import EventFormPageClient from "@/components/info/events/EventFormPageClient";

type PageProps = {
  searchParams?: Promise<{
    postId?: string;
    channelId?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const postId = Number(resolvedSearchParams?.postId);
  const channelId = Number(resolvedSearchParams?.channelId);

  return (
    <EventFormPageClient
      editPostId={Number.isInteger(postId) && postId > 0 ? postId : undefined}
      editChannelId={Number.isInteger(channelId) && channelId > 0 ? channelId : undefined}
    />
  );
}
