import ArchiveDocumentFormPage from "@/components/archive/document/ArchiveDocumentFormPage";
import { archiveDocumentConfigs } from "@/mocks/archiveDocuments";

export default function Page() {
  return <ArchiveDocumentFormPage config={archiveDocumentConfigs.exam} />;
}
