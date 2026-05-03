import ArchiveDocumentFormPage from "@/components/archive/ArchiveDocumentFormPage";
import { archiveDocumentConfigs } from "@/mocks/archiveDocuments";

export default function Page() {
  return <ArchiveDocumentFormPage config={archiveDocumentConfigs.forms} />;
}
