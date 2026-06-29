export type ArchiveDocumentCategory = "handover" | "exam" | "forms";

export type ArchiveDocumentConfig = {
  category: ArchiveDocumentCategory;
  channelId: number;
  listPath: string;
  title: string;
  writeTitle: string;
  writeLabel: string;
  emptyMessage: string;
  titleTemplate: string;
  fileBaseName: string;
};

export const ARCHIVE_DOCUMENTS_PER_PAGE = 9;

export const archiveDocumentConfigs: Record<ArchiveDocumentCategory, ArchiveDocumentConfig> = {
  handover: {
    category: "handover",
    channelId: 20,
    listPath: "/staff/archive/handover-documents",
    title: "인수인계서",
    writeTitle: "인수인계서 작성하기",
    writeLabel: "인수인계서 작성하기",
    emptyMessage: "인수인계서가 없습니다.",
    titleTemplate: "00반 인수인계서 입니다",
    fileBaseName: "00반 인수인계자료",
  },
  exam: {
    category: "exam",
    channelId: 22,
    listPath: "/staff/archive/exam-materials",
    title: "시험 문제 자료",
    writeTitle: "시험 문제 자료 작성하기",
    writeLabel: "시험 문제 자료 작성하기",
    emptyMessage: "시험 문제 자료가 없습니다.",
    titleTemplate: "00반 시험 문제 자료 입니다",
    fileBaseName: "00반 시험문제자료",
  },
  forms: {
    category: "forms",
    channelId: 23,
    listPath: "/staff/archive/document-forms",
    title: "서류 양식",
    writeTitle: "서류 양식 작성하기",
    writeLabel: "서류 양식 작성하기",
    emptyMessage: "서류 양식이 없습니다.",
    titleTemplate: "서류 양식 자료 입니다",
    fileBaseName: "서류양식자료",
  },
};
