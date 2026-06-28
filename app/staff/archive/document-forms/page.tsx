import { redirect } from "next/navigation";
import ArchiveDocumentListPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentListPage";
import { archiveDocumentConfigs } from "@/config/archiveDocuments";

type PageProps = {
  searchParams?: Promise<{
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

  return <ArchiveDocumentListPage config={config} initialPage={parsedPage} />;
}
