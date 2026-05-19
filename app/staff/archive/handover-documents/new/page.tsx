import ArchiveDocumentFormPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentFormPage";
import { archiveDocumentConfigs } from "@/mocks/archiveDocuments";

type PageProps = {
  searchParams?: Promise<{
    channelId?: string;
    postId?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const postId = resolvedSearchParams?.postId ? Number(resolvedSearchParams.postId) : undefined;
  const channelId = resolvedSearchParams?.channelId
    ? Number(resolvedSearchParams.channelId)
    : undefined;

  return (
    <ArchiveDocumentFormPage
      config={archiveDocumentConfigs.handover}
      editPostId={Number.isInteger(postId) ? postId : undefined}
      editChannelId={Number.isInteger(channelId) ? channelId : undefined}
    />
  );
}
