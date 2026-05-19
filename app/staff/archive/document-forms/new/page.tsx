import ArchiveDocumentFormPage from "@/components/staff/archive/archive-document-section/ArchiveDocumentFormPage";
import { archiveDocumentConfigs } from "@/mocks/archiveDocuments";

export default function Page() {
  return <ArchiveDocumentFormPage config={archiveDocumentConfigs.forms} />;
}
