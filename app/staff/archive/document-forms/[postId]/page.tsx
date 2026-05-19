import { notFound } from "next/navigation";
import ArchiveDocumentDetailPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentDetailPage";
import {
  archiveDocumentConfigs,
  getArchiveDocumentById,
  getArchiveDocuments,
} from "@/mocks/archiveDocuments";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

const config = archiveDocumentConfigs.forms;

export function generateStaticParams() {
  return getArchiveDocuments("forms").map((document) => ({
    postId: String(document.id),
  }));
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const document = getArchiveDocumentById("forms", Number(postId));

  if (!document) {
    notFound();
  }

  return <ArchiveDocumentDetailPage config={config} document={document} />;
}
