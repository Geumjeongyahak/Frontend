import { redirect } from "next/navigation";
import ArchiveDocumentListPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentListPage";
import {
  ARCHIVE_DOCUMENTS_PER_PAGE,
  archiveDocumentConfigs,
  getArchiveDocuments,
} from "@/mocks/archiveDocuments";

type PageProps = {
  searchParams?: Promise<{
    mineOnly?: string;
    page?: string;
  }>;
};

const config = archiveDocumentConfigs.exam;

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const parsedPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  const mineOnly = resolvedSearchParams?.mineOnly === "1";
  const filteredDocuments = mineOnly
    ? getArchiveDocuments("exam").filter((document) => document.author === "홍길동")
    : getArchiveDocuments("exam");
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / ARCHIVE_DOCUMENTS_PER_PAGE));

  if (!Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages) {
    redirect(config.listPath);
  }

  const startIndex = (parsedPage - 1) * ARCHIVE_DOCUMENTS_PER_PAGE;
  const documents = filteredDocuments.slice(startIndex, startIndex + ARCHIVE_DOCUMENTS_PER_PAGE);

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
