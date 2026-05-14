import ListPanel, { type ListPanelRow } from "@/components/staff/ListPanel";
import {
  ARCHIVE_DOCUMENTS_PER_PAGE,
  type ArchiveDocument,
  type ArchiveDocumentConfig,
} from "@/mocks/archiveDocuments";

type ArchiveDocumentListPageProps = {
  config: ArchiveDocumentConfig;
  currentPage: number;
  documents: ArchiveDocument[];
  mineOnly: boolean;
  totalPages: number;
};

export default function ArchiveDocumentListPage({
  config,
  currentPage,
  documents,
  mineOnly,
  totalPages,
}: ArchiveDocumentListPageProps) {
  const rows: ListPanelRow[] = documents.map((document, index) => ({
    id: document.id,
    no: String((currentPage - 1) * ARCHIVE_DOCUMENTS_PER_PAGE + index + 1).padStart(2, "0"),
    className: "",
    title: document.title,
    author: document.author,
    date: document.date,
    status: "",
    detailHref: `${config.listPath}/${document.id}`,
  }));

  return (
    <ListPanel
      title={config.title}
      writeLabel={config.writeLabel}
      writeHref={`${config.listPath}/new`}
      listPath={config.listPath}
      rows={rows}
      currentPage={currentPage}
      totalPages={totalPages}
      mineOnly={mineOnly}
      emptyMessage={config.emptyMessage}
      headerTone="archive"
      showClassColumn={false}
      showStatusColumn={false}
    />
  );
}
