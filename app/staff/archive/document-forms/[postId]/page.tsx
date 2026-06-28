import { notFound } from "next/navigation";
import ArchiveDocumentDetailPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentDetailPage";
import { archiveDocumentConfigs } from "@/config/archiveDocuments";

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
  const parsedChannelId = resolvedSearchParams?.channelId
    ? Number(resolvedSearchParams.channelId)
    : undefined;

  if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
    notFound();
  }

  return (
    <ArchiveDocumentDetailPage
      config={archiveDocumentConfigs.forms}
      postId={parsedPostId}
      channelId={Number.isInteger(parsedChannelId) ? parsedChannelId : undefined}
    />
  );
}
