import { redirect } from "next/navigation";
import ArchiveDocumentListPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentListPage";
import { getChannelPosts } from "@/api/post/post.api";
import { ARCHIVE_DOCUMENTS_PER_PAGE, archiveDocumentConfigs } from "@/mocks/archiveDocuments";

type PageProps = {
  searchParams?: Promise<{
    mineOnly?: string;
    page?: string;
  }>;
};

const config = archiveDocumentConfigs.handover;

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const parsedPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    redirect(config.listPath);
  }

  const mineOnly = resolvedSearchParams?.mineOnly === "1";
  let response: Awaited<ReturnType<typeof getChannelPosts>> | undefined;

  try {
    response = await getChannelPosts(
      {
        channelId: config.channelId,
      },
      {
        page: parsedPage - 1,
        size: ARCHIVE_DOCUMENTS_PER_PAGE,
      },
    );
  } catch (error) {
    console.error("게시글 조회 실패:", error);
    response = undefined;
  }

  const documents =
    response?.content?.map((post) => ({
      id: post.id ?? 0,
      title: post.title ?? "",
      author: post.authorName ?? "",
      date: post.createdAt?.slice(0, 10) ?? "",
    })) ?? [];

  const totalPages = Math.max(1, response?.totalPages ?? 1);

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
