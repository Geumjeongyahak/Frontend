import { notFound } from "next/navigation";
import ArchiveDocumentDetailPage from "@/components/archive/ArchiveDocumentDetailPage";
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

const config = archiveDocumentConfigs.handover;

export function generateStaticParams() {
  return getArchiveDocuments("handover").map((document) => ({
    postId: String(document.id),
  }));
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const document = getArchiveDocumentById("handover", Number(postId));

  if (!document) {
    notFound();
  }

  return <ArchiveDocumentDetailPage config={config} document={document} />;
}
