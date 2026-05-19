import { redirect } from "next/navigation";
import ArchiveDocumentListPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentListPage";
import { ARCHIVE_DOCUMENTS_PER_PAGE, archiveDocumentConfigs } from "@/mocks/archiveDocuments";
import { getChannelPosts } from "@/api/post/post.api";

type PageProps = {
  searchParams?: Promise<{
    mineOnly?: string;
    page?: string;
  }>;
};

const config = archiveDocumentConfigs.forms;

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const parsedPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    redirect(config.listPath);
  }

  const mineOnly = resolvedSearchParams?.mineOnly === "1";

  const response = await getChannelPosts(
    {
      channelId: config.channelId,
    },
    {
      page: parsedPage - 1,
      size: ARCHIVE_DOCUMENTS_PER_PAGE,
    },
  );

  const documents =
    response.content?.map((post) => ({
      id: post.id ?? 0,
      title: post.title ?? "",
      author: post.authorName ?? "",
      date: post.createdAt?.slice(0, 10) ?? "",
    })) ?? [];

  const totalPages = response.totalPages ?? 1;

  if (parsedPage > totalPages) {
    redirect(config.listPath);
  }

  return (
    <ArchiveDocumentListPage
      config={config}
      currentPage={parsedPage}
      documents={documents}
      mineOnly={mineOnly}
      totalPages={totalPages}
    />
  );
}
